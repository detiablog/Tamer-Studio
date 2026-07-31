import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { session, account } from "@/lib/db/schema/auth";
import { defaultEmailService } from "@/modules/email";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { logger } from "@/core/logger";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }),
        { status: 422 }
      );
    }

    const { token, password } = parsed.data;

    const tokenRecord = await defaultEmailService.verifyToken(token, "reset_password");

    if (!tokenRecord) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid or expired reset token"),
        { status: 400 }
      );
    }

    if (tokenRecord.usedAt) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "This reset link has already been used"),
        { status: 400 }
      );
    }

    const userService = new UserService();
    const existingUser = tokenRecord.userId
      ? await userService.getUserById(tokenRecord.userId)
      : tokenRecord.email
        ? await userService.getUserByEmail(tokenRecord.email)
        : null;

    if (!existingUser) {
      return NextResponse.json(
        errorResponse("NOT_FOUND", "User not found for this token"),
        { status: 400 }
      );
    }

    await defaultEmailService.invalidateToken(token);

    const [existingAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, existingUser.id))
      .limit(1);

    if (existingAccount?.password) {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 12);
      await db
        .update(account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(account.id, existingAccount.id));
    }

    await db
      .delete(session)
      .where(eq(session.userId, existingUser.id));

    logger.info("Password reset completed", { userId: existingUser.id });

    return NextResponse.json(
      successResponse({ message: "Password reset successfully. Please sign in with your new password." })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
