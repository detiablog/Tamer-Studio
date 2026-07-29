import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { DefaultCouponRepository } from "@/core/commerce/coupon/coupon.repository";

const couponRepo = new DefaultCouponRepository();

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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const coupon = await couponRepo.getCouponById(id);

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(successResponse(coupon));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function PUT(
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
    method: "PUT",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await couponRepo.getCouponById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = String(body.value);
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.minPurchase !== undefined) updateData.minPurchase = body.minPurchase !== null ? String(body.minPurchase) : null;
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount !== null ? String(body.maxDiscount) : null;
    if (body.expiresAt !== undefined) updateData.expiresAt = new Date(body.expiresAt);
    if (body.usageLimit !== undefined) updateData.usageLimit = String(body.usageLimit);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.applicableProducts !== undefined) updateData.applicableProducts = body.applicableProducts;
    if (body.applicablePlans !== undefined) updateData.applicablePlans = body.applicablePlans;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const updated = await couponRepo.updateCoupon(id, updateData);

    return NextResponse.json(successResponse(updated));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(
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
    method: "DELETE",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:coupons")], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const existing = await couponRepo.getCouponById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    await couponRepo.deleteCoupon(id);

    return NextResponse.json(successResponse({ message: "Coupon deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
