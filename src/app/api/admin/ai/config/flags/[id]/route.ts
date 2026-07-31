import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { aiAdminService } from "@/core/ai/ai-admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();
    const session = ctx.state.adminSession;
    const adminId = session?.adminId || "system";

    if (typeof body.isEnabled === "boolean") {
      const updated = await aiAdminService.toggleFeatureFlag(id, body.isEnabled);
      if (!updated) {
        return NextResponse.json(errorResponse("NOT_FOUND", "Feature flag not found"), { status: 404 });
      }
      await aiAdminService.logAction(adminId, "toggle_feature_flag", "feature_flag", id, body, ctx.ip);
      return NextResponse.json(successResponse(updated));
    }

    const updated = await aiAdminService.toggleFeatureFlag(id, body.isEnabled ?? false);
    if (!updated) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Feature flag not found"), { status: 404 });
    }

    await aiAdminService.logAction(adminId, "update_feature_flag", "feature_flag", id, body, ctx.ip);
    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const session = ctx.state.adminSession;
    const adminId = session?.adminId || "system";

    await aiAdminService.deleteFeatureFlag(id);
    await aiAdminService.logAction(adminId, "delete_feature_flag", "feature_flag", id, {}, ctx.ip);

    return NextResponse.json(successResponse({ message: "Feature flag deleted" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
