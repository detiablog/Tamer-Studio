import { campaignRepository } from "./campaign.repository";
import { generateId } from "@/modules/email/email.encryption";

export class CampaignService {
  private repo = campaignRepository;

  async listCampaigns(filters?: { status?: string; type?: string; page?: number; limit?: number }) {
    return this.repo.findCampaigns(filters);
  }

  async getCampaign(id: string) {
    return this.repo.findCampaignById(id);
  }

  async getCampaignByCode(code: string) {
    return this.repo.findCampaignByCode(code);
  }

  async createCampaign(data: { name: string; code: string; type: string; description?: string; status?: string; startsAt?: string; endsAt?: string; config?: Record<string, unknown>; rules?: Record<string, unknown>; targetAudience?: Record<string, unknown>; priority?: number; language?: string; visibility?: string; banner?: string; thumbnail?: string; timezone?: string; createdBy?: string }) {
    return this.repo.createCampaign({
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type,
      description: data.description || null,
      status: data.status || "draft",
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      config: data.config || {},
      rules: data.rules || {},
      targetAudience: data.targetAudience || {},
      priority: data.priority ?? 0,
      language: data.language || "en",
      visibility: data.visibility || "public",
      banner: data.banner || null,
      thumbnail: data.thumbnail || null,
      timezone: data.timezone || "UTC",
      createdBy: data.createdBy || null,
    });
  }

  async updateCampaign(id: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = String(data.code).toUpperCase();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.config !== undefined) updateData.config = data.config;
    if (data.rules !== undefined) updateData.rules = data.rules;
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(String(data.startsAt)) : null;
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(String(data.endsAt)) : null;
    return this.repo.updateCampaign(id, updateData);
  }

  async deleteCampaign(id: string) {
    return this.repo.deleteCampaign(id);
  }

  async listCoupons(filters?: { campaignId?: string; isActive?: boolean; page?: number; limit?: number }) {
    return this.repo.findCoupons(filters);
  }

  async getCouponByCode(code: string) {
    return this.repo.findCouponByCode(code);
  }

  async createCoupon(data: { campaignId?: string; code: string; type: string; value: string; minPurchase?: string; maxDiscount?: string; usageLimit?: number; perUserLimit?: number; startsAt?: string; endsAt?: string; createdBy?: string }) {
    return this.repo.createCoupon({
      campaignId: data.campaignId || null,
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase || "0",
      maxDiscount: data.maxDiscount || null,
      usageLimit: data.usageLimit || null,
      perUserLimit: data.perUserLimit ?? 1,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      createdBy: data.createdBy || null,
    });
  }

  async validateCoupon(code: string, userId: string) {
    const couponItem = await this.repo.findCouponByCode(code);
    if (!couponItem || !couponItem.isActive) return { valid: false, error: "Coupon not found or inactive" };
    if (couponItem.usageLimit && couponItem.usageCount >= couponItem.usageLimit) return { valid: false, error: "Coupon usage limit reached" };
    const now = new Date();
    if (couponItem.startsAt && now < couponItem.startsAt) return { valid: false, error: "Coupon not yet active" };
    if (couponItem.endsAt && now > couponItem.endsAt) return { valid: false, error: "Coupon has expired" };
    return { valid: true, coupon: couponItem };
  }

  async redeemCoupon(code: string, userId: string, orderAmount: string) {
    const validation = await this.validateCoupon(code, userId);
    if (!validation.valid) return validation;
    const discountAmount = this.calculateDiscount(validation.coupon!, orderAmount);
    return this.repo.redeemCoupon(validation.coupon!.id, userId, discountAmount, orderAmount);
  }

  private calculateDiscount(couponItem: { type: string; value: string; maxDiscount?: string | null }, orderAmount: string): string {
    const amount = parseFloat(orderAmount);
    const value = parseFloat(couponItem.value);
    let discount = 0;
    if (couponItem.type === "percentage") {
      discount = amount * (value / 100);
      if (couponItem.maxDiscount) {
        const max = parseFloat(couponItem.maxDiscount);
        discount = Math.min(discount, max);
      }
    } else if (couponItem.type === "fixed") {
      discount = value;
    }
    return Math.min(discount, amount).toFixed(2);
  }

  async listVouchers(filters?: { userId?: string; status?: string; page?: number; limit?: number }) {
    return this.repo.findVouchers(filters);
  }

  async claimVoucher(voucherId: string, userId: string) {
    return this.repo.claimVoucher(voucherId, userId);
  }

  async getDashboardStats() {
    return this.repo.getDashboardStats();
  }

  async getCampaignStats(campaignId: string) {
    return this.repo.getCampaignStats(campaignId);
  }
}

export const campaignService = new CampaignService();
