import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { defaultEmailService } from "@/modules/email";
import { UserService } from "@/core/users/user.service";
import { auth } from "@/core/auth";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    const tokenRecord = await defaultEmailService.verifyToken(parsed.data.token, "reset_password");

    if (!tokenRecord || tokenRecord.usedAt) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid or expired reset token"), { status: 400 });
    }

    const userService = new UserService();
    const existingUser = tokenRecord.userId
      ? await userService.getUserById(tokenRecord.userId)
      : tokenRecord.email
        ? await userService.getUserByEmail(tokenRecord.email)
        : null;

    if (!existingUser) {
      return NextResponse.json(errorResponse("NOT_FOUND", "User not found for this token"), { status: 400 });
    }

    await (auth.api.resetPassword as Function)({
      newPassword: parsed.data.password,
      token: parsed.data.token,
    });
    await defaultEmailService.invalidateToken(parsed.data.token);

    return NextResponse.json(successResponse({
      message: "Password reset successfully. You can now sign in with your new password.",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
