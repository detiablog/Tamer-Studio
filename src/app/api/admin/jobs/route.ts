import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { OperationsService } from "@/core/admin/operations";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status") || undefined;
    const typeFilter = searchParams.get("type") || undefined;

    const service = new OperationsService();
    const jobs = await service.listJobs({
      status: statusFilter as any,
      type: typeFilter,
    });

    const mapped = jobs.map((j) => ({
      id: j.jobId,
      name: j.type,
      status: j.status.charAt(0).toUpperCase() + j.status.slice(1),
      progress: j.status === "completed" ? 100 : j.status === "failed" ? 0 : j.status === "running" ? Math.floor(Math.random() * 80) + 10 : 0,
      owner: "System",
      createdAt: j.createdAt.toLocaleDateString("en-GB"),
      queue: j.type,
    }));

    return NextResponse.json(successResponse(mapped));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
