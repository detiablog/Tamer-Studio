import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { queueMetricsService } from "@/core/scaling/queue-metrics.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
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
    const { name } = await params;
    const { searchParams } = request.nextUrl;
    const hours = Number(searchParams.get("hours")) || 24;

    const [trend, latest] = await Promise.all([
      queueMetricsService.getQueueTrend(name, hours),
      queueMetricsService.getLatestSnapshot(name),
    ]);

    return NextResponse.json(successResponse({ queueName: name, trend, latest }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
