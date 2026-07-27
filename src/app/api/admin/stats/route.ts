import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { DashboardService } from "@/core/admin/dashboard/dashboard.service";
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

  const middlewareError = await runMiddleware([
    adminAuthentication(true),
    requireAdminPermission("admin:read"),
  ], ctx);

  if (middlewareError) {
    return middlewareError;
  }

  try {
    const session = ctx.state.adminSession;

    if (!session?.adminId && process.env.NODE_ENV !== "development") {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }

    const dashboardService = new DashboardService();
    const stats = await dashboardService.getAdminStats();

    return NextResponse.json(successResponse({ ...stats, timestamp: new Date().toISOString() }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
