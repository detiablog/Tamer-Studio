import { db } from "@/lib/db";
import { scaleCostMetric } from "@/lib/db/schema/scaling";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class CostService {
  async recordCost(data: { category: string; provider?: string; amountUsd: number; creditsUsed?: number; resourceType?: string; quantity?: number; unitCost?: number; period?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("scm");
    return db.insert(scaleCostMetric).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listCosts(filters?: { category?: string; provider?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.category) conditions.push(eq(scaleCostMetric.category, filters.category));
    if (filters?.provider) conditions.push(eq(scaleCostMetric.provider, filters.provider));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(scaleCostMetric).where(where).orderBy(desc(scaleCostMetric.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(scaleCostMetric).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getCostSummary(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const [totalCost] = await db.select({ total: sql<number>`coalesce(sum(${scaleCostMetric.amountUsd}), 0)` }).from(scaleCostMetric).where(gte(scaleCostMetric.createdAt, since));
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${scaleCostMetric.creditsUsed}), 0)` }).from(scaleCostMetric).where(gte(scaleCostMetric.createdAt, since));
    const byCategory = await db.select({ category: scaleCostMetric.category, total: sql<number>`sum(${scaleCostMetric.amountUsd})` }).from(scaleCostMetric).where(gte(scaleCostMetric.createdAt, since)).groupBy(scaleCostMetric.category);
    const byProvider = await db.select({ provider: scaleCostMetric.provider, total: sql<number>`sum(${scaleCostMetric.amountUsd})` }).from(scaleCostMetric).where(gte(scaleCostMetric.createdAt, since)).groupBy(scaleCostMetric.provider);
    return {
      totalCost: Number(totalCost?.total ?? 0),
      totalCredits: Number(totalCredits?.total ?? 0),
      byCategory,
      byProvider,
    };
  }

  async cleanup(retentionDays = 90) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(scaleCostMetric).where(gte(scaleCostMetric.createdAt, cutoff));
  }
}

export const costService = new CostService();
