import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userTwoFactor } from "@/lib/db/schema/auth";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import {
  verifyTotpCode,
  generateRecoveryCodes,
  hashRecoveryCode,
  createSecurityEvent,
} from "@/core/auth/totp";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { z } from "zod";

const VerifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only digits"),
});

export async function POST(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join("; ")),
        { status: 422 }
      );
    }

    const userId = ctx.state.userSession!.userId;
    const { code } = parsed.data;

    const [record] = await db
      .select()
      .from(userTwoFactor)
      .where(eq(userTwoFactor.userId, userId))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        errorResponse("2FA_NOT_SETUP", "Two-factor authentication has not been set up"),
        { status: 400 }
      );
    }

    if (record.enabled) {
      return NextResponse.json(
        errorResponse("2FA_ENABLED", "Two-factor authentication is already enabled"),
        { status: 400 }
      );
    }

    const isValid = verifyTotpCode(record.encryptedSecret!, code);
    if (!isValid) {
      return NextResponse.json(
        errorResponse("INVALID_CODE", "The verification code is invalid"),
        { status: 400 }
      );
    }

    const rawRecoveryCodes = generateRecoveryCodes(10);
    const hashedCodes = rawRecoveryCodes.map(hashRecoveryCode);

    await db
      .update(userTwoFactor)
      .set({
        enabled: true,
        enabledAt: new Date(),
        lastVerifiedAt: new Date(),
        backupCodes: hashedCodes,
        updatedAt: new Date(),
      })
      .where(eq(userTwoFactor.userId, userId));

    await createSecurityEvent(
      userId,
      "2fa_enabled",
      "Two-factor authentication enabled",
      ctx.ip,
      ctx.request.headers.get("user-agent") ?? undefined
    );

    return NextResponse.json(
      successResponse({ success: true, recoveryCodes: rawRecoveryCodes })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
