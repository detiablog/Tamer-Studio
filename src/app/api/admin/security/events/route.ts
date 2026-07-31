import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { db } from "@/lib/db";
import { securityEvent } from "@/lib/db/schema/security";
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
      conditions.push(eq(securityEvent.eventType, eventType));
    }

    const severity = searchParams.get("severity");
    if (severity) {
      conditions.push(eq(securityEvent.severity, severity));
    }

    const search = searchParams.get("search");
    if (search) {
      conditions.push(ilike(securityEvent.description, `%${search}%`));
    }

    const from = searchParams.get("from");
    if (from) {
      conditions.push(gte(securityEvent.createdAt, new Date(from)));
    }

    const to = searchParams.get("to");
    if (to) {
      conditions.push(lte(securityEvent.createdAt, new Date(to)));
    }

    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const query = conditions.length > 0
      ? db.select().from(securityEvent).where(and(...conditions)).orderBy(desc(securityEvent.createdAt)).limit(limit).offset(offset)
      : db.select().from(securityEvent).orderBy(desc(securityEvent.createdAt)).limit(limit).offset(offset);

    const events = await query;
    return NextResponse.json(successResponse(events));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
