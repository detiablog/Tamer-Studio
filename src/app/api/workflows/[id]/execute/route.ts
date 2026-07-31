import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { WorkflowRepository } from "@/core/workflow/workflow.repository";
import { workflowEngine } from "@/core/workflow/workflow-engine";

const repo = new WorkflowRepository();

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
    const userId = ctx.state.userSession!.userId;
    const wf = await repo.getWorkflow(id);
    if (!wf) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Workflow not found"), { status: 404 });
    }
    const body = await request.json().catch(() => ({}));
    const run = await repo.createRun({ workflowId: id, userId, variables: body.variables });
    if (!run) {
      return NextResponse.json(errorResponse("INTERNAL_ERROR", "Failed to create run"), { status: 500 });
    }
    workflowEngine.executeWorkflow(run.id).catch(() => {});
    return NextResponse.json(successResponse(run), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
