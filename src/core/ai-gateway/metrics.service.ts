import { db } from "@/lib/db";
import { aiRuntimeMetric } from "@/lib/db/schema/ai-gateway";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class MetricsService {
  async recordMetric(metricName: string, category: string, value: number, unit?: string, provider?: string, model?: string, dimensions?: Record<string, unknown>) {
    const id = generateId("amet");
    return db.insert(aiRuntimeMetric).values({ id, metricName, category, value, unit, provider, model, dimensions }).returning().then(r => r[0]);
  }

  async getMetrics(metricName: string, startDate?: Date, endDate?: Date, provider?: string) {
    const conditions = [eq(aiRuntimeMetric.metricName, metricName)];
    if (startDate) conditions.push(sql`${aiRuntimeMetric.createdAt} >= ${startDate}`);
    if (endDate) conditions.push(sql`${aiRuntimeMetric.createdAt} <= ${endDate}`);
    if (provider) conditions.push(eq(aiRuntimeMetric.provider, provider));
    return db.select().from(aiRuntimeMetric).where(and(...conditions)).orderBy(desc(aiRuntimeMetric.createdAt));
  }

  async getMetricSummary(startDate?: Date, endDate?: Date) {
    const conditions = [];
    if (startDate) conditions.push(sql`${aiRuntimeMetric.createdAt} >= ${startDate}`);
    if (endDate) conditions.push(sql`${aiRuntimeMetric.createdAt} <= ${endDate}`);
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select({ metricName: aiRuntimeMetric.metricName, category: aiRuntimeMetric.category, avgValue: sql<number>`avg(${aiRuntimeMetric.value})`, minValue: sql<number>`min(${aiRuntimeMetric.value})`, maxValue: sql<number>`max(${aiRuntimeMetric.value})`, count: sql<number>`count(*)` }).from(aiRuntimeMetric).where(where).groupBy(aiRuntimeMetric.metricName, aiRuntimeMetric.category);
  }

  async getMetricsByProvider(startDate?: Date, endDate?: Date) {
    const conditions = [];
    if (startDate) conditions.push(sql`${aiRuntimeMetric.createdAt} >= ${startDate}`);
    if (endDate) conditions.push(sql`${aiRuntimeMetric.createdAt} <= ${endDate}`);
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select({ provider: aiRuntimeMetric.provider, metricName: aiRuntimeMetric.metricName, avgValue: sql<number>`avg(${aiRuntimeMetric.value})`, count: sql<number>`count(*)` }).from(aiRuntimeMetric).where(and(...(where ? [where] : []), sql`${aiRuntimeMetric.provider} IS NOT NULL`)).groupBy(aiRuntimeMetric.provider, aiRuntimeMetric.metricName);
  }
}

export const metricsService = new MetricsService();
