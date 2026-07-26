import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultEmailService } from "@/modules/email";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { emailToken } from "@/lib/db/schema/email";
import { eq, and, gte } from "drizzle-orm";
import { hashToken } from "@/modules/email/email.encryption";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    const emailTokenRecord = await defaultEmailService.verifyToken(token, "verification");

    if (!emailTokenRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    const [existingUser] = await db.select().from(user).where(eq(user.email, emailTokenRecord.email as string)).limit(1);

    if (existingUser) {
      await db.update(user).set({ emailVerified: true }).where(eq(user.id, existingUser.id));
    }

    await defaultEmailService.invalidateToken(token);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying your email" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required" },
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
          eq(emailToken.type, "verification"),
          gte(emailToken.expiresAt, now)
        )
      )
      .limit(1);

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    const [existingUser] = await db.select().from(user).where(eq(user.email, tokenRecord.email as string)).limit(1);

    if (existingUser) {
      await db.update(user).set({ emailVerified: true, updatedAt: now }).where(eq(user.id, existingUser.id));
    }

    await db.update(emailToken).set({ usedAt: now }).where(eq(emailToken.id, tokenRecord.id));

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("[Verify Email] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
