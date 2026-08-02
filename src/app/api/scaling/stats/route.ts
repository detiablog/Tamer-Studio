import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { workerMetricsService } from "@/core/scaling/worker-metrics.service";
import { queueMetricsService } from "@/core/scaling/queue-metrics.service";
import { scaleMetricsService } from "@/core/scaling/metrics.service";
import { costService } from "@/core/scaling/cost.service";
import { loadTestService } from "@/core/scaling/load-test.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

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

  const errorResponseMw = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:read"),
  ], ctx);

  if (errorResponseMw) {
    return errorResponseMw;
  }

  try {
    const [workerStats, queueStats, metricSummary, costSummary, loadTests] = await Promise.all([
      workerMetricsService.getWorkerStats(),
      queueMetricsService.getQueueStats(),
      scaleMetricsService.summary(24),
      costService.getCostSummary(30),
      loadTestService.listTests({ limit: 5 }),
    ]);

    return NextResponse.json(
      successResponse({
        workers: workerStats,
        queues: queueStats,
        metrics: metricSummary,
        costs: costSummary,
        recentLoadTests: loadTests.data,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
