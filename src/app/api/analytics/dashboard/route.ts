import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceDashboardMetrics } from "@/core/analytics/aggregation";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request, params: {},
    state: { rateLimit: undefined, origin: undefined, adminSession: undefined, userSession: undefined, authError: undefined, permissionError: undefined, csrfError: undefined, rateLimitError: undefined, auditContext: undefined },
    method: "GET", pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };
  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const metrics = await getWorkspaceDashboardMetrics(
      workspaceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
