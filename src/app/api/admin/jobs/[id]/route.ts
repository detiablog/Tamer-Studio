import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { OperationsService } from "@/core/admin/operations";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || "retry";
    const session = ctx.state.adminSession;
    const adminId = session?.adminId || "system";

    const service = new OperationsService();

    if (action === "retry") {
      const result = await service.retryJob(id, adminId);
      if (!result.success) {
        return NextResponse.json(errorResponse("JOB_ERROR", result.error || "Failed to retry job"), { status: 400 });
      }
      return NextResponse.json(successResponse(result));
    }

    if (action === "cancel") {
      const cancelled = await service.cancelJob(id, adminId);
      if (!cancelled) {
        return NextResponse.json(errorResponse("JOB_ERROR", "Job not found"), { status: 404 });
      }
      return NextResponse.json(successResponse({ message: "Job cancelled" }));
    }

    return NextResponse.json(errorResponse("VALIDATION_ERROR", "Unknown action"), { status: 400 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const session = ctx.state.adminSession;
    const adminId = session?.adminId || "system";

    const service = new OperationsService();
    const cancelled = await service.cancelJob(id, adminId);

    if (!cancelled) {
      return NextResponse.json(errorResponse("JOB_ERROR", "Job not found"), { status: 404 });
    }

    return NextResponse.json(successResponse({ message: "Job deleted" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
