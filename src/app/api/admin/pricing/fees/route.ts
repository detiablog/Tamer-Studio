import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { pricingService } from "@/core/pricing";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("pricing.read")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const fees = await pricingService.findActiveFees();
    return NextResponse.json(successResponse(fees));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

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

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("pricing.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const body = await request.json();

    if (!body.name || !body.type || !body.rate) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "name, type, and rate are required"), { status: 422 });
    }

    const fee = await pricingService.createFee({
      name: body.name,
      type: body.type,
      rate: body.rate,
      minAmount: body.minAmount,
      maxAmount: body.maxAmount,
    });

    return NextResponse.json(successResponse(fee), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
