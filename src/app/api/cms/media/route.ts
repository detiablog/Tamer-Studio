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
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const media = await cmsService.listMedia({ folder, type });
    const start = (page - 1) * limit;
    const paginated = media.slice(start, start + limit);

    return NextResponse.json(paginatedResponse(paginated, media.length, page, limit));
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
    const media = await cmsService.registerMedia(body);
    return NextResponse.json(successResponse(media, "Media uploaded successfully"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}