import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { coupon as couponTable } from "@/lib/db/schema/commerce";
import { eq } from "drizzle-orm";

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
    const [row] = await db.select().from(couponTable).where(eq(couponTable.id, id)).limit(1);

    if (!row) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(successResponse({
      id: row.id,
      code: row.code,
      type: row.type,
      value: Number(row.value),
      currency: row.currency,
      minPurchase: row.minPurchase ? Number(row.minPurchase) : undefined,
      maxDiscount: row.maxDiscount ? Number(row.maxDiscount) : undefined,
      expiresAt: row.expiresAt.toISOString(),
      usageLimit: Number(row.usageLimit),
      isActive: row.isActive,
      applicableProducts: row.applicableProducts,
      applicablePlans: row.applicablePlans,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
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

    const [existing] = await db.select().from(couponTable).where(eq(couponTable.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
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

    const [updated] = await db.update(couponTable).set(updateData).where(eq(couponTable.id, id)).returning();

    return NextResponse.json(successResponse({
      id: updated.id,
      code: updated.code,
      type: updated.type,
      value: Number(updated.value),
      currency: updated.currency,
      minPurchase: updated.minPurchase ? Number(updated.minPurchase) : undefined,
      maxDiscount: updated.maxDiscount ? Number(updated.maxDiscount) : undefined,
      expiresAt: updated.expiresAt.toISOString(),
      usageLimit: Number(updated.usageLimit),
      isActive: updated.isActive,
      applicableProducts: updated.applicableProducts,
      applicablePlans: updated.applicablePlans,
      metadata: updated.metadata,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }));
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

    const [existing] = await db.select().from(couponTable).where(eq(couponTable.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    await db.delete(couponTable).where(eq(couponTable.id, id));

    return NextResponse.json(successResponse({ message: "Coupon deleted successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
