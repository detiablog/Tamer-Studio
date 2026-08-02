import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { analyticsEngine } from "@/core/analytics/analytics-engine";

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
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const result = await analyticsEngine.getEvents({
      eventType: searchParams.get("eventType") || undefined,
      category: searchParams.get("category") || undefined,
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
      page,
      limit,
    });
    return NextResponse.json(paginatedResponse(result.data, result.total, result.page, result.limit));
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
    const userId = ctx.state.userSession!.userId;
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    await analyticsEngine.trackEvent({
      eventType: body.eventType,
      category: body.category,
      source: body.source,
      userId,
      sessionId: body.sessionId,
      resourceId: body.resourceId,
      resourceType: body.resourceType,
      value: body.value,
      metadata: body.metadata,
      country: body.country,
      language: body.language,
      device: body.device,
    });
    return NextResponse.json(successResponse({ tracked: true }), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
