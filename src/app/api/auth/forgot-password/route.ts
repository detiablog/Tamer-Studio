import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { defaultEmailService } from "@/modules/email";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    const userService = new UserService();
    const existingUser = await userService.getUserByEmail(parsed.data.email);

    if (!existingUser) {
      return NextResponse.json(successResponse({
        message: "If an account exists for this email, you will receive a password reset link shortly.",
      }));
    }

    await defaultEmailService.sendResetPassword(existingUser.email, "reset-token", existingUser.name || "User");

    return NextResponse.json(successResponse({
      message: "If an account exists for this email, you will receive a password reset link shortly.",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
