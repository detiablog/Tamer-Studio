import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { queueMetricsService } from "@/core/scaling/queue-metrics.service";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
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
    const data = await queueMetricsService.listQueues();
    return NextResponse.json(successResponse(data));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponseMw = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:write"),
  ], ctx);

  if (errorResponseMw) {
    return errorResponseMw;
  }

  try {
    const body = await request.json();
    const { queueName, queueLength, processingCount, completedCount, failedCount, retryingCount, avgWaitTimeMs, avgProcessTimeMs, oldestItemAgeMs } = body;

    if (!queueName || queueLength === undefined) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "queueName and queueLength are required"), { status: 422 });
    }

    const record = await queueMetricsService.recordSnapshot({
      queueName,
      queueLength,
      processingCount,
      completedCount,
      failedCount,
      retryingCount,
      avgWaitTimeMs,
      avgProcessTimeMs,
      oldestItemAgeMs,
    });

    return NextResponse.json(successResponse(record), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
