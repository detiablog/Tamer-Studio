import { NextRequest, NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { getMetricsAggregationSchedule, manuallyTriggerAggregation } from "@/core/jobs/cron-setup";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

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
    requireAdminPermission("admin:system"),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  try {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "status") {
      const schedule = getMetricsAggregationSchedule();
      return NextResponse.json(successResponse({
        status: "active",
        schedule,
        message: "Metrics aggregation cron job is active",
      }));
    }

    if (action === "trigger") {
      const result = await manuallyTriggerAggregation();
      return NextResponse.json(successResponse({
        message: "Metrics aggregation triggered successfully",
        result,
      }));
    }

    const schedule = getMetricsAggregationSchedule();
    return NextResponse.json(successResponse(schedule));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
