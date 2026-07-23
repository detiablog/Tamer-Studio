import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/core/audit/audit.service";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";

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

  const errorResponse = await runMiddleware([
    adminAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  const response = NextResponse.json({ success: true });

  response.cookies.delete("admin_session");

  if (ctx.state.adminSession?.adminId) {
    await logAdminAction("admin.logout", ctx.state.adminSession.adminId, {
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });
  }

  return response;
}
