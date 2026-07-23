import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth";

/**
 * POST /api/auth/sign-in
 * 
 * Secure user sign-in endpoint
 * - Uses POST body only (never URL parameters)
 * - Sets secure HTTP-only cookies
 * - Returns session without credentials
 */
export async function POST(request: NextRequest) {
  try {
    // Don't allow credentials in URL
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Call better-auth to sign in
    const response = await auth.api.signInEmail({
      email,
      password,
      request,
    });

    return response;
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
