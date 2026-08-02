import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { workerMetricsService } from "@/core/scaling/worker-metrics.service";
import { queueMetricsService } from "@/core/scaling/queue-metrics.service";
import { scaleMetricsService } from "@/core/scaling/metrics.service";

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

  const errorResponse = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:read"),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const [workerStats, queueStats, metricSummary] = await Promise.all([
      workerMetricsService.getWorkerStats(),
      queueMetricsService.getQueueStats(),
      scaleMetricsService.summary(24),
    ]);

    const totalCpu = metricSummary.find((m) => m.name === "cpu_usage")?.avg ?? 0;
    const totalMemory = metricSummary.find((m) => m.name === "memory_usage")?.avg ?? 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          workers: workerStats,
          queues: queueStats,
          system: {
            avgCpu: Math.round(Number(totalCpu)),
            avgMemory: Math.round(Number(totalMemory)),
            totalMetrics: metricSummary.length,
          },
          capacity: {
            workerUtilization: workerStats.total > 0 ? Math.round((workerStats.active / workerStats.total) * 100) : 0,
            queueBacklog: queueStats.totalBacklog,
            healthyWorkers: workerStats.active,
            totalWorkers: workerStats.total,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch overview" } },
      { status: 500 }
    );
  }
}
