import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { overviewService } from "@/core/operations/overview.service";
import { alertService } from "@/core/operations/alert.service";
import { incidentService } from "@/core/operations/incident.service";
import { opsHealthService } from "@/core/operations/health.service";
import { deploymentService } from "@/core/operations/deployment.service";

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
    const [alertStats, incidentStats, health, deployment] = await Promise.all([
      alertService.getStats(),
      incidentService.getStats(),
      opsHealthService.getOverallStatus(),
      deploymentService.getLatestDeployment(),
    ]);
    return NextResponse.json(successResponse({
      alerts: alertStats,
      incidents: incidentStats,
      health,
      deployment: deployment ? {
        version: deployment.version,
        status: deployment.status,
        environment: deployment.environment,
        deployedAt: deployment.startedAt,
      } : null,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
