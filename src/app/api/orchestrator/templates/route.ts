import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { pipelineBuilderService } from "@/core/orchestrator/pipeline-builder.service";

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
    const templates = await pipelineBuilderService.listTemplates(
      searchParams.get("category") || undefined
    );
    return NextResponse.json(successResponse(templates));
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

    const template = await pipelineBuilderService.createTemplate({
      name: body.name,
      description: body.description,
      type: body.type,
      category: body.category,
      icon: body.icon,
      pipelineConfig: body.pipelineConfig,
      steps: body.steps,
      estimatedCredits: body.estimatedCredits,
      estimatedDurationMs: body.estimatedDurationMs,
      tags: body.tags,
      isSystem: body.isSystem,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(template), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
