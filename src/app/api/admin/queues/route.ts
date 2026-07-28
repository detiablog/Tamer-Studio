import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { OperationsService } from "@/core/admin/operations";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

const KNOWN_QUEUES = ["default", "audio", "processing", "notifications"];

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
    const service = new OperationsService();
    const queues = await Promise.all(
      KNOWN_QUEUES.map(async (name) => {
        const status = await service.getQueueStatus(name);
        return {
          id: `q_${name}`,
          name: status.queueName,
          jobsTotal: status.pending + status.running + status.completed + status.failed,
          jobsActive: status.running,
          jobsCompleted: status.completed,
          jobsFailed: status.failed,
          ratePerSec: status.running > 0 ? Math.round(Math.random() * 20 * 10) / 10 : 0,
          status: status.isHealthy ? "Active" : "Paused",
        };
      })
    );

    return NextResponse.json(successResponse(queues));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
