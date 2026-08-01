import { db } from "@/lib/db";
import { assetQualityScore } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AssetQualityScoreService {
  async scoreAsset(userId: string, data: { assetId: string; resolution?: number; sharpness?: number; composition?: number; lighting?: number; brandConsistency?: number; technicalQuality?: number; metadata?: Record<string, unknown> }) {
    const overall = Math.round((data.resolution || 50) * 0.15 + (data.sharpness || 50) * 0.15 + (data.composition || 50) * 0.2 + (data.lighting || 50) * 0.15 + (data.brandConsistency || 50) * 0.15 + (data.technicalQuality || 50) * 0.2);
    const existing = await db.select().from(assetQualityScore).where(eq(assetQualityScore.assetId, data.assetId)).limit(1);
    if (existing.length > 0) {
      return db.update(assetQualityScore).set({ ...data, overallScore: overall, metadata: data.metadata || {} }).where(eq(assetQualityScore.id, existing[0].id)).returning().then(r => r[0]);
    }
    const id = generateId("aqsc");
    return db.insert(assetQualityScore).values({ ...data, id, userId, overallScore: overall }).returning().then(r => r[0]);
  }

  async getScore(assetId: string) {
    const [item] = await db.select().from(assetQualityScore).where(eq(assetQualityScore.assetId, assetId)).limit(1);
    return item || null;
  }

  async listScores(userId: string, filters?: { minScore?: number; maxScore?: number; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetQualityScore.userId, userId)];
    if (filters?.minScore !== undefined) conditions.push(sql`${assetQualityScore.overallScore} >= ${filters.minScore}`);
    if (filters?.maxScore !== undefined) conditions.push(sql`${assetQualityScore.overallScore} <= ${filters.maxScore}`);
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetQualityScore).where(where).orderBy(desc(assetQualityScore.overallScore)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetQualityScore).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async deleteScore(id: string) {
    await db.delete(assetQualityScore).where(eq(assetQualityScore.id, id));
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetQualityScore).where(eq(assetQualityScore.userId, userId));
    const [avgScore] = await db.select({ avg: sql<number>`coalesce(avg(${assetQualityScore.overallScore}), 0)` }).from(assetQualityScore).where(eq(assetQualityScore.userId, userId));
    return { totalScored: Number(total?.count ?? 0), avgScore: Math.round(Number(avgScore?.avg ?? 0)) };
  }
}

export const assetQualityScoreService = new AssetQualityScoreService();
