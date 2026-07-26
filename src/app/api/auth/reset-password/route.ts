import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema/auth";
import { emailToken } from "@/lib/db/schema/email";
import { eq, and, gte } from "drizzle-orm";
import { hashToken } from "@/modules/email";
import { hashPassword } from "@/core/security/hash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const hashed = hashToken(token);
    const now = new Date();

    const [tokenRecord] = await db
      .select()
      .from(emailToken)
      .where(
        and(
          eq(emailToken.token, hashed),
          eq(emailToken.type, "reset_password"),
          gte(emailToken.expiresAt, now)
        )
      )
      .limit(1);

    if (!tokenRecord || tokenRecord.usedAt) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const [existingUser] = await db.select().from(user).where(eq(user.id, tokenRecord.userId || "")).limit(1);
    let targetUserId = existingUser?.id;
    if (!targetUserId && tokenRecord.email) {
      const [emailUser] = await db.select().from(user).where(eq(user.email, tokenRecord.email)).limit(1);
      if (!emailUser) {
        return NextResponse.json(
          { message: "User not found for this token" },
          { status: 400 }
        );
      }
      targetUserId = emailUser.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { message: "Invalid token payload" },
        { status: 400 }
      );
    }

    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, targetUserId))
      .limit(1);

    if (!credentialAccount) {
      return NextResponse.json(
        { message: "No account found for this user" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await db.update(account).set({ password: passwordHash }).where(eq(account.id, credentialAccount.id));
    await db.update(emailToken).set({ usedAt: now }).where(eq(emailToken.id, tokenRecord.id));

    return NextResponse.json({
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
