import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { pipelineBuilderService } from "@/core/orchestrator/pipeline-builder.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { stepId } = await params;
    const body = await request.json();
    const updated = await pipelineBuilderService.updateStep(stepId, {
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
      isActive: body.isActive,
      metadata: body.metadata,
    });
    if (!updated) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Step not found"), { status: 404 });
    }
    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { stepId } = await params;
    await pipelineBuilderService.deleteStep(stepId);
    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
