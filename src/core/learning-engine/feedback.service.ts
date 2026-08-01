import { db } from "@/lib/db";
import { learningFeedback } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class FeedbackService {
  async submitFeedback(userId: string, data: { entityType: string; entityId: string; rating: number; feedback?: string; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(learningFeedback).where(and(eq(learningFeedback.userId, userId), eq(learningFeedback.entityId, data.entityId), eq(learningFeedback.entityType, data.entityType))).limit(1);
    if (existing.length > 0) {
      return db.update(learningFeedback).set({ rating: data.rating, feedback: data.feedback, metadata: data.metadata || {} }).where(eq(learningFeedback.id, existing[0].id)).returning().then(r => r[0]);
    }
    const id = generateId("lfbk");
    return db.insert(learningFeedback).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listFeedback(userId: string, filters?: { entityType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningFeedback.userId, userId)];
    if (filters?.entityType) conditions.push(eq(learningFeedback.entityType, filters.entityType));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningFeedback).where(where).orderBy(desc(learningFeedback.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningFeedback).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async deleteFeedback(id: string) {
    await db.delete(learningFeedback).where(eq(learningFeedback.id, id));
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(learningFeedback).where(eq(learningFeedback.userId, userId));
    const [avgRating] = await db.select({ avg: sql<number>`coalesce(avg(${learningFeedback.rating}), 0)` }).from(learningFeedback).where(eq(learningFeedback.userId, userId));
    const byType = await db.select({ entityType: learningFeedback.entityType, count: sql<number>`count(*)`, avgRating: sql<number>`avg(${learningFeedback.rating})` }).from(learningFeedback).where(eq(learningFeedback.userId, userId)).groupBy(learningFeedback.entityType);
    return { totalFeedback: Number(total?.count ?? 0), avgRating: Math.round(Number(avgRating?.avg ?? 0) * 10) / 10, byType };
  }
}

export const feedbackService = new FeedbackService();
