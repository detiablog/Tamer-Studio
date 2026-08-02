import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { workerMetricsService } from "@/core/scaling/worker-metrics.service";
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
    const { searchParams } = request.nextUrl;
    const workerType = searchParams.get("workerType") || undefined;
    const status = searchParams.get("status") || undefined;
    const data = await workerMetricsService.listWorkers({ workerType, status });
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
    const { workerId, workerType, metadata } = body;

    if (!workerId || !workerType) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "workerId and workerType are required"), { status: 422 });
    }

    const worker = await workerMetricsService.registerWorker({ workerId, workerType, metadata });
    return NextResponse.json(successResponse(worker), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
