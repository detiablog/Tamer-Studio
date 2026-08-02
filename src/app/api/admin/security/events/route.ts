import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { db } from "@/lib/db";
import { secEvent } from "@/lib/db/schema/security";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { desc, eq, and, ilike, gte, lte } from "drizzle-orm";

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
    const searchParams = request.nextUrl.searchParams;
    const conditions: any[] = [];

    const eventType = searchParams.get("eventType");
    if (eventType) {
      conditions.push(eq(secEvent.eventType, eventType));
    }

    const severity = searchParams.get("severity");
    if (severity) {
      conditions.push(eq(secEvent.severity, severity));
    }

    const search = searchParams.get("search");
    if (search) {
      conditions.push(ilike(secEvent.eventType, `%${search}%`));
    }

    const from = searchParams.get("from");
    if (from) {
      conditions.push(gte(secEvent.createdAt, new Date(from)));
    }

    const to = searchParams.get("to");
    if (to) {
      conditions.push(lte(secEvent.createdAt, new Date(to)));
    }

    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const query = conditions.length > 0
      ? db.select().from(secEvent).where(and(...conditions)).orderBy(desc(secEvent.createdAt)).limit(limit).offset(offset)
      : db.select().from(secEvent).orderBy(desc(secEvent.createdAt)).limit(limit).offset(offset);

    const events = await query;
    return NextResponse.json(successResponse(events));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
