import { db } from "@/lib/db";
import { apiKey, apiRequestLog, apiWebhook, apiWebhookDelivery } from "@/lib/db/schema/api-platform";
import { eq, and, desc, sql, like, gte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { generateApiKey } from "./api-key-middleware";

export class ApiPlatformService {
  async createApiKey(userId: string, data: { name: string; scopes?: string[]; expiresAt?: Date; metadata?: Record<string, unknown> }) {
    const id = generateId("apik");
    const { key, hash, prefix } = generateApiKey();
    return db.insert(apiKey).values({
      id,
      userId,
      name: data.name,
      keyHash: hash,
      keyPrefix: prefix,
      scopes: data.scopes || ["read:profile"],
      expiresAt: data.expiresAt,
      metadata: data.metadata || {},
    }).returning().then(r => ({ ...r[0], rawKey: key }));
  }

  async getApiKey(id: string) {
    const [item] = await db.select().from(apiKey).where(eq(apiKey.id, id)).limit(1);
    return item || null;
  }

  async getUserApiKeys(userId: string, filters?: { isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(apiKey.userId, userId)];
    if (filters?.isActive !== undefined) conditions.push(eq(apiKey.isActive, filters.isActive));
    if (filters?.search) conditions.push(like(apiKey.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(apiKey).where(where).orderBy(desc(apiKey.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(apiKey).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async updateApiKey(id: string, data: { name?: string; scopes?: string[]; isActive?: boolean; expiresAt?: Date | null; metadata?: Record<string, unknown> }) {
    return db.update(apiKey).set(data).where(eq(apiKey.id, id)).returning().then(r => r[0] || null);
  }

  async revokeApiKey(id: string) {
    await db.update(apiKey).set({ isActive: false }).where(eq(apiKey.id, id));
  }

  async deleteApiKey(id: string) {
    await db.delete(apiKey).where(eq(apiKey.id, id));
  }

  async listRequestLogs(userId: string, filters?: { apiKeyId?: string; endpoint?: string; statusCode?: number; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(apiRequestLog.userId, userId)];
    if (filters?.apiKeyId) conditions.push(eq(apiRequestLog.apiKeyId, filters.apiKeyId));
    if (filters?.endpoint) conditions.push(like(apiRequestLog.endpoint, `%${filters.endpoint}%`));
    if (filters?.statusCode) conditions.push(eq(apiRequestLog.statusCode, filters.statusCode));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(apiRequestLog).where(where).orderBy(desc(apiRequestLog.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(apiRequestLog).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createWebhook(userId: string, data: { url: string; events: string[]; secret?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("whks");
    return db.insert(apiWebhook).values({
      id,
      userId,
      url: data.url,
      events: data.events,
      secret: data.secret,
      metadata: data.metadata || {},
    }).returning().then(r => r[0]);
  }

  async getWebhook(id: string) {
    const [item] = await db.select().from(apiWebhook).where(eq(apiWebhook.id, id)).limit(1);
    return item || null;
  }

  async getUserWebhooks(userId: string, filters?: { isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(apiWebhook.userId, userId)];
    if (filters?.isActive !== undefined) conditions.push(eq(apiWebhook.isActive, filters.isActive));
    if (filters?.search) conditions.push(like(apiWebhook.url, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(apiWebhook).where(where).orderBy(desc(apiWebhook.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(apiWebhook).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async updateWebhook(id: string, data: { url?: string; events?: string[]; isActive?: boolean; secret?: string | null; metadata?: Record<string, unknown> }) {
    return db.update(apiWebhook).set(data).where(eq(apiWebhook.id, id)).returning().then(r => r[0] || null);
  }

  async deleteWebhook(id: string) {
    await db.delete(apiWebhook).where(eq(apiWebhook.id, id));
  }

  async listWebhookDeliveries(webhookId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(apiWebhookDelivery.webhookId, webhookId)];
    if (filters?.status) conditions.push(eq(apiWebhookDelivery.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(apiWebhookDelivery).where(where).orderBy(desc(apiWebhookDelivery.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(apiWebhookDelivery).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getApiKeyStats(userId: string) {
    const [totalKeys] = await db.select({ count: sql<number>`count(*)` }).from(apiKey).where(eq(apiKey.userId, userId));
    const [activeKeys] = await db.select({ count: sql<number>`count(*)` }).from(apiKey).where(and(eq(apiKey.userId, userId), eq(apiKey.isActive, true)));
    const [totalRequests] = await db.select({ count: sql<number>`count(*)` }).from(apiRequestLog).where(eq(apiRequestLog.userId, userId));
    const [avgLatency] = await db.select({ avg: sql<number>`coalesce(avg(${apiRequestLog.latencyMs}), 0)` }).from(apiRequestLog).where(eq(apiRequestLog.userId, userId));
    const [errorRequests] = await db.select({ count: sql<number>`count(*)` }).from(apiRequestLog).where(and(eq(apiRequestLog.userId, userId), gte(apiRequestLog.statusCode, 400)));
    const [totalWebhooks] = await db.select({ count: sql<number>`count(*)` }).from(apiWebhook).where(eq(apiWebhook.userId, userId));
    const [totalDeliveries] = await db.select({ count: sql<number>`count(*)` }).from(apiWebhookDelivery).innerJoin(apiWebhook, eq(apiWebhookDelivery.webhookId, apiWebhook.id)).where(eq(apiWebhook.userId, userId));
    return {
      totalKeys: Number(totalKeys?.count ?? 0),
      activeKeys: Number(activeKeys?.count ?? 0),
      totalRequests: Number(totalRequests?.count ?? 0),
      avgLatencyMs: Number(avgLatency?.avg ?? 0),
      errorRequests: Number(errorRequests?.count ?? 0),
      totalWebhooks: Number(totalWebhooks?.count ?? 0),
      totalDeliveries: Number(totalDeliveries?.count ?? 0),
    };
  }

  async getRequestUsageByDay(userId: string, days: number = 30) {
    return db.execute(sql`
      SELECT date(created_at) as date, count(*) as count
      FROM api_request_log
      WHERE user_id = ${userId} AND created_at >= NOW() - INTERVAL '${sql.raw(String(days))} days'
      GROUP BY date(created_at)
      ORDER BY date ASC
    `);
  }
}

export const apiPlatformService = new ApiPlatformService();
