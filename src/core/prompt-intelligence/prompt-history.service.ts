import { db } from "@/lib/db";
import { promptHistory } from "@/lib/db/schema/prompt-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PromptHistoryService {
  async recordHistory(userId: string, data: { promptId?: string; versionNumber?: number; resolvedPrompt: string; provider?: string; model?: string; creditsUsed?: number; executionTimeMs?: number; resultReference?: string; projectReference?: string; status?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("phist");
    return db.insert(promptHistory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listHistory(userId: string, filters?: { promptId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(promptHistory.userId, userId)];
    if (filters?.promptId) conditions.push(eq(promptHistory.promptId, filters.promptId));
    if (filters?.status) conditions.push(eq(promptHistory.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(promptHistory).where(where).orderBy(desc(promptHistory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(promptHistory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getHistoryItem(id: string) {
    const [item] = await db.select().from(promptHistory).where(eq(promptHistory.id, id)).limit(1);
    return item || null;
  }

  async getStats(userId: string) {
    const [totalHistory] = await db.select({ count: sql<number>`count(*)` }).from(promptHistory).where(eq(promptHistory.userId, userId));
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${promptHistory.creditsUsed}), 0)` }).from(promptHistory).where(eq(promptHistory.userId, userId));
    const byProvider = await db.select({ provider: promptHistory.provider, count: sql<number>`count(*)` }).from(promptHistory).where(eq(promptHistory.userId, userId)).groupBy(promptHistory.provider);
    return {
      totalHistory: Number(totalHistory?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.total ?? 0),
      byProvider,
    };
  }
}

export const promptHistoryService = new PromptHistoryService();
