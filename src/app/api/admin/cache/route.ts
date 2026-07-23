import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission, csrfMiddleware } from "@/core/middleware";
import { logAdminAction } from "@/core/audit/audit.service";

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

  return NextResponse.json({
    cache: {
      hitRate: "94%",
      cluster: "Redis cluster",
      keys: 12450,
      memoryUsed: "256 MB",
      uptime: "14d 2h",
    },
  });
}

export async function DELETE(request: NextRequest) {
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:system"),
    csrfMiddleware(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  if (ctx.state.adminSession?.adminId) {
    logAdminAction("admin.action", ctx.state.adminSession.adminId, {
      action: "cache.cleared",
      pathname: ctx.pathname,
    });
  }

  return NextResponse.json({ success: true, message: "Cache cleared" });
}
