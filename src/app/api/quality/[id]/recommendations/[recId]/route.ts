import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { recommendationEngineService } from "@/core/quality-assurance/recommendation-engine.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recId: string }> }
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { recId } = await params;
    const body = await request.json();
    if (!body.status) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "status is required"), { status: 400 });
    }

    const recommendation = await recommendationEngineService.updateStatus(recId, body.status);
    if (!recommendation) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Recommendation not found"), { status: 404 });
    }
    return NextResponse.json(successResponse(recommendation));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
