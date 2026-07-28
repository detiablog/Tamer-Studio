import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { paymentService } from "@/core/payment";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();
    const { workspaceId, planId } = body;

    if (!workspaceId || !planId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "workspaceId and planId are required" } },
        { status: 400 }
      );
    }

    const userId = ctx.state.userSession!.userId;
    const session = await paymentService.createCheckout(userId, workspaceId, planId);

    return NextResponse.json(successResponse(session));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
