import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse, paginatedResponse } from "@/app/api/mappers/response";
import { templateEngineService } from "@/core/automation/template-engine.service";

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
    const result = await templateEngineService.listTemplates({
      page: Number(searchParams.get("page")) || undefined,
      limit: Number(searchParams.get("limit")) || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
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
    if (!body.name || !body.type) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name and type are required"), { status: 400 });
    }

    const template = await templateEngineService.createTemplate({
      name: body.name,
      description: body.description,
      category: body.category,
      type: body.type,
      icon: body.icon,
      triggerConfig: body.triggerConfig,
      conditions: body.conditions,
      actions: body.actions,
      scheduleConfig: body.scheduleConfig,
      retryConfig: body.retryConfig,
      estimatedCredits: body.estimatedCredits,
      estimatedDurationMs: body.estimatedDurationMs,
      tags: body.tags,
      isSystem: body.isSystem,
    });
    return NextResponse.json(successResponse(template), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
