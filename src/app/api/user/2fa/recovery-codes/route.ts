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

const RegenerateSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export async function GET(request: NextRequest) {
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
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession!.userId;

    const [record] = await db
      .select()
      .from(userTwoFactor)
      .where(eq(userTwoFactor.userId, userId))
      .limit(1);

    if (!record?.enabled) {
      return NextResponse.json(
        errorResponse("2FA_NOT_ENABLED", "Two-factor authentication is not enabled"),
        { status: 400 }
      );
    }

    const backupCodes = (record.backupCodes as string[]) || [];

    return NextResponse.json(
      successResponse({
        totalCodes: backupCodes.length,
        remainingCodes: backupCodes.length,
      })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

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
    const parsed = RegenerateSchema.safeParse(body);

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

    if (!record?.enabled || !record.encryptedSecret) {
      return NextResponse.json(
        errorResponse("2FA_NOT_ENABLED", "Two-factor authentication is not enabled"),
        { status: 400 }
      );
    }

    const isTotpValid = verifyTotpCode(record.encryptedSecret, code);

    if (!isTotpValid) {
      return NextResponse.json(
        errorResponse("INVALID_CODE", "The provided code is invalid"),
        { status: 400 }
      );
    }

    const rawCodes = generateRecoveryCodes(10);
    const hashedCodes = rawCodes.map(hashRecoveryCode);

    await db
      .update(userTwoFactor)
      .set({ backupCodes: hashedCodes, updatedAt: new Date() })
      .where(eq(userTwoFactor.userId, userId));

    await createSecurityEvent(
      userId,
      "recovery_codes_regenerated",
      "Recovery codes regenerated",
      ctx.ip,
      ctx.request.headers.get("user-agent") ?? undefined
    );

    return NextResponse.json(successResponse({ recoveryCodes: rawCodes }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
