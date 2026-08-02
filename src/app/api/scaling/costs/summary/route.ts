import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { costService } from "@/core/scaling/cost.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

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

  const errorResponseMw = await runMiddleware([
    adminAuthentication(),
    requireAdminPermission("admin:read"),
  ], ctx);

  if (errorResponseMw) {
    return errorResponseMw;
  }

  try {
    const { searchParams } = request.nextUrl;
    const days = Number(searchParams.get("days")) || 30;
    const data = await costService.getCostSummary(days);
    return NextResponse.json(successResponse(data));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
