import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { CMSService } from "@/core/cms/cms.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";

const cmsService = new CMSService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
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
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { contentId } = await params;
    const versions = await cmsService.getVersions(contentId);
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    const start = (page - 1) * limit;
    const paginated = versions.slice(start, start + limit);
    return NextResponse.json(paginatedResponse(paginated, versions.length, page, limit));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { contentId } = await params;
    const body = await request.json();
    const session = ctx.state.adminSession;
    if (!session?.adminId) {
      return NextResponse.json({ success: false, error: { code: "AUTHENTICATION_ERROR", message: "Unauthorized" } }, { status: 401 });
    }

    const version = await cmsService.createVersion(contentId, body.contentType, body.data, session.adminId, body.message);
    return NextResponse.json(successResponse(version, "Version created successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}