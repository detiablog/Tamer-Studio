import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { obsMetricsService } from "@/core/observability/metrics.service";
import { obsLoggingService } from "@/core/observability/logging.service";
import { obsTracingService } from "@/core/observability/tracing.service";
import { obsErrorService } from "@/core/observability/error.service";
import { obsAlertService } from "@/core/observability/alert.service";

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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const [logStats, traceStats, errorStats, alertStats] = await Promise.all([
      obsLoggingService.getStats(),
      obsTracingService.getTraceStats(),
      obsErrorService.getStats(),
      obsAlertService.getStats(),
    ]);

    return NextResponse.json(successResponse({
      logs: logStats,
      traces: traceStats,
      errors: errorStats,
      alerts: alertStats,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
