import { db } from "@/lib/db";
import { campaign, coupon, couponRedemption, voucher, voucherClaim, campaignStat } from "@/lib/db/schema/campaigns";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class CampaignRepository {
  async findCampaigns(filters?: { status?: string; type?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(campaign.status, filters.status));
    if (filters?.type) conditions.push(eq(campaign.type, filters.type));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(campaign).where(where).orderBy(desc(campaign.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(campaign).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async findCampaignById(id: string) {
    const [item] = await db.select().from(campaign).where(eq(campaign.id, id)).limit(1);
    return item;
  }

  async findCampaignByCode(code: string) {
    const [item] = await db.select().from(campaign).where(eq(campaign.code, code)).limit(1);
    return item;
  }

  async createCampaign(data: typeof campaign.$inferInsert) {
    const id = generateId("cmp");
    const [item] = await db.insert(campaign).values({ ...data, id }).returning();
    return item;
  }

  async updateCampaign(id: string, data: Partial<typeof campaign.$inferInsert>) {
    const [item] = await db.update(campaign).set({ ...data, updatedAt: new Date() }).where(eq(campaign.id, id)).returning();
    return item;
  }

  async deleteCampaign(id: string) {
    await db.delete(campaign).where(eq(campaign.id, id));
  }

  async findCoupons(filters?: { campaignId?: string; isActive?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.campaignId) conditions.push(eq(coupon.campaignId, filters.campaignId));
    if (filters?.isActive !== undefined) conditions.push(eq(coupon.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(coupon).where(where).orderBy(desc(coupon.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(coupon).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async findCouponByCode(code: string) {
    const [item] = await db.select().from(coupon).where(eq(coupon.code, code.toUpperCase())).limit(1);
    return item;
  }

  async createCoupon(data: typeof coupon.$inferInsert) {
    const id = generateId("cpn");
    const [item] = await db.insert(coupon).values({ ...data, id, code: data.code.toUpperCase() }).returning();
    return item;
  }

  async updateCoupon(id: string, data: Partial<typeof coupon.$inferInsert>) {
    const [item] = await db.update(coupon).set({ ...data, updatedAt: new Date() }).where(eq(coupon.id, id)).returning();
    return item;
  }

  async deleteCoupon(id: string) {
    await db.delete(coupon).where(eq(coupon.id, id));
  }

  async redeemCoupon(couponId: string, userId: string, discountAmount: string, orderAmount: string) {
    const id = generateId("redeem");
    const [item] = await db.insert(couponRedemption).values({ id, couponId, userId, discountAmount, orderAmount }).returning();
    await db.update(coupon).set({ usageCount: sql`${coupon.usageCount} + 1` }).where(eq(coupon.id, couponId));
    return item;
  }

  async findVouchers(filters?: { userId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(voucher.userId, filters.userId));
    if (filters?.status) conditions.push(eq(voucher.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(voucher).where(where).orderBy(desc(voucher.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(voucher).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async findVoucherByCode(code: string) {
    const [item] = await db.select().from(voucher).where(eq(voucher.code, code.toUpperCase())).limit(1);
    return item;
  }

  async createVoucher(data: typeof voucher.$inferInsert) {
    const id = generateId("vch");
    const [item] = await db.insert(voucher).values({ ...data, id, code: data.code.toUpperCase() }).returning();
    return item;
  }

  async claimVoucher(voucherId: string, userId: string) {
    const id = generateId("claim");
    const [item] = await db.insert(voucherClaim).values({ id, voucherId, userId }).returning();
    return item;
  }

  async findUserClaims(userId: string) {
    return db.select().from(voucherClaim).where(eq(voucherClaim.userId, userId)).orderBy(desc(voucherClaim.claimedAt));
  }

  async findActiveCampaigns() {
    const now = new Date();
    return db.select().from(campaign).where(
      and(
        eq(campaign.status, "running"),
        sql`${campaign.startsAt} <= ${now}`,
        sql`${campaign.endsAt} >= ${now}`
      )
    ).orderBy(desc(campaign.priority));
  }

  async getCampaignStats(campaignId: string) {
    const stats = await db.select().from(campaignStat).where(eq(campaignStat.campaignId, campaignId)).orderBy(desc(campaignStat.date));
    const totalViews = stats.reduce((sum, s) => sum + s.views, 0);
    const totalClicks = stats.reduce((sum, s) => sum + s.clicks, 0);
    const totalConversions = stats.reduce((sum, s) => sum + s.conversions, 0);
    return { stats, totalViews, totalClicks, totalConversions, ctr: totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(1) : "0", conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(1) : "0" };
  }

  async trackCampaignView(campaignId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [existing] = await db.select().from(campaignStat).where(and(eq(campaignStat.campaignId, campaignId), eq(campaignStat.date, today))).limit(1);
    if (existing) {
      await db.update(campaignStat).set({ views: sql`${campaignStat.views} + 1` }).where(eq(campaignStat.id, existing.id));
    } else {
      await db.insert(campaignStat).values({ id: generateId("cstat"), campaignId, date: today, views: 1 });
    }
  }

  async trackCampaignClick(campaignId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [existing] = await db.select().from(campaignStat).where(and(eq(campaignStat.campaignId, campaignId), eq(campaignStat.date, today))).limit(1);
    if (existing) {
      await db.update(campaignStat).set({ clicks: sql`${campaignStat.clicks} + 1` }).where(eq(campaignStat.id, existing.id));
    } else {
      await db.insert(campaignStat).values({ id: generateId("cstat"), campaignId, date: today, clicks: 1 });
    }
  }

  async getDashboardStats() {
    const [activeCount] = await db.select({ count: sql<number>`count(*)` }).from(campaign).where(eq(campaign.status, "running"));
    const [scheduledCount] = await db.select({ count: sql<number>`count(*)` }).from(campaign).where(eq(campaign.status, "scheduled"));
    const [expiredCount] = await db.select({ count: sql<number>`count(*)` }).from(campaign).where(eq(campaign.status, "expired"));
    const [totalCoupons] = await db.select({ count: sql<number>`count(*)` }).from(coupon);
    const [usedCoupons] = await db.select({ count: sql<number>`count(*)` }).from(couponRedemption);
    return { activeCampaigns: Number(activeCount?.count ?? 0), scheduledCampaigns: Number(scheduledCount?.count ?? 0), expiredCampaigns: Number(expiredCount?.count ?? 0), totalCoupons: Number(totalCoupons?.count ?? 0), usedCoupons: Number(usedCoupons?.count ?? 0) };
  }
}

export const campaignRepository = new CampaignRepository();
