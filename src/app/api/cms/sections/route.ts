import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { CMSService } from "@/core/cms/cms.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";

const cmsService = new CMSService();

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const pageId = request.nextUrl.searchParams.get("pageId");
    if (!pageId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing pageId parameter" } },
        { status: 400 }
      );
    }
    const sections = await cmsService.listSections(pageId);
    return NextResponse.json(successResponse(sections));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const section = await cmsService.createSection(body);
    return NextResponse.json(successResponse(section, "Section created successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}