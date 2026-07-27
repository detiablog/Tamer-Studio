import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { AdminService } from "@/core/admin/admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

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

  const errorResponse = await runMiddleware([adminAuthentication(true)], ctx);
  if (errorResponse) return errorResponse;

  try {
    const session = ctx.state.adminSession;

    if (session?.adminId) {
      const service = new AdminService();
      const profile = await service.getAdminProfile(session.adminId);
      if (profile?.isActive) {
        return NextResponse.json(successResponse(profile));
      }
    }

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(successResponse({
        id: "dev-admin",
        email: "admin@tamer.studio",
        name: "Admin User",
        role: "super_admin",
        isActive: true,
        lastLoginAt: new Date(),
        initials: "AU",
      }));
    }

    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
