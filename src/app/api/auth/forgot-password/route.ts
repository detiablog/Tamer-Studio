import { NextRequest, NextResponse } from "next/server";
import { crypto } from "node:crypto";

/**
 * POST /api/auth/forgot-password
 * 
 * Sends a password reset email to the user
 * 
 * Body:
 * - email: string
 * 
 * Response:
 * - message: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // TODO: Implement actual password reset flow
    // 1. Check if user exists
    // 2. Generate reset token
    // 3. Save token with expiration (1 hour)
    // 4. Send email with reset link
    // 5. Return success message

    console.log(`[TODO] Send password reset email to: ${email}`);

    // For now, return success
    return NextResponse.json({
      message: "If an account exists for this email, you will receive a password reset link shortly.",
      email: email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
