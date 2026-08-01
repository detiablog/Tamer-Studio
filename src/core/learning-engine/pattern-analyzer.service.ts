import { db } from "@/lib/db";
import { learningPattern, learningEvent } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PatternAnalyzerService {
  async analyzePatterns(userId: string) {
    const patterns = await db.select().from(learningPattern).where(and(eq(learningPattern.userId, userId), eq(learningPattern.isActive, true))).orderBy(desc(learningPattern.confidence));
    return patterns;
  }

  async detectPattern(userId: string, data: { patternName: string; patternType: string; category: string; value: unknown; confidence?: number; sampleSize?: number }) {
    const existing = await db.select().from(learningPattern).where(and(eq(learningPattern.userId, userId), eq(learningPattern.patternName, data.patternName), eq(learningPattern.patternType, data.patternType))).limit(1);

    if (existing.length > 0) {
      const newConfidence = Math.min(100, (existing[0].confidence + (data.confidence || 50)) / 2);
      const newSampleSize = existing[0].sampleSize + (data.sampleSize || 1);
      return db.update(learningPattern).set({
        value: data.value as Record<string, unknown>,
        confidence: Math.round(newConfidence),
        sampleSize: newSampleSize,
        lastSeenAt: new Date(),
      }).where(eq(learningPattern.id, existing[0].id)).returning().then(r => r[0]);
    }

    const id = generateId("lpatt");
    return db.insert(learningPattern).values({ ...data, id, userId, confidence: data.confidence || 50, sampleSize: data.sampleSize || 1 }).returning().then(r => r[0]);
  }

  async listPatterns(userId: string, filters?: { category?: string; patternType?: string; minConfidence?: number; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningPattern.userId, userId)];
    if (filters?.category) conditions.push(eq(learningPattern.category, filters.category));
    if (filters?.patternType) conditions.push(eq(learningPattern.patternType, filters.patternType));
    if (filters?.minConfidence) conditions.push(sql`${learningPattern.confidence} >= ${filters.minConfidence}`);
    if (filters?.search) conditions.push(like(learningPattern.patternName, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningPattern).where(where).orderBy(desc(learningPattern.confidence)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningPattern).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async deletePattern(id: string) {
    await db.delete(learningPattern).where(eq(learningPattern.id, id));
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(learningPattern).where(eq(learningPattern.userId, userId));
    const byCategory = await db.select({ category: learningPattern.category, count: sql<number>`count(*)` }).from(learningPattern).where(eq(learningPattern.userId, userId)).groupBy(learningPattern.category);
    const [avgConfidence] = await db.select({ avg: sql<number>`coalesce(avg(${learningPattern.confidence}), 0)` }).from(learningPattern).where(eq(learningPattern.userId, userId));
    return { totalPatterns: Number(total?.count ?? 0), byCategory, avgConfidence: Math.round(Number(avgConfidence?.avg ?? 0)) };
  }
}

export const patternAnalyzerService = new PatternAnalyzerService();
