import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema/auth";
import { emailToken } from "@/lib/db/schema/email";
import { eq } from "drizzle-orm";
import { hashToken, generateId, generateSecureToken } from "@/modules/email";
import { defaultEmailService } from "@/modules/email";

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (!existingUser) {
      return NextResponse.json({
        message: "If an account exists for this email, you will receive a password reset link shortly.",
      });
    }

    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, existingUser.id))
      .limit(1);

    if (!credentialAccount) {
      return NextResponse.json({
        message: "If an account exists for this email, you will receive a password reset link shortly.",
      });
    }

    const plainToken = generateSecureToken(32);
    const hashedToken = hashToken(plainToken);
    const tokenId = generateId("reset");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await db.insert(emailToken).values({
      id: tokenId,
      type: "reset_password",
      email: existingUser.email,
      token: hashedToken,
      userId: existingUser.id,
      expiresAt,
      payload: { accountId: credentialAccount.id },
    });

    try {
      await defaultEmailService.sendResetPassword(existingUser.email, plainToken, existingUser.name || "User");
    } catch (sendError) {
      console.error("[Forgot Password] Email send failed:", sendError);
    }

    return NextResponse.json({
      message: "If an account exists for this email, you will receive a password reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
