import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { pipelineBuilderService } from "@/core/orchestrator/pipeline-builder.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
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
    const { id } = await params;
    const steps = await pipelineBuilderService.listSteps(id);
    return NextResponse.json(successResponse(steps));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
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
    const { id } = await params;
    const body = await request.json();
    if (!body.name || !body.moduleType || !body.action || body.order === undefined) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name, moduleType, action, and order are required"), { status: 400 });
    }

    const step = await pipelineBuilderService.addStep(id, {
      name: body.name,
      moduleType: body.moduleType,
      action: body.action,
      order: body.order,
      config: body.config,
      inputMapping: body.inputMapping,
      outputKey: body.outputKey,
      conditions: body.conditions,
      retryConfig: body.retryConfig,
      timeoutMs: body.timeoutMs,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(step), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
