import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userTwoFactor, user } from "@/lib/db/schema/auth";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { generateTotpSecret, generateQrDataUrl, generateId } from "@/core/auth/totp";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

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
    const userId = ctx.state.userSession!.userId;

    const [userRecord] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1);
    const userEmail = userRecord?.email || "";

    const [existing] = await db
      .select()
      .from(userTwoFactor)
      .where(eq(userTwoFactor.userId, userId))
      .limit(1);

    if (existing?.enabled) {
      return NextResponse.json(
        errorResponse("2FA_ENABLED", "Two-factor authentication is already enabled"),
        { status: 400 }
      );
    }

    const { secret, encryptedSecret } = generateTotpSecret();
    const qrCodeDataUrl = await generateQrDataUrl(
      encryptedSecret,
      userEmail
    );

    if (existing) {
      await db
        .update(userTwoFactor)
        .set({ encryptedSecret, updatedAt: new Date() })
        .where(eq(userTwoFactor.userId, userId));
    } else {
      await db.insert(userTwoFactor).values({
        id: generateId("2fa"),
        userId,
        encryptedSecret,
        enabled: false,
      });
    }

    return NextResponse.json(successResponse({ secret, qrCodeDataUrl }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
