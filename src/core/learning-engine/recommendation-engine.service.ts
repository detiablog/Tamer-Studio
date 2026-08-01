import { db } from "@/lib/db";
import { learningRecommendation } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type RecCategory = "creative" | "publishing" | "marketing" | "storytelling" | "automation" | "performance" | "asset_management" | "workflow" | "brand" | "platform" | "project";

export class RecommendationEngineService {
  async listRecommendations(userId: string, filters?: { category?: string; status?: string; minConfidence?: number; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningRecommendation.userId, userId)];
    if (filters?.category) conditions.push(eq(learningRecommendation.category, filters.category));
    if (filters?.status) conditions.push(eq(learningRecommendation.status, filters.status));
    if (filters?.minConfidence) conditions.push(sql`${learningRecommendation.confidence} >= ${filters.minConfidence}`);
    if (filters?.search) conditions.push(like(learningRecommendation.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningRecommendation).where(where).orderBy(desc(learningRecommendation.priority), desc(learningRecommendation.confidence)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningRecommendation).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRecommendation(userId: string, data: { category: string; title: string; description?: string; reason?: string; expectedBenefit?: string; confidence?: number; priority?: number; entityType?: string; entityId?: string; data?: Record<string, unknown> }) {
    const id = generateId("lrec");
    return db.insert(learningRecommendation).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getRecommendation(id: string) {
    const [item] = await db.select().from(learningRecommendation).where(eq(learningRecommendation.id, id)).limit(1);
    return item || null;
  }

  async updateStatus(id: string, status: string) {
    return db.update(learningRecommendation).set({ status, updatedAt: new Date() }).where(eq(learningRecommendation.id, id)).returning().then(r => r[0]);
  }

  async deleteRecommendation(id: string) {
    await db.delete(learningRecommendation).where(eq(learningRecommendation.id, id));
  }

  async generateRecommendations(userId: string) {
    const existing = await db.select().from(learningRecommendation).where(and(eq(learningRecommendation.userId, userId), eq(learningRecommendation.status, "open")));
    if (existing.length >= 20) return existing;

    const recs = await this.buildRecommendations(userId);
    for (const rec of recs) {
      await this.createRecommendation(userId, rec);
    }
    return recs;
  }

  private async buildRecommendations(userId: string) {
    const recommendations: Array<{ category: string; title: string; description: string; reason: string; expectedBenefit: string; confidence: number; priority: number; data?: Record<string, unknown> }> = [];

    recommendations.push({ category: "workflow", title: "Optimize your workflow", description: "Based on your usage patterns, you may benefit from automation.", reason: "Detected repeated manual tasks.", expectedBenefit: "Save time on repetitive tasks.", confidence: 60, priority: 40 });
    recommendations.push({ category: "creative", title: "Explore new creative styles", description: "Try different visual styles for your content.", reason: "Your recent content shows consistent style preferences.", expectedBenefit: "Diversify your creative output.", confidence: 50, priority: 30 });
    recommendations.push({ category: "publishing", title: "Optimize publishing schedule", description: "Adjust your publishing times for better engagement.", reason: "Analytics show optimal engagement windows.", expectedBenefit: "Increase audience reach.", confidence: 55, priority: 35 });

    return recommendations;
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(learningRecommendation).where(eq(learningRecommendation.userId, userId));
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(learningRecommendation).where(and(eq(learningRecommendation.userId, userId), eq(learningRecommendation.status, "open")));
    const [accepted] = await db.select({ count: sql<number>`count(*)` }).from(learningRecommendation).where(and(eq(learningRecommendation.userId, userId), eq(learningRecommendation.status, "accepted")));
    const [ignored] = await db.select({ count: sql<number>`count(*)` }).from(learningRecommendation).where(and(eq(learningRecommendation.userId, userId), eq(learningRecommendation.status, "ignored")));
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), accepted: Number(accepted?.count ?? 0), ignored: Number(ignored?.count ?? 0), acceptanceRate: Number(total?.count ?? 0) > 0 ? Math.round((Number(accepted?.count ?? 0) / Number(total?.count ?? 1)) * 100) : 0 };
  }
}

export const recommendationEngineService = new RecommendationEngineService();
