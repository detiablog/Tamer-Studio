import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { storageUsage } from "@/lib/db/schema/dashboard";
import { eq } from "drizzle-orm";

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

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const userId = ctx.state.userSession!.userId;

    const existing = await db
      .select()
      .from(storageUsage)
      .where(eq(storageUsage.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(successResponse({
        totalUsed: "0",
        imageCount: 0,
        videoCount: 0,
        documentCount: 0,
        limitBytes: "1073741824",
        usagePercent: 0,
      }));
    }

    const usage = existing[0];
    const limitNum = parseInt(usage.limitBytes, 10) || 1073741824;
    const usedNum = parseInt(usage.totalUsed, 10) || 0;

    return NextResponse.json(successResponse({
      totalUsed: usage.totalUsed,
      imageCount: usage.imageCount,
      videoCount: usage.videoCount,
      documentCount: usage.documentCount,
      limitBytes: usage.limitBytes,
      usagePercent: Math.min(100, Math.round((usedNum / limitNum) * 100)),
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
