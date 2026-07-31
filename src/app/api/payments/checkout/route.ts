import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { paymentEngineService } from "@/core/payment/payment-engine.service";

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
    const { providerCode, method, currency, items, discount, tax, serviceFee, returnUrl, callbackUrl } = body;

    if (!providerCode || !method || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "providerCode, method, and items are required" } },
        { status: 400 }
      );
    }

    const userId = ctx.state.userSession!.userId;

    const result = await paymentEngineService.createCheckout({
      userId,
      providerCode,
      method,
      currency: currency || "USD",
      items,
      discount,
      tax,
      serviceFee,
      returnUrl,
      callbackUrl,
      ipAddress: ctx.ip,
      userAgent: request.headers.get("user-agent") || undefined,
      createdBy: userId,
    });

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
