import { db } from "@/lib/db";
import { assetDuplicate } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class DuplicateService {
  async detectDuplicates(userId: string, data: { assetId: string; duplicateAssetId: string; matchType: string; similarityScore: number; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(assetDuplicate).where(and(eq(assetDuplicate.assetId, data.assetId), eq(assetDuplicate.duplicateAssetId, data.duplicateAssetId))).limit(1);
    if (existing.length > 0) return existing[0];
    const id = generateId("adup");
    return db.insert(assetDuplicate).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listDuplicates(userId: string, filters?: { status?: string; matchType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetDuplicate.userId, userId)];
    if (filters?.status) conditions.push(eq(assetDuplicate.status, filters.status));
    if (filters?.matchType) conditions.push(eq(assetDuplicate.matchType, filters.matchType));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetDuplicate).where(where).orderBy(desc(assetDuplicate.similarityScore)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetDuplicate).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async updateDuplicateStatus(id: string, status: string) {
    return db.update(assetDuplicate).set({ status }).where(eq(assetDuplicate.id, id)).returning().then(r => r[0]);
  }

  async deleteDuplicate(id: string) {
    await db.delete(assetDuplicate).where(eq(assetDuplicate.id, id));
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetDuplicate).where(eq(assetDuplicate.userId, userId));
    const [resolved] = await db.select({ count: sql<number>`count(*)` }).from(assetDuplicate).where(and(eq(assetDuplicate.userId, userId), eq(assetDuplicate.status, "resolved")));
    return { totalDuplicates: Number(total?.count ?? 0), resolvedDuplicates: Number(resolved?.count ?? 0) };
  }
}

export const duplicateService = new DuplicateService();
