import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { monitoringEngine } from "@/core/monitoring/monitoring-engine";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const RecordMetricSchema = z.object({
  metricName: z.string().min(1),
  category: z.string().min(1),
  value: z.string().min(1),
  source: z.string().optional(),
  unit: z.string().optional(),
  dimensions: z.record(z.string(), z.string()).optional(),
});

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
    const metricName = searchParams.get("metricName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    if (metricName) {
      const metrics = await monitoringEngine.getMetrics(metricName, start, end);
      return NextResponse.json(successResponse(metrics));
    }

    const summary = await monitoringEngine.getMetricSummary(start, end);
    return NextResponse.json(successResponse(summary));
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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const parsed = RecordMetricSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { metricName, category, value, source, unit, dimensions } = parsed.data;
    await monitoringEngine.recordMetric(metricName, category, value, source, unit, dimensions as Record<string, string> | undefined);
    return NextResponse.json(successResponse({ message: "Metric recorded" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
