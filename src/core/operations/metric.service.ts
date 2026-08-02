import { db } from "@/lib/db";
import { opsMetric } from "@/lib/db/schema/operations";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class MetricService {
  async recordMetric(metricName: string, category: string, value: number, unit?: string, dimensions?: Record<string, unknown>) {
    const id = generateId("omet");
    return db.insert(opsMetric).values({ id, metricName, category, value, unit, dimensions }).returning().then(r => r[0]);
  }

  async getMetrics(metricName: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select().from(opsMetric).where(and(eq(opsMetric.metricName, metricName), sql`${opsMetric.createdAt} >= ${since}`)).orderBy(opsMetric.createdAt);
  }

  async getMetricSummary(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select({ metricName: opsMetric.metricName, category: opsMetric.category, avgValue: sql<number>`avg(${opsMetric.value})`, minValue: sql<number>`min(${opsMetric.value})`, maxValue: sql<number>`max(${opsMetric.value})`, count: sql<number>`count(*)` }).from(opsMetric).where(sql`${opsMetric.createdAt} >= ${since}`).groupBy(opsMetric.metricName, opsMetric.category);
  }

  async cleanupOldMetrics(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(opsMetric).where(sql`${opsMetric.createdAt} < ${cutoff}`);
  }
}

export const metricService = new MetricService();
