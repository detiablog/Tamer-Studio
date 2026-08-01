import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { pipelineBuilderService } from "@/core/orchestrator/pipeline-builder.service";
import { resourceEstimatorService } from "@/core/orchestrator/resource-estimator.service";

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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    const pipeline = await pipelineBuilderService.getPipeline(id);
    if (!pipeline) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Pipeline not found"), { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const estimate = await resourceEstimatorService.estimatePipeline(id);

    const execution = await pipelineBuilderService.createExecution(userId, id, {
      triggerType: body.triggerType,
      input: body.input,
      estimatedCredits: estimate.totalCredits,
      estimatedDurationMs: estimate.totalDurationMs,
    });
    return NextResponse.json(successResponse(execution), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
