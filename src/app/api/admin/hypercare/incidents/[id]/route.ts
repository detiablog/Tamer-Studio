import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { hypercareService } from "@/core/hypercare/hypercare.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx: RequestContext = {
    request,
    params: { id },
    state: {
      rateLimit: undefined, origin: undefined,
      adminSession: undefined, userSession: undefined,
      authError: undefined, permissionError: undefined,
      csrfError: undefined, rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware(
    [adminAuthentication(), requireAdminPermission("admin:read")], ctx
  );
  if (errorResponse) return errorResponse;

  try {
    const incident = await hypercareService.getIncidentById(id);
    if (!incident) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Incident not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json(successResponse(incident));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx: RequestContext = {
    request,
    params: { id },
    state: {
      rateLimit: undefined, origin: undefined,
      adminSession: undefined, userSession: undefined,
      authError: undefined, permissionError: undefined,
      csrfError: undefined, rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware(
    [adminAuthentication(), requireAdminPermission("admin:write")], ctx
  );
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const adminId = (ctx.state.adminSession as any)?.adminId || undefined;
    const incident = await hypercareService.updateIncident(id, body, adminId);
    if (!incident) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Incident not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json(successResponse(incident, "Incident updated"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
