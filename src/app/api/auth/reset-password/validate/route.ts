import { NextRequest, NextResponse } from "next/server";
import { defaultEmailService } from "@/modules/email";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Token is required"), { status: 400 });
    }

    const tokenRecord = await defaultEmailService.verifyToken(token, "reset_password");

    if (!tokenRecord) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid or expired reset token"), { status: 400 });
    }

    return NextResponse.json(successResponse({ valid: true }));
  } catch (error) {
    return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid or expired reset token"), { status: 400 });
  }
}
