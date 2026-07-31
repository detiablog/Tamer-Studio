import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, emailVerificationLog } from "@/lib/db/schema/auth";
import { generateSecureToken, hashToken } from "@/modules/email/email.encryption";
import { defaultEmailService } from "@/modules/email";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { checkRateLimit } from "@/core/security/rate-limiter";
import { getClientIp } from "@/core/security/security-utils";

const ResendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const COOLDOWN_MS = 60 * 1000;
const DAILY_LIMIT = 5;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("resend:" + getClientIp(request), { maxRequests: 3, windowMs: 60 * 60 * 1000 }); if (!rl.allowed) return NextResponse.json(errorResponse("RATE_LIMITED", "Too many attempts"), { status: 429 });
  try {
    const body = await request.json();
    const parsed = ResendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }),
        { status: 422 }
      );
    }

    const { email } = parsed.data;

    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        successResponse({ message: "If an account exists for this email, a verification link has been sent." })
      );
    }

    if (dbUser.emailVerified) {
      return NextResponse.json(
        errorResponse("ALREADY_VERIFIED", "This email is already verified"),
        { status: 400 }
      );
    }

    const cooldownCutoff = new Date(Date.now() - COOLDOWN_MS);
    const [recentToken] = await db
      .select({ id: emailVerificationLog.id })
      .from(emailVerificationLog)
      .where(
        and(
          eq(emailVerificationLog.userId, dbUser.id),
          gt(emailVerificationLog.createdAt, cooldownCutoff)
        )
      )
      .limit(1);

    if (recentToken) {
      const retryAfter = Math.ceil(COOLDOWN_MS / 1000);
      return NextResponse.json(
        errorResponse("COOLDOWN_ACTIVE", "Please wait before requesting another verification email"),
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        }
      );
    }

    const dailyCutoff = new Date(Date.now() - DAILY_WINDOW_MS);
    const dailyTokens = await db
      .select({ id: emailVerificationLog.id })
      .from(emailVerificationLog)
      .where(
        and(
          eq(emailVerificationLog.userId, dbUser.id),
          gt(emailVerificationLog.createdAt, dailyCutoff)
        )
      );

    if (dailyTokens.length >= DAILY_LIMIT) {
      return NextResponse.json(
        errorResponse("DAILY_LIMIT_REACHED", "You have reached the daily limit for verification emails"),
        { status: 429 }
      );
    }

    await db
      .update(emailVerificationLog)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(emailVerificationLog.userId, dbUser.id),
          isNull(emailVerificationLog.usedAt)
        )
      );

    const rawToken = generateSecureToken(32);
    const tokenHashed = hashToken(rawToken);
    const tokenId = `evlog_${Date.now().toString(36)}_${crypto.randomBytes(8).toString("hex")}`;
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    await db.insert(emailVerificationLog).values({
      id: tokenId,
      userId: dbUser.id,
      tokenHash: tokenHashed,
      expiresAt: tokenExpiresAt,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? null,
      resendCount: dailyTokens.length + 1,
    });

    try {
      await defaultEmailService.sendVerification(email, rawToken, dbUser.name || "User");
    } catch {
    }

    return NextResponse.json(
      successResponse({ message: "Verification email sent successfully" })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
