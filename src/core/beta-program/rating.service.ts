import { db } from "@/lib/db";
import { betaRating } from "@/lib/db/schema/beta";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class BetaRatingService {
  async submitRating(userId: string, data: { ratingType: string; entityType?: string; entityId?: string; rating: number; comment?: string }) {
    const id = generateId("brat");
    return db.insert(betaRating).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listRatings(filters?: { userId?: string; ratingType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(betaRating.userId, filters.userId));
    if (filters?.ratingType) conditions.push(eq(betaRating.ratingType, filters.ratingType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaRating).where(where).orderBy(desc(betaRating.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaRating).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(betaRating);
    const [avgRating] = await db.select({ avg: sql<number>`coalesce(avg(${betaRating.rating}), 0)` }).from(betaRating);
    const byType = await db.select({ ratingType: betaRating.ratingType, avg: sql<number>`avg(${betaRating.rating})`, count: sql<number>`count(*)` }).from(betaRating).groupBy(betaRating.ratingType);
    return { total: Number(total?.count ?? 0), avgRating: Math.round(Number(avgRating?.avg ?? 0) * 10) / 10, byType };
  }
}

export const betaRatingService = new BetaRatingService();
