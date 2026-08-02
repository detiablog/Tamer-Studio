import { db } from "@/lib/db";
import { scaleMetric } from "@/lib/db/schema/scaling";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ScaleMetricsService {
  async record(metricName: string, category: string, value: number, unit?: string, node?: string, tags?: Record<string, string>) {
    const id = generateId("sclm");
    return db.insert(scaleMetric).values({ id, metricName, category, value, unit, node, tags }).returning().then(r => r[0]);
  }

  async query(metricName: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select().from(scaleMetric).where(and(eq(scaleMetric.metricName, metricName), gte(scaleMetric.createdAt, since))).orderBy(scaleMetric.createdAt);
  }

  async summary(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select({ name: scaleMetric.metricName, category: scaleMetric.category, avg: sql<number>`avg(${scaleMetric.value})`, min: sql<number>`min(${scaleMetric.value})`, max: sql<number>`max(${scaleMetric.value})`, count: sql<number>`count(*)` }).from(scaleMetric).where(gte(scaleMetric.createdAt, since)).groupBy(scaleMetric.metricName, scaleMetric.category);
  }

  async getNodeMetrics(node: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return db.select().from(scaleMetric).where(and(eq(scaleMetric.node, node), gte(scaleMetric.createdAt, since))).orderBy(desc(scaleMetric.createdAt)).limit(100);
  }

  async cleanup(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(scaleMetric).where(lte(scaleMetric.createdAt, cutoff));
  }
}

export const scaleMetricsService = new ScaleMetricsService();
