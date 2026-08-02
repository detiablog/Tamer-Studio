import { db } from "@/lib/db";
import { obsMetric } from "@/lib/db/schema/observability";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ObsMetricsService {
  async record(name: string, category: string, value: number, unit?: string, tags?: Record<string, string>) {
    const id = generateId("obsm");
    return db.insert(obsMetric).values({ id, name, category, value, unit, tags }).returning().then(r => r[0]);
  }

  async query(name: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select().from(obsMetric).where(and(eq(obsMetric.name, name), gte(obsMetric.createdAt, since))).orderBy(obsMetric.createdAt);
  }

  async summary(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select({ name: obsMetric.name, category: obsMetric.category, avg: sql<number>`avg(${obsMetric.value})`, min: sql<number>`min(${obsMetric.value})`, max: sql<number>`max(${obsMetric.value})`, count: sql<number>`count(*)` }).from(obsMetric).where(gte(obsMetric.createdAt, since)).groupBy(obsMetric.name, obsMetric.category);
  }

  async cleanup(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(obsMetric).where(lte(obsMetric.createdAt, cutoff));
  }
}

export const obsMetricsService = new ObsMetricsService();
