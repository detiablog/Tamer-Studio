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
    const reports = await hypercareService.getReports({
      type: searchParams.get("type") || undefined,
      period: searchParams.get("period") || undefined,
    });
    return NextResponse.json(successResponse(reports));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
