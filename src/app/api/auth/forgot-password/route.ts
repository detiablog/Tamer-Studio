import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { defaultEmailService } from "@/modules/email";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { checkRateLimit } from "@/core/security/rate-limiter";
import { getClientIp } from "@/core/security/security-utils";
import { logger } from "@/core/logger";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const RATE_LIMIT_KEY_PREFIX = "auth:forgot-password";
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit("forgot:" + getClientIp(request), { maxRequests: 5, windowMs: 60 * 60 * 1000 }); if (!rl.allowed) return NextResponse.json(errorResponse("RATE_LIMITED", "Too many attempts"), { status: 429 });
  try {
    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        successResponse({ message: "If an account exists for this email, you will receive a password reset link shortly." }),
        { status: 200 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    const [existingUser] = await db
      .select({ id: user.id, email: user.email, name: user.name })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        successResponse({ message: "If an account exists for this email, you will receive a password reset link shortly." })
      );
    }

    try {
      const token = await defaultEmailService.createResetPasswordToken(existingUser.email, existingUser.id);
      await defaultEmailService.sendResetPassword(existingUser.email, token, existingUser.name || "User");
      logger.info("Reset password email sent", { userId: existingUser.id, email: existingUser.email });
    } catch (err) {
      logger.error("Failed to send reset password email (non-blocking)", err as Error);
    }

    return NextResponse.json(
      successResponse({ message: "If an account exists for this email, you will receive a password reset link shortly." })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
