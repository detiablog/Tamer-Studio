import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { agentPlatformService } from "@/core/agent-platform/agent-platform.service";

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
    const result = await agentPlatformService.listAgents(userId, {
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      isTemplate: searchParams.get("isTemplate") !== null ? searchParams.get("isTemplate") === "true" : undefined,
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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name is required"), { status: 400 });
    }

    const agentRecord = await agentPlatformService.createAgent(userId, {
      name: body.name,
      description: body.description,
      avatar: body.avatar,
      type: body.type,
      role: body.role,
      mission: body.mission,
      goals: body.goals,
      instructions: body.instructions,
      behavior: body.behavior,
      allowedTools: body.allowedTools,
      allowedModels: body.allowedModels,
      maxCredits: body.maxCredits,
      maxRuntimeMs: body.maxRuntimeMs,
      temperature: body.temperature,
      creativity: body.creativity,
      reasoningLevel: body.reasoningLevel,
      language: body.language,
      isTemplate: body.isTemplate,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(agentRecord), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
