import type { Coupon, CouponUsage, CouponValidationResult } from "../types";
import { DefaultCouponRepository } from "./coupon.repository";
import { logger } from "@/core/logger";

export interface CouponService {
  createCoupon(coupon: Omit<Coupon, "id" | "createdAt" | "updatedAt">): Promise<Coupon>;
  getCoupon(code: string): Promise<Coupon | undefined>;
  listCoupons(): Promise<Coupon[]>;
  validateCoupon(code: string, workspaceId: string, orderTotal: number, productIds?: string[]): Promise<CouponValidationResult>;
  recordCouponUsage(couponId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<CouponUsage>;
}

export class DefaultCouponService implements CouponService {
  private repository = new DefaultCouponRepository();

  async createCoupon(coupon: Omit<Coupon, "id" | "createdAt" | "updatedAt">): Promise<Coupon> {
    return this.repository.createCoupon(coupon);
  }

  async getCoupon(code: string): Promise<Coupon | undefined> {
    return this.repository.getCoupon(code);
  }

  async listCoupons(): Promise<Coupon[]> {
    return this.repository.listCoupons();
  }

  async validateCoupon(code: string, workspaceId: string, orderTotal: number, productIds?: string[]): Promise<CouponValidationResult> {
    const coupon = await this.repository.getCoupon(code.toUpperCase());
    if (!coupon) {
      return { valid: false, reason: "Coupon not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, reason: "Coupon is inactive" };
    }

    const now = new Date();
    const expiresAt = new Date(coupon.expiresAt);
    if (now > expiresAt) {
      return { valid: false, reason: "Coupon has expired" };
    }

    if (coupon.minPurchase && orderTotal < coupon.minPurchase) {
      return { valid: false, reason: `Minimum purchase of ${coupon.minPurchase} required` };
    }

    const usages = await this.repository.getUsageCount(coupon.id);
    if (coupon.usageLimit > 0 && usages >= coupon.usageLimit) {
      return { valid: false, reason: "Coupon usage limit reached" };
    }

    if (productIds && productIds.length > 0 && coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicable = productIds.some((id) => coupon.applicableProducts!.includes(id));
      if (!hasApplicable) {
        return { valid: false, reason: "Coupon not applicable to selected products" };
      }
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (orderTotal * coupon.value) / 100;
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, orderTotal);
    } else if (coupon.type === "free_credits") {
      discountAmount = coupon.value;
    }

    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return { valid: true, coupon, discountAmount };
  }

  async recordCouponUsage(couponId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<CouponUsage> {
    const usage = await this.repository.recordUsage({
      couponId,
      orderId,
      workspaceId,
      userId,
      discountAmount,
      currency: "USD",
    });
    logger.audit("coupon.used", { couponId, orderId, workspaceId, userId, discountAmount });
    return usage;
  }
}
