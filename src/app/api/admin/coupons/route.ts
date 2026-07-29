import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, paginatedResponse } from "@/app/api/mappers/response";
import { DefaultCouponRepository } from "@/core/commerce/coupon";
import type { Coupon } from "@/core/commerce/types";

const couponRepo = new DefaultCouponRepository();

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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const coupons = await couponRepo.listCoupons();
    return NextResponse.json(paginatedResponse(coupons, coupons.length, 1, coupons.length));
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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    if (!body.code || !body.type || body.value === undefined || !body.currency || !body.expiresAt || body.usageLimit === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: code, type, value, currency, expiresAt, usageLimit" },
        { status: 400 }
      );
    }

    const coupon = await couponRepo.createCoupon({
      code: body.code,
      type: body.type as Coupon["type"],
      value: Number(body.value),
      currency: body.currency,
      minPurchase: body.minPurchase ? Number(body.minPurchase) : undefined,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      expiresAt: body.expiresAt,
      usageLimit: Number(body.usageLimit),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      applicableProducts: body.applicableProducts,
      applicablePlans: body.applicablePlans,
      metadata: body.metadata,
    });

    return NextResponse.json(successResponse(coupon), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
