import { db } from "@/lib/db";
import { aiGenerationHistory } from "@/lib/db/schema/ai-runtime";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class GenerationHistoryService {
  async listHistory(filters?: { userId?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(aiGenerationHistory.userId, filters.userId));
    if (filters?.type) conditions.push(eq(aiGenerationHistory.type, filters.type));
    if (filters?.status) conditions.push(eq(aiGenerationHistory.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(aiGenerationHistory).where(where).orderBy(desc(aiGenerationHistory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit };
  }

  async recordGeneration(data: { userId: string; jobId?: string; type: string; model: string; provider: string; prompt?: string; parameters?: Record<string, unknown>; status: string; creditsUsed?: number; executionTimeMs?: number; error?: string }) {
    const id = generateId("gen");
    return db.insert(aiGenerationHistory).values({ ...data, id, parameters: data.parameters || {}, assets: [] }).returning().then(r => r[0]);
  }

  async updateGeneration(id: string, data: Record<string, unknown>) {
    return db.update(aiGenerationHistory).set(data).where(eq(aiGenerationHistory.id, id)).returning().then(r => r[0]);
  }

  async getStats(userId?: string) {
    const conditions = userId ? [eq(aiGenerationHistory.userId, userId)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(where);
    const completedConditions = userId ? and(eq(aiGenerationHistory.userId, userId), eq(aiGenerationHistory.status, "completed")) : eq(aiGenerationHistory.status, "completed");
    const failedConditions = userId ? and(eq(aiGenerationHistory.userId, userId), eq(aiGenerationHistory.status, "failed")) : eq(aiGenerationHistory.status, "failed");
    const [completed] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(completedConditions);
    const [failed] = await db.select({ count: sql<number>`count(*)` }).from(aiGenerationHistory).where(failedConditions);
    return { total: Number(total?.count ?? 0), completed: Number(completed?.count ?? 0), failed: Number(failed?.count ?? 0) };
  }
}

export const generationHistoryService = new GenerationHistoryService();
