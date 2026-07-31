import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { assetManagementService } from "@/core/assets/asset-management.service";

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
    const url = new URL(request.url);
    const filters = {
      userId: ctx.state.userSession?.userId,
      kind: url.searchParams.get("kind") || undefined,
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
      tags: url.searchParams.get("tags")?.split(",").filter(Boolean),
      collectionId: url.searchParams.get("collectionId") || undefined,
      isFavorite: url.searchParams.get("isFavorite") === "true" || undefined,
      page: Number(url.searchParams.get("page")) || undefined,
      limit: Number(url.searchParams.get("limit")) || undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: (url.searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    };
    const result = await assetManagementService.list(filters);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
