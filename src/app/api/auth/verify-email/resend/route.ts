import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { defaultEmailService } from "@/modules/email";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    const userService = new UserService();
    const dbUser = await userService.getUserByEmail(parsed.data.email);

    if (!dbUser) {
      return NextResponse.json(successResponse({
        message: "If an account exists for this email, a verification link has been sent.",
      }));
    }

    const token = await defaultEmailService.createVerificationToken(dbUser.email, dbUser.id);
    await defaultEmailService.sendVerification(dbUser.email, token, dbUser.name);

    return NextResponse.json(successResponse({
      message: "Verification email sent successfully",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
