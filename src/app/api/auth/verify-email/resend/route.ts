import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultEmailService } from "@/modules/email";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    const dbUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({
        message: "If an account exists for this email, a verification link has been sent.",
      });
    }

    const foundUser = dbUser[0];

    if (foundUser.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    const token = await defaultEmailService.createVerificationToken(email, foundUser.id);
    await defaultEmailService.sendVerification(email, token, foundUser.name);

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "An error occurred while sending verification email" },
      { status: 500 }
    );
  }
}
