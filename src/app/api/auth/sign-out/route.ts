import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth";

/**
 * POST /api/auth/sign-out
 * 
 * Secure user sign-out endpoint
 * - Clears session
 * - Removes HTTP-only cookies
 */
export async function POST(request: NextRequest) {
  try {
    const response = await auth.api.signOut({
      request,
    });

    // Ensure cookies are cleared
    const signOutResponse = NextResponse.json({ success: true });
    
    // Clear session cookies
    signOutResponse.cookies.delete("session");
    signOutResponse.cookies.delete("auth_session");
    signOutResponse.cookies.delete("admin_session");

    return signOutResponse;
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.json(
      { error: "Sign-out failed" },
      { status: 500 }
    );
  }
}
