import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { contextBuilderService } from "@/core/creative-memory/context-builder.service";

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
    const userId = ctx.state.userSession?.userId;
    if (!userId) {
      return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    if (!q) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "q is required"), { status: 400 });
    }

    const categoriesStr = searchParams.get("categories");
    const categories = categoriesStr ? categoriesStr.split(",") : undefined;

    const results = await contextBuilderService.searchContext(userId, q, {
      categories,
      limit: Number(searchParams.get("limit")) || undefined,
    });
    return NextResponse.json(successResponse(results));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
