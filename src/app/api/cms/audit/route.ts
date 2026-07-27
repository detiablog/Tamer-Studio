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
    const contentId = searchParams.get("contentId") ?? undefined;
    const contentType = searchParams.get("contentType") ?? undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const logs = await cmsService.getAuditLog(contentId, contentType as any);
    const start = (page - 1) * limit;
    const paginated = logs.slice(start, start + limit);

    return NextResponse.json(paginatedResponse(paginated, logs.length, page, limit));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}