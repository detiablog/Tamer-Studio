import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { session, userTwoFactor, trustedDevice } from "@/lib/db/schema/auth";
import { verifyTotpCode, createSecurityEvent, generateId } from "@/core/auth/totp";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { z } from "zod";

const ChallengeSchema = z.object({
  sessionToken: z.string().min(1, "Session token is required"),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only digits"),
  rememberDevice: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChallengeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join("; ")),
        { status: 422 }
      );
    }

    const { sessionToken, code, rememberDevice } = parsed.data;

    const [sessionRecord] = await db
      .select()
      .from(session)
      .where(eq(session.token, sessionToken))
      .limit(1);

    if (!sessionRecord) {
      return NextResponse.json(
        errorResponse("INVALID_SESSION", "Invalid session token"),
        { status: 401 }
      );
    }

    if (new Date(sessionRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        errorResponse("SESSION_EXPIRED", "Session has expired"),
        { status: 401 }
      );
    }

    const userId = sessionRecord.userId;

    const [record] = await db
      .select()
      .from(userTwoFactor)
      .where(eq(userTwoFactor.userId, userId))
      .limit(1);

    if (!record?.enabled || !record.encryptedSecret) {
      return NextResponse.json(
        errorResponse("2FA_NOT_ENABLED", "Two-factor authentication is not enabled for this account"),
        { status: 400 }
      );
    }

    const isValid = verifyTotpCode(record.encryptedSecret, code);
    if (!isValid) {
      return NextResponse.json(
        errorResponse("INVALID_CODE", "The verification code is invalid"),
        { status: 400 }
      );
    }

    await db
      .update(userTwoFactor)
      .set({ lastVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(userTwoFactor.userId, userId));

    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    if (rememberDevice) {
      await db.insert(trustedDevice).values({
        id: generateId("td"),
        userId,
        token: generateId("tdt"),
        userAgent: userAgent || null,
        ipAddress: ip || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    await createSecurityEvent(
      userId,
      "2fa_verified",
      "Two-factor authentication verified during login",
      ip,
      userAgent,
      { rememberDevice: rememberDevice ?? false }
    );

    return NextResponse.json(successResponse({ success: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
