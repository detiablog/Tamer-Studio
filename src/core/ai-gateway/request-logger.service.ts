import { db } from "@/lib/db";
import { aiRequestLog } from "@/lib/db/schema/ai-gateway";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class RequestLoggerService {
  async logRequest(data: { requestId: string; userId?: string; workspaceId?: string; provider: string; model: string; capability?: string; status?: string; promptTokens?: number; completionTokens?: number; totalTokens?: number; creditsUsed?: number; costUsd?: number; latencyMs?: number; queueTimeMs?: number; wasFallback?: boolean; retryCount?: number; error?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("arl");
    return db.insert(aiRequestLog).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateRequest(id: string, data: Record<string, unknown>) {
    return db.update(aiRequestLog).set(data).where(eq(aiRequestLog.id, id)).returning().then(r => r[0]);
  }

  async getRequest(id: string) {
    const [item] = await db.select().from(aiRequestLog).where(eq(aiRequestLog.id, id)).limit(1);
    return item || null;
  }

  async listRequests(filters?: { userId?: string; provider?: string; status?: string; capability?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(aiRequestLog.userId, filters.userId));
    if (filters?.provider) conditions.push(eq(aiRequestLog.provider, filters.provider));
    if (filters?.status) conditions.push(eq(aiRequestLog.status, filters.status));
    if (filters?.capability) conditions.push(eq(aiRequestLog.capability, filters.capability));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(aiRequestLog).where(where).orderBy(desc(aiRequestLog.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(aiRequestLog).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getRequestStats(userId?: string) {
    const conditions = userId ? [eq(aiRequestLog.userId, userId)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [totalRequests] = await db.select({ count: sql<number>`count(*)` }).from(aiRequestLog).where(where);
    const [completedRequests] = await db.select({ count: sql<number>`count(*)` }).from(aiRequestLog).where(and(...(where ? [where] : []), eq(aiRequestLog.status, "completed")));
    const [failedRequests] = await db.select({ count: sql<number>`count(*)` }).from(aiRequestLog).where(and(...(where ? [where] : []), eq(aiRequestLog.status, "failed")));
    const [totalTokens] = await db.select({ total: sql<number>`coalesce(sum(${aiRequestLog.totalTokens}), 0)` }).from(aiRequestLog).where(where);
    const [totalCost] = await db.select({ total: sql<number>`coalesce(sum(${aiRequestLog.costUsd}), 0)` }).from(aiRequestLog).where(where);
    const [avgLatency] = await db.select({ avg: sql<number>`coalesce(avg(${aiRequestLog.latencyMs}), 0)` }).from(aiRequestLog).where(where);
    const byProvider = await db.select({ provider: aiRequestLog.provider, count: sql<number>`count(*)`, totalCost: sql<number>`coalesce(sum(${aiRequestLog.costUsd}), 0)` }).from(aiRequestLog).where(where).groupBy(aiRequestLog.provider);

    return {
      totalRequests: Number(totalRequests?.count ?? 0),
      completedRequests: Number(completedRequests?.count ?? 0),
      failedRequests: Number(failedRequests?.count ?? 0),
      totalTokens: Number(totalTokens?.total ?? 0),
      totalCostUsd: Number(totalCost?.total ?? 0),
      avgLatencyMs: Number(avgLatency?.avg ?? 0),
      successRate: Number(totalRequests?.count ?? 0) > 0 ? Math.round((Number(completedRequests?.count ?? 0) / Number(totalRequests?.count ?? 1)) * 100) : 0,
      byProvider,
    };
  }
}

export const requestLoggerService = new RequestLoggerService();
