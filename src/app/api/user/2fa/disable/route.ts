import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userTwoFactor, trustedDevice, account } from "@/lib/db/schema/auth";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { verifyTotpCode, createSecurityEvent } from "@/core/auth/totp";
import { verifyPassword } from "@/core/security/hash";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { z } from "zod";

const DisableSchema = z.object({
  password: z.string().min(1, "Password is required"),
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
    const parsed = DisableSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", parsed.error.issues.map((i) => i.message).join("; ")),
        { status: 422 }
      );
    }

    const userId = ctx.state.userSession!.userId;
    const { password, code } = parsed.data;

    const [accountRecord] = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1);

    if (!accountRecord?.password) {
      return NextResponse.json(
        errorResponse("NO_PASSWORD", "No password set for this account"),
        { status: 400 }
      );
    }

    const passwordValid = await verifyPassword(password, accountRecord.password);
    if (!passwordValid) {
      return NextResponse.json(
        errorResponse("INVALID_PASSWORD", "The password is incorrect"),
        { status: 400 }
      );
    }

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

    const codeValid = verifyTotpCode(record.encryptedSecret!, code);
    if (!codeValid) {
      return NextResponse.json(
        errorResponse("INVALID_CODE", "The verification code is invalid"),
        { status: 400 }
      );
    }

    await db.delete(userTwoFactor).where(eq(userTwoFactor.userId, userId));
    await db.delete(trustedDevice).where(eq(trustedDevice.userId, userId));

    await createSecurityEvent(
      userId,
      "2fa_disabled",
      "Two-factor authentication disabled",
      ctx.ip,
      ctx.request.headers.get("user-agent") ?? undefined
    );

    return NextResponse.json(successResponse({ success: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
