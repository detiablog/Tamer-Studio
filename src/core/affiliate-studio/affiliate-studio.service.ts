import { db } from "@/lib/db";
import { affiliateCampaign, affiliateProduct, affiliateBrandKit, affiliateGenerationJob } from "@/lib/db/schema/affiliate-studio";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AffiliateStudioService {
  async listCampaigns(userId: string, filters?: { status?: string; type?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(affiliateCampaign.userId, userId)];
    if (filters?.status) conditions.push(eq(affiliateCampaign.status, filters.status));
    if (filters?.type) conditions.push(eq(affiliateCampaign.type, filters.type));
    if (filters?.search) conditions.push(like(affiliateCampaign.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(affiliateCampaign).where(where).orderBy(desc(affiliateCampaign.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(affiliateCampaign).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCampaign(userId: string, data: { name: string; description?: string; type?: string; productId?: string; brandKitId?: string; strategy?: Record<string, unknown>; platforms?: string[]; assets?: Record<string, string>; scripts?: Record<string, unknown>; captions?: Record<string, unknown>; hashtags?: string[] }) {
    const id = generateId("acmp");
    return db.insert(affiliateCampaign).values({
      ...data,
      id,
      userId,
      strategy: data.strategy || {},
      platforms: data.platforms || [],
      assets: data.assets || {},
      scripts: data.scripts || {},
      captions: data.captions || {},
      hashtags: data.hashtags || [],
    }).returning().then(r => r[0]);
  }

  async getCampaign(id: string) {
    const [item] = await db.select().from(affiliateCampaign).where(eq(affiliateCampaign.id, id)).limit(1);
    return item || null;
  }

  async updateCampaign(id: string, data: Record<string, unknown>) {
    return db.update(affiliateCampaign).set(data).where(eq(affiliateCampaign.id, id)).returning().then(r => r[0]);
  }

  async deleteCampaign(id: string) {
    await db.delete(affiliateCampaign).where(eq(affiliateCampaign.id, id));
  }

  async listProducts(userId: string, filters?: { category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(affiliateProduct.userId, userId)];
    if (filters?.category) conditions.push(eq(affiliateProduct.category, filters.category));
    if (filters?.search) conditions.push(like(affiliateProduct.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(affiliateProduct).where(where).orderBy(desc(affiliateProduct.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(affiliateProduct).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createProduct(userId: string, data: { name: string; brand?: string; category?: string; description?: string; url?: string; price?: string; discount?: string; images?: string[]; specifications?: Record<string, string> }) {
    const id = generateId("aprd");
    return db.insert(affiliateProduct).values({
      ...data,
      id,
      userId,
      images: data.images || [],
      specifications: data.specifications || {},
    }).returning().then(r => r[0]);
  }

  async getProduct(id: string) {
    const [item] = await db.select().from(affiliateProduct).where(eq(affiliateProduct.id, id)).limit(1);
    return item || null;
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    return db.update(affiliateProduct).set(data).where(eq(affiliateProduct.id, id)).returning().then(r => r[0]);
  }

  async deleteProduct(id: string) {
    await db.delete(affiliateProduct).where(eq(affiliateProduct.id, id));
  }

  async listBrandKits(userId: string, filters?: { isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(affiliateBrandKit.userId, userId)];
    if (filters?.isActive !== undefined) conditions.push(eq(affiliateBrandKit.isActive, filters.isActive));
    if (filters?.search) conditions.push(like(affiliateBrandKit.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(affiliateBrandKit).where(where).orderBy(desc(affiliateBrandKit.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(affiliateBrandKit).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createBrandKit(userId: string, data: { name: string; logo?: string; colors?: Record<string, string>; tone?: string; targetAudience?: string; ctaStyle?: string; watermark?: string; socialLinks?: Record<string, string> }) {
    const id = generateId("abkt");
    return db.insert(affiliateBrandKit).values({
      ...data,
      id,
      userId,
      colors: data.colors || {},
      socialLinks: data.socialLinks || {},
    }).returning().then(r => r[0]);
  }

  async getBrandKit(id: string) {
    const [item] = await db.select().from(affiliateBrandKit).where(eq(affiliateBrandKit.id, id)).limit(1);
    return item || null;
  }

  async updateBrandKit(id: string, data: Record<string, unknown>) {
    return db.update(affiliateBrandKit).set(data).where(eq(affiliateBrandKit.id, id)).returning().then(r => r[0]);
  }

  async deleteBrandKit(id: string) {
    await db.delete(affiliateBrandKit).where(eq(affiliateBrandKit.id, id));
  }

  async listJobs(userId: string, filters?: { campaignId?: string; status?: string; type?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(affiliateGenerationJob.userId, userId)];
    if (filters?.campaignId) conditions.push(eq(affiliateGenerationJob.campaignId, filters.campaignId));
    if (filters?.status) conditions.push(eq(affiliateGenerationJob.status, filters.status));
    if (filters?.type) conditions.push(eq(affiliateGenerationJob.type, filters.type));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(affiliateGenerationJob).where(where).orderBy(desc(affiliateGenerationJob.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(affiliateGenerationJob).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createJob(userId: string, data: { campaignId: string; type: string; input?: Record<string, unknown> }) {
    const id = generateId("ajob");
    return db.insert(affiliateGenerationJob).values({
      ...data,
      id,
      userId,
      input: data.input || {},
    }).returning().then(r => r[0]);
  }

  async getJob(id: string) {
    const [item] = await db.select().from(affiliateGenerationJob).where(eq(affiliateGenerationJob.id, id)).limit(1);
    return item || null;
  }

  async updateJob(id: string, data: Record<string, unknown>) {
    return db.update(affiliateGenerationJob).set(data).where(eq(affiliateGenerationJob.id, id)).returning().then(r => r[0]);
  }

  async deleteJob(id: string) {
    await db.delete(affiliateGenerationJob).where(eq(affiliateGenerationJob.id, id));
  }

  async getStats(userId: string) {
    const conditions = [eq(affiliateGenerationJob.userId, userId)];
    const [totalJobs] = await db.select({ count: sql<number>`count(*)` }).from(affiliateGenerationJob).where(and(...conditions));
    const [completedJobs] = await db.select({ count: sql<number>`count(*)` }).from(affiliateGenerationJob).where(and(...conditions, eq(affiliateGenerationJob.status, "completed")));
    const [totalCampaigns] = await db.select({ count: sql<number>`count(*)` }).from(affiliateCampaign).where(eq(affiliateCampaign.userId, userId));
    const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(affiliateProduct).where(eq(affiliateProduct.userId, userId));
    const [totalBrandKits] = await db.select({ count: sql<number>`count(*)` }).from(affiliateBrandKit).where(eq(affiliateBrandKit.userId, userId));
    const [totalCredits] = await db.select({ sum: sql<number>`coalesce(sum(${affiliateGenerationJob.creditsUsed}), 0)` }).from(affiliateGenerationJob).where(and(...conditions));
    return {
      totalJobs: Number(totalJobs?.count ?? 0),
      completedJobs: Number(completedJobs?.count ?? 0),
      totalCampaigns: Number(totalCampaigns?.count ?? 0),
      totalProducts: Number(totalProducts?.count ?? 0),
      totalBrandKits: Number(totalBrandKits?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.sum ?? 0),
    };
  }
}

export const affiliateStudioService = new AffiliateStudioService();
