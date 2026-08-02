import { db } from "@/lib/db";
import { launchMetric, launchEvent } from "@/lib/db/schema/launch";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class LaunchMetricsService {
  async recordMetric(metricName: string, value: number, unit?: string, dimensions?: Record<string, unknown>) {
    const id = generateId("lmtr");
    return db.insert(launchMetric).values({ id, metricName, value, unit, dimensions }).returning().then(r => r[0]);
  }

  async getMetrics(metricName?: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const conditions = [gte(launchMetric.createdAt, since)];
    if (metricName) conditions.push(eq(launchMetric.metricName, metricName));
    return db.select().from(launchMetric).where(and(...conditions)).orderBy(launchMetric.createdAt);
  }

  async recordEvent(data: { eventType: string; title: string; description?: string; severity?: string; data?: Record<string, unknown> }) {
    const id = generateId("levt");
    return db.insert(launchEvent).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listEvents(filters?: { eventType?: string; severity?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.eventType) conditions.push(eq(launchEvent.eventType, filters.eventType));
    if (filters?.severity) conditions.push(eq(launchEvent.severity, filters.severity));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(launchEvent).where(where).orderBy(desc(launchEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(launchEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async cleanupOldMetrics(retentionDays = 90) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    await db.delete(launchMetric).where(sql`${launchMetric.createdAt} < ${cutoff}`);
    await db.delete(launchEvent).where(sql`${launchEvent.createdAt} < ${cutoff}`);
  }
}

export const launchMetricsService = new LaunchMetricsService();
