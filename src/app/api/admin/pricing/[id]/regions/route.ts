import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { pricingService } from "@/core/pricing";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const existing = await pricingService.getPricingItem(id);
    if (!existing) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Pricing item not found"), { status: 404 });
    }

    const regions = await pricingService.findRegions(id);
    return NextResponse.json(successResponse(regions));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();

    const existing = await pricingService.getPricingItem(id);
    if (!existing) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Pricing item not found"), { status: 404 });
    }

    if (!body.country || !body.currency || !body.overridePrice) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "country, currency, and overridePrice are required"), { status: 422 });
    }

    const region = await pricingService.upsertRegion({
      pricingItemId: id,
      country: body.country,
      region: body.region,
      currency: body.currency,
      overridePrice: body.overridePrice,
      overrideSalePrice: body.overrideSalePrice,
      isActive: body.isActive,
    });

    return NextResponse.json(successResponse(region), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
