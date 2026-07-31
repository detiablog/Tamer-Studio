import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

export async function POST(request: NextRequest) {
  try {
    const response = await auth.api.signOut({
      headers: {},
    });

    const signOutResponse = NextResponse.json(successResponse({ message: "Signed out successfully" }));

    signOutResponse.cookies.delete("better-auth.session_token");
    signOutResponse.cookies.delete("better-auth.session_token_transfer_method");
    signOutResponse.cookies.delete("session");
    signOutResponse.cookies.delete("auth_session");
    signOutResponse.cookies.delete("admin_session");

    return signOutResponse;
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
