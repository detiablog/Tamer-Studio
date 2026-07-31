import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { pricingEngine } from "@/core/pricing";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("pricing.read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();

    if (!body.pricingItemId) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "pricingItemId is required"), { status: 422 });
    }

    const result = await pricingEngine.calculate({
      pricingItemId: body.pricingItemId,
      country: body.country,
      currency: body.currency,
      campaignCode: body.campaignCode,
      couponCode: body.couponCode,
      referralCode: body.referralCode,
    });

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
