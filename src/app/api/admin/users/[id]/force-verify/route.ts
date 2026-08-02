import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { logAuditIfNeeded } from "@/core/middleware";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ctx: RequestContext = {
    request,
    params: resolvedParams,
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:users")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = resolvedParams;
    const service = new UserService();
    const adminSessionToken = ctx.state.adminSession?.id;
    const user = await service.updateUser(id, {
      emailVerified: true,
      status: "active",
    }, adminSessionToken);

    logAuditIfNeeded("user.force_verify", ctx, {
      targetUserId: id,
      adminId: ctx.state.adminSession?.adminId,
    });

    return NextResponse.json(successResponse(user, "User force-verified successfully"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
