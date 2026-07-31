import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, emailVerificationLog } from "@/lib/db/schema/auth";
import { hashToken } from "@/modules/email/email.encryption";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { logAction } from "@/core/audit";

const VerifyEmailBodySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Token is required"),
        { status: 400 }
      );
    }

    return await verifyToken(token);
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifyEmailBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }),
        { status: 422 }
      );
    }

    return await verifyToken(parsed.data.token);
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

async function verifyToken(token: string) {
  const tokenHashed = hashToken(token);

  const [tokenRecord] = await db
    .select()
    .from(emailVerificationLog)
    .where(eq(emailVerificationLog.tokenHash, tokenHashed))
    .limit(1);

  if (!tokenRecord) {
    return NextResponse.json(
      errorResponse("INVALID_TOKEN", "Invalid or expired verification token"),
      { status: 400 }
    );
  }

  if (tokenRecord.usedAt) {
    return NextResponse.json(
      errorResponse("TOKEN_USED", "This verification token has already been used"),
      { status: 400 }
    );
  }

  if (new Date() > tokenRecord.expiresAt) {
    return NextResponse.json(
      errorResponse("TOKEN_EXPIRED", "This verification token has expired"),
      { status: 400 }
    );
  }

  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, tokenRecord.userId))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json(
      errorResponse("USER_NOT_FOUND", "User not found"),
      { status: 404 }
    );
  }

  if (dbUser.emailVerified) {
    return NextResponse.json(
      successResponse({ message: "Email is already verified" })
    );
  }

  const now = new Date();

  await db
    .update(user)
    .set({
      emailVerified: true,
      status: "active",
      updatedAt: now,
    })
    .where(eq(user.id, dbUser.id));

  await db
    .update(emailVerificationLog)
    .set({ usedAt: now })
    .where(eq(emailVerificationLog.id, tokenRecord.id));

  await logAction("user.email.verified", dbUser.id, "user", {
    email: dbUser.email,
    tokenId: tokenRecord.id,
  });

  return NextResponse.json(
    successResponse({ message: "Email verified successfully" })
  );
}
