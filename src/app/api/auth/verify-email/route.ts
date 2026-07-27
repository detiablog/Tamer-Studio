import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { defaultEmailService } from "@/modules/email";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Token is required"), { status: 400 });
    }

    const tokenRecord = await defaultEmailService.verifyToken(token, "verification");

    if (!tokenRecord) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid or expired verification token"), { status: 400 });
    }

    const userService = new UserService();
    const existingUser = tokenRecord.email
      ? await userService.getUserByEmail(tokenRecord.email)
      : null;

    if (existingUser) {
      await userService.verifyEmail(existingUser.id);
    }

    await defaultEmailService.invalidateToken(token);

    return NextResponse.json(successResponse({
      message: "Email verified successfully",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    const tokenRecord = await defaultEmailService.verifyToken(parsed.data.token, "verification");

    if (!tokenRecord || tokenRecord.usedAt) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid or expired verification token"), { status: 400 });
    }

    const userService = new UserService();
    const existingUser = tokenRecord.email
      ? await userService.getUserByEmail(tokenRecord.email)
      : null;

    if (existingUser) {
      await userService.verifyEmail(existingUser.id);
    }

    await defaultEmailService.invalidateToken(parsed.data.token);

    return NextResponse.json(successResponse({
      message: "Email verified successfully",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
