import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { threatDetectorService } from "@/core/security-hub/threat-detector.service";

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
    const result = await threatDetectorService.listEvents({
      eventType: searchParams.get("eventType") || undefined,
      severity: searchParams.get("severity") || undefined,
      category: searchParams.get("category") || undefined,
      userId: searchParams.get("userId") || undefined,
      blocked: searchParams.get("blocked") === "true" ? true : searchParams.get("blocked") === "false" ? false : undefined,
      resolved: searchParams.get("resolved") === "true" ? true : searchParams.get("resolved") === "false" ? false : undefined,
      search: searchParams.get("search") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
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
    const event = await threatDetectorService.recordEvent({
      eventType: body.eventType,
      severity: body.severity,
      category: body.category,
      source: body.source,
      userId: body.userId,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      resource: body.resource,
      action: body.action,
      details: body.details,
      blocked: body.blocked,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(event), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
