import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { userTwoFactor, trustedDevice, securityEvent } from "@/lib/db/schema/auth";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

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

    const [deviceCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(trustedDevice)
      .where(eq(trustedDevice.userId, userId));

    const [lastEvent] = await db
      .select()
      .from(securityEvent)
      .where(eq(securityEvent.userId, userId))
      .orderBy(desc(securityEvent.createdAt))
      .limit(1);

    return NextResponse.json(
      successResponse({
        enabled: record?.enabled ?? false,
        enabledAt: record?.enabledAt ?? null,
        lastVerifiedAt: record?.lastVerifiedAt ?? null,
        trustedDeviceCount: deviceCountResult?.count ?? 0,
        lastSecurityActivity: lastEvent
          ? { type: lastEvent.eventType, createdAt: lastEvent.createdAt }
          : null,
      })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
