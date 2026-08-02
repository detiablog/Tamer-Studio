import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { db } from "@/lib/db";
import { secApiEvent } from "@/lib/db/schema/security";
import { eq, desc } from "drizzle-orm";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

const inMemoryRateLimits = new Map<string, {
  key: string;
  maxRequests: number;
  windowMs: number;
  currentCount: number;
  windowStart: Date;
  blockedUntil?: Date;
}>();

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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    let dbLimits: any[] = [];
    try {
      dbLimits = await db.select().from(secApiEvent).where(eq(secApiEvent.rateLimited, true)).orderBy(desc(secApiEvent.createdAt));
    } catch {
      dbLimits = [];
    }

    const memoryLimits = Array.from(inMemoryRateLimits.values()).map((limit) => ({
      id: limit.key,
      key: limit.key,
      maxRequests: limit.maxRequests,
      windowMs: limit.windowMs,
      currentCount: limit.currentCount,
      windowStart: limit.windowStart.toISOString(),
      blockedUntil: limit.blockedUntil?.toISOString() || null,
      source: "memory",
    }));

    const dbMapped = dbLimits.map((limit) => ({
      ...limit,
      source: "database",
    }));

    const allLimits = [...memoryLimits, ...dbMapped];
    return NextResponse.json(successResponse({
      limits: allLimits,
      summary: {
        total: allLimits.length,
        blocked: allLimits.filter((l) => l.blockedUntil && new Date(l.blockedUntil) > new Date()).length,
        active: allLimits.filter((l) => l.currentCount > 0).length,
      },
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
