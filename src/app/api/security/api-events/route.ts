import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { apiMonitorService } from "@/core/security-hub/api-monitor.service";

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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const result = await apiMonitorService.listEvents({
      userId: searchParams.get("userId") || undefined,
      endpoint: searchParams.get("endpoint") || undefined,
      status: searchParams.get("status") || undefined,
      page: Number(searchParams.get("page")) || undefined,
      limit: Number(searchParams.get("limit")) || undefined,
    });
    return NextResponse.json(successResponse(result));
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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const event = await apiMonitorService.recordRequest({
      correlationId: body.correlationId,
      userId: body.userId,
      method: body.method,
      endpoint: body.endpoint,
      statusCode: body.statusCode,
      latencyMs: body.latencyMs,
      requestSize: body.requestSize,
      responseSize: body.responseSize,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      rateLimited: body.rateLimited,
      blocked: body.blocked,
      error: body.error,
    });
    return NextResponse.json(successResponse(event), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
