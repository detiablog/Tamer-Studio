import { db } from "@/lib/db";
import { secApiEvent } from "@/lib/db/schema/security";
import { eq, and, desc, sql, like, gte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ApiMonitorService {
  async recordRequest(data: { correlationId?: string; userId?: string; method: string; endpoint: string; statusCode?: number; latencyMs?: number; requestSize?: number; responseSize?: number; ipAddress?: string; userAgent?: string; rateLimited?: boolean; blocked?: boolean; error?: string }) {
    const id = generateId("sapie");
    return db.insert(secApiEvent).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listEvents(filters?: { userId?: string; endpoint?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(secApiEvent.userId, filters.userId));
    if (filters?.endpoint) conditions.push(like(secApiEvent.endpoint, `%${filters.endpoint}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(secApiEvent).where(where).orderBy(desc(secApiEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(secApiEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getSlowEndpoints(minLatencyMs = 1000, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select({ endpoint: secApiEvent.endpoint, method: secApiEvent.method, avgLatency: sql<number>`avg(${secApiEvent.latencyMs})`, count: sql<number>`count(*)` }).from(secApiEvent).where(gte(secApiEvent.createdAt, since)).groupBy(secApiEvent.endpoint, secApiEvent.method).orderBy(sql`avg(${secApiEvent.latencyMs}) DESC`).limit(20);
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(secApiEvent);
    const [rateLimited] = await db.select({ count: sql<number>`count(*)` }).from(secApiEvent).where(eq(secApiEvent.rateLimited, true));
    const [errors] = await db.select({ count: sql<number>`count(*)` }).from(secApiEvent).where(sql`${secApiEvent.statusCode} >= 400`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todayCount] = await db.select({ count: sql<number>`count(*)` }).from(secApiEvent).where(gte(secApiEvent.createdAt, today));
    return { total: Number(total?.count ?? 0), rateLimited: Number(rateLimited?.count ?? 0), errors: Number(errors?.count ?? 0), today: Number(todayCount?.count ?? 0) };
  }
}

export const apiMonitorService = new ApiMonitorService();
