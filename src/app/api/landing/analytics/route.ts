import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db/client";
import { landingAnalytics } from "@/lib/db/schema/landing";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";

const TrackEventSchema = z.object({
  page: z.string().min(1).max(200),
  eventType: z.enum(["page_view", "section_view", "cta_click", "newsletter_signup", "button_click"]),
  eventData: z.record(z.string(), z.unknown()).optional(),
  sectionKey: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
});

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

  try {
    const body = await request.json();
    const parsed = TrackEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    const { page, eventType, eventData, sectionKey, sessionId } = parsed.data;
    const ipAddress = ctx.ip || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;

    await db.insert(landingAnalytics).values({
      id: generateId(),
      page,
      eventType,
      eventData: eventData || {},
      sectionKey: sectionKey || null,
      sessionId: sessionId || null,
      ipAddress,
      userAgent,
      referrer,
    });

    return NextResponse.json(successResponse({ tracked: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50", 10)), 200);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (searchParams.get("page_param")) {
      conditions.push(eq(landingAnalytics.page, searchParams.get("page_param")!));
    }
    if (searchParams.get("eventType")) {
      conditions.push(eq(landingAnalytics.eventType, searchParams.get("eventType")!));
    }

    let query = db.select().from(landingAnalytics);
    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(landingAnalytics);

    for (const cond of conditions) {
      query = query.where(cond) as typeof query;
      countQuery = countQuery.where(cond) as typeof countQuery;
    }

    const [rows, [{ count: total }]] = await Promise.all([
      query.orderBy(desc(landingAnalytics.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return NextResponse.json(paginatedResponse(rows, total, page, limit));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
