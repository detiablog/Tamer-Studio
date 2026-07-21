import { db } from "@/lib/db";
import { coupon as couponTable, couponUsage as couponUsageTable } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Coupon, CouponUsage } from "../types";

export interface CouponRepository {
  createCoupon(coupon: Omit<Coupon, "id" | "createdAt" | "updatedAt">): Promise<Coupon>;
  getCoupon(code: string): Promise<Coupon | undefined>;
  listCoupons(): Promise<Coupon[]>;
  recordUsage(usage: Omit<CouponUsage, "id" | "createdAt">): Promise<CouponUsage>;
  getUsageCount(couponId: string, workspaceId?: string, userId?: string): Promise<number>;
}

export class DefaultCouponRepository implements CouponRepository {
  async createCoupon(coupon: Omit<Coupon, "id" | "createdAt" | "updatedAt">): Promise<Coupon> {
    const id = `coup_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(couponTable).values({
      id,
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      currency: coupon.currency,
      minPurchase: coupon.minPurchase ? String(coupon.minPurchase) : null,
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : null,
      expiresAt: new Date(coupon.expiresAt),
      usageLimit: String(coupon.usageLimit),
      isActive: coupon.isActive,
      applicableProducts: coupon.applicableProducts ?? [],
      applicablePlans: coupon.applicablePlans ?? [],
      metadata: coupon.metadata ?? {},
    });
    return {
      ...coupon,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getCoupon(code: string): Promise<Coupon | undefined> {
    const rows = await db.select().from(couponTable).where(eq(couponTable.code, code)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async listCoupons(): Promise<Coupon[]> {
    const rows = await db.select().from(couponTable);
    return rows.map((row) => this.mapRow(row));
  }

  async recordUsage(usage: Omit<CouponUsage, "id" | "createdAt">): Promise<CouponUsage> {
    const id = `cu_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(couponUsageTable).values({
      id,
      couponId: usage.couponId,
      orderId: usage.orderId,
      workspaceId: usage.workspaceId,
      userId: usage.userId,
      discountAmount: String(usage.discountAmount),
      currency: usage.currency,
      metadata: usage.metadata ?? {},
    });
    return {
      ...usage,
      id,
      createdAt: now.toISOString(),
    };
  }

  async getUsageCount(couponId: string, workspaceId?: string, userId?: string): Promise<number> {
    const conditions = [eq(couponUsageTable.couponId, couponId)];
    if (workspaceId) conditions.push(eq(couponUsageTable.workspaceId, workspaceId));
    if (userId) conditions.push(eq(couponUsageTable.userId, userId));

    const result = await db.select({ count: sql<number>`count(*)` }).from(couponUsageTable).where(and(...conditions));
    return Number(result[0]?.count ?? 0);
  }

  private mapRow(row: typeof couponTable.$inferSelect): Coupon {
    return {
      id: row.id,
      code: row.code,
      type: row.type as Coupon["type"],
      value: Number(row.value),
      currency: row.currency,
      minPurchase: row.minPurchase ? Number(row.minPurchase) : undefined,
      maxDiscount: row.maxDiscount ? Number(row.maxDiscount) : undefined,
      expiresAt: row.expiresAt.toISOString(),
      usageLimit: Number(row.usageLimit),
      isActive: row.isActive,
      applicableProducts: row.applicableProducts,
      applicablePlans: row.applicablePlans,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
