import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, emailVerificationLog } from "@/lib/db/schema/auth";
import { auth } from "@/core/auth";
import { config } from "@/core/config";
import { generateSecureToken, hashToken } from "@/modules/email/email.encryption";
import { defaultEmailService } from "@/modules/email";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { checkInMemoryRateLimit } from "@/core/security/rate-limit";
import { getClientIdentifier } from "@/core/security/ratelimit";
import { checkRateLimit } from "@/core/security/rate-limiter";
import { getClientIp } from "@/core/security/security-utils";
import { logger } from "@/core/logger";

const RegisterSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    error: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const RATE_LIMIT_KEY_PREFIX = "auth:register";
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("register:" + getClientIp(request), { maxRequests: 5, windowMs: 60 * 60 * 1000 }); if (!rl.allowed) return NextResponse.json(errorResponse("RATE_LIMITED", "Too many registration attempts"), { status: 429 });
  try {
    const ip = getClientIdentifier(request);
    const rateLimitKey = `${RATE_LIMIT_KEY_PREFIX}:${ip}`;

    if (!checkInMemoryRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        errorResponse("RATE_LIMITED", "Too many registration attempts. Please try again later."),
        {
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }),
        { status: 422 }
      );
    }

    const { name, email, password } = parsed.data;

    const signUpUrl = new URL("/api/auth/sign-up/email", request.url);
    const signUpResult = await auth.handler(
      new Request(signUpUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
    );

    if (!signUpResult.ok) {
      const errorBody = await signUpResult.json().catch(() => null);
      const message = (errorBody as any)?.message || "Registration failed";
      return NextResponse.json(
        errorResponse("REGISTRATION_FAILED", message),
        { status: signUpResult.status }
      );
    }

    const signUpBody = (await signUpResult.json()) as { user: { id: string } };
    const createdUserId = signUpBody.user.id;

    await db
      .update(user)
      .set({ status: "pending_verification", updatedAt: new Date() })
      .where(eq(user.id, createdUserId));

    const rawToken = generateSecureToken(32);
    const tokenHashed = hashToken(rawToken);
    const tokenId = `evlog_${Date.now().toString(36)}_${crypto.randomBytes(8).toString("hex")}`;
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(emailVerificationLog).values({
      id: tokenId,
      userId: createdUserId,
      tokenHash: tokenHashed,
      expiresAt: tokenExpiresAt,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? null,
      resendCount: 0,
    });

    const verificationUrl = `${config.app.url}/api/auth/verify-email?token=${rawToken}`;

    try {
      await defaultEmailService.sendVerification(email, rawToken, name);
    } catch (err) {
      logger.error("Failed to send verification email (non-blocking)", err as Error);
    }

    return NextResponse.json(
      successResponse(
        {
          userId: createdUserId,
          email,
          verificationUrl,
        },
        "Registration successful. Please check your email to verify your account."
      ),
      { status: 201 }
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
