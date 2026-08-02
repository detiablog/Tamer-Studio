import { db } from "@/lib/db";
import { betaFeedback, betaUser } from "@/lib/db/schema/beta";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class BetaFeedbackService {
  async submitFeedback(userId: string, data: { category: string; severity?: string; title: string; description?: string; steps?: string; expectedResult?: string; actualResult?: string; screenshot?: string; attachments?: string[]; rating?: number; browser?: string; os?: string; version?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("bfdb");
    await db.update(betaUser).set({ feedbackCount: sql`${betaUser.feedbackCount} + 1` }).where(eq(betaUser.userId, userId));
    return db.insert(betaFeedback).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listFeedback(filters?: { userId?: string; category?: string; status?: string; severity?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(betaFeedback.userId, filters.userId));
    if (filters?.category) conditions.push(eq(betaFeedback.category, filters.category));
    if (filters?.status) conditions.push(eq(betaFeedback.status, filters.status));
    if (filters?.severity) conditions.push(eq(betaFeedback.severity, filters.severity));
    if (filters?.search) conditions.push(like(betaFeedback.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaFeedback).where(where).orderBy(desc(betaFeedback.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaFeedback).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getFeedback(id: string) {
    const [item] = await db.select().from(betaFeedback).where(eq(betaFeedback.id, id)).limit(1);
    return item || null;
  }

  async updateFeedback(id: string, data: Record<string, unknown>) {
    return db.update(betaFeedback).set(data).where(eq(betaFeedback.id, id)).returning().then(r => r[0]);
  }

  async deleteFeedback(id: string) {
    await db.delete(betaFeedback).where(eq(betaFeedback.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(betaFeedback);
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(betaFeedback).where(eq(betaFeedback.status, "open"));
    const [avgRating] = await db.select({ avg: sql<number>`coalesce(avg(${betaFeedback.rating}), 0)` }).from(betaFeedback);
    const byCategory = await db.select({ category: betaFeedback.category, count: sql<number>`count(*)` }).from(betaFeedback).groupBy(betaFeedback.category);
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), avgRating: Math.round(Number(avgRating?.avg ?? 0) * 10) / 10, byCategory };
  }
}

export const betaFeedbackService = new BetaFeedbackService();
