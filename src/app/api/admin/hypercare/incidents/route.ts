import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { hypercareService } from "@/core/hypercare/hypercare.service";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
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
    const { searchParams } = new URL(request.url);
    const result = await hypercareService.getIncidents({
      status: searchParams.get("status") || undefined,
      severity: searchParams.get("severity") || undefined,
      module: searchParams.get("module") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : 20,
    });
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined, origin: undefined,
      adminSession: undefined, userSession: undefined,
      authError: undefined, permissionError: undefined,
      csrfError: undefined, rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "POST",
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
    const incident = await hypercareService.createIncident(body, adminId);
    return NextResponse.json(successResponse(incident, "Incident created"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
