import { db } from "@/lib/db";
import { obsTrace } from "@/lib/db/schema/observability";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ObsTracingService {
  async startSpan(traceId: string, name: string, service: string, operation?: string, parentId?: string, tags?: Record<string, unknown>) {
    const id = generateId("obt");
    return db.insert(obsTrace).values({ id, traceId, name, service, operation, parentId, tags }).returning().then(r => r[0]);
  }

  async endSpan(id: string, status: string = "ok", metadata?: Record<string, unknown>) {
    return db.update(obsTrace).set({ status, endTime: new Date(), metadata }).where(eq(obsTrace.id, id)).returning().then(r => r[0]);
  }

  async getTrace(traceId: string) {
    return db.select().from(obsTrace).where(eq(obsTrace.traceId, traceId)).orderBy(obsTrace.startTime);
  }

  async listTraces(filters?: { service?: string; status?: string; startDate?: Date; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.service) conditions.push(eq(obsTrace.service, filters.service));
    if (filters?.status) conditions.push(eq(obsTrace.status, filters.status));
    if (filters?.startDate) conditions.push(gte(obsTrace.startTime, filters.startDate));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(obsTrace).where(where).orderBy(desc(obsTrace.startTime)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(obsTrace).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getSlowTraces(minDurationMs = 1000, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select().from(obsTrace).where(and(gte(obsTrace.startTime, since), sql`${obsTrace.durationMs} >= ${minDurationMs}`)).orderBy(desc(obsTrace.durationMs)).limit(50);
  }

  async getTraceStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(obsTrace);
    const [avgDuration] = await db.select({ avg: sql<number>`coalesce(avg(${obsTrace.durationMs}), 0)` }).from(obsTrace);
    const byService = await db.select({ service: obsTrace.service, count: sql<number>`count(*)`, avgDuration: sql<number>`coalesce(avg(${obsTrace.durationMs}), 0)` }).from(obsTrace).groupBy(obsTrace.service);
    return { total: Number(total?.count ?? 0), avgDuration: Math.round(Number(avgDuration?.avg ?? 0)), byService };
  }

  async cleanup(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(obsTrace).where(lte(obsTrace.startTime, cutoff));
  }
}

export const obsTracingService = new ObsTracingService();
