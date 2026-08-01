import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse, paginatedResponse } from "@/app/api/mappers/response";
import { ruleEngineService } from "@/core/automation/rule-engine.service";

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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const result = await ruleEngineService.listRules(userId, {
      page: Number(searchParams.get("page")) || undefined,
      limit: Number(searchParams.get("limit")) || undefined,
      isEnabled: searchParams.get("isEnabled") === "true" ? true : searchParams.get("isEnabled") === "false" ? false : undefined,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.triggerConfig) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name and triggerConfig are required"), { status: 400 });
    }

    const rule = await ruleEngineService.createRule(userId, {
      name: body.name,
      description: body.description,
      status: body.status,
      priority: body.priority,
      triggerConfig: body.triggerConfig,
      conditions: body.conditions,
      actions: body.actions,
      scheduleConfig: body.scheduleConfig,
      retryConfig: body.retryConfig,
      tags: body.tags,
      isEnabled: body.isEnabled,
    });
    return NextResponse.json(successResponse(rule), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
