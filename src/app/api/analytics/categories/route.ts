import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { analyticsEngine } from "@/core/analytics/analytics-engine";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "7d";
    const now = new Date();
    let startDate: Date;

    if (range === "30d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === "90d") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
    } else {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    }

    const categories = await analyticsEngine.getEventCountByCategory(startDate, now);
    return NextResponse.json(successResponse(categories));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
