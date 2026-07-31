import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { WorkflowRepository } from "@/core/workflow/workflow.repository";

const repo = new WorkflowRepository();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
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
    const { nodeId } = await params;
    const node = await repo.getNode(nodeId);
    if (!node) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Node not found"), { status: 404 });
    }
    const body = await request.json();
    const updated = await repo.updateNode(nodeId, {
      type: body.type,
      label: body.label,
      positionX: body.positionX,
      positionY: body.positionY,
      config: body.config,
      metadata: body.metadata,
    });
    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
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
    const { nodeId } = await params;
    const node = await repo.getNode(nodeId);
    if (!node) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Node not found"), { status: 404 });
    }
    await repo.deleteNode(nodeId);
    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
