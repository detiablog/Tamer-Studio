import { db } from "@/lib/db";
import { analyticsEvent, analyticsMetric } from "@/lib/db/schema/analytics-center";
import { eq, and, sql, desc, gte, lte, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { cacheGetOrSet } from "@/lib/cache";

export interface EventInput {
  eventType: string;
  category: string;
  source: string;
  userId?: string;
  sessionId?: string;
  resourceId?: string;
  resourceType?: string;
  value?: string;
  metadata?: Record<string, unknown>;
  country?: string;
  language?: string;
  device?: string;
}

export interface MetricQuery {
  metricName: string;
  category?: string;
  startDate: Date;
  endDate: Date;
  dimensions?: Record<string, string>;
  groupBy?: string;
}

export class AnalyticsEngine {
  async trackEvent(input: EventInput) {
    const id = generateId("evt");
    return db.insert(analyticsEvent).values({ id, ...input, metadata: input.metadata || {} });
  }

  async trackBatch(events: EventInput[]) {
    if (events.length === 0) return;
    const rows = events.map(e => ({ id: generateId("evt"), ...e, metadata: e.metadata || {} }));
    return db.insert(analyticsEvent).values(rows);
  }

  async getEvents(filters: { eventType?: string; category?: string; userId?: string; startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters.eventType) conditions.push(eq(analyticsEvent.eventType, filters.eventType));
    if (filters.category) conditions.push(eq(analyticsEvent.category, filters.category));
    if (filters.userId) conditions.push(eq(analyticsEvent.userId, filters.userId));
    if (filters.startDate) conditions.push(gte(analyticsEvent.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(analyticsEvent.createdAt, filters.endDate));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(analyticsEvent).where(where).orderBy(desc(analyticsEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(analyticsEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async recordMetric(metricName: string, category: string, value: string, date: Date, dimensions?: Record<string, string>) {
    const id = generateId("met");
    return db.insert(analyticsMetric).values({ id, metricName, category, value, date, dimensions: dimensions || {} });
  }

  async getMetrics(query: MetricQuery) {
    const conditions = [
      eq(analyticsMetric.metricName, query.metricName),
      gte(analyticsMetric.date, query.startDate),
      lte(analyticsMetric.date, query.endDate),
    ];
    if (query.category) conditions.push(eq(analyticsMetric.category, query.category));
    return db.select().from(analyticsMetric).where(and(...conditions)).orderBy(analyticsMetric.date);
  }

  async getAggregatedMetrics(metricName: string, startDate: Date, endDate: Date, aggregation: "sum" | "avg" | "count" = "sum") {
    const fn = aggregation === "sum" ? sql`sum(CAST(${analyticsMetric.value} AS numeric))` :
               aggregation === "avg" ? sql`avg(CAST(${analyticsMetric.value} AS numeric))` :
               sql`count(*)`;
    const [result] = await db.select({ value: fn }).from(analyticsMetric).where(
      and(eq(analyticsMetric.metricName, metricName), gte(analyticsMetric.date, startDate), lte(analyticsMetric.date, endDate))
    );
    return Number(result?.value ?? 0);
  }

  async getEventCountByCategory(startDate: Date, endDate: Date) {
    return db.select({ category: analyticsEvent.category, count: sql<number>`count(*)` }).from(analyticsEvent).where(
      and(gte(analyticsEvent.createdAt, startDate), lte(analyticsEvent.createdAt, endDate))
    ).groupBy(analyticsEvent.category);
  }

  async getEventTrend(startDate: Date, endDate: Date) {
    const cacheKey = `analytics:trend:${startDate.toISOString()}:${endDate.toISOString()}`;
    return cacheGetOrSet(cacheKey, async () => {
      return db.select({
        date: sql<string>`date(${analyticsEvent.createdAt})`.as("date"),
        count: sql<number>`count(*)`.as("count"),
      }).from(analyticsEvent).where(
        and(gte(analyticsEvent.createdAt, startDate), lte(analyticsEvent.createdAt, endDate))
      ).groupBy(sql`date(${analyticsEvent.createdAt})`).orderBy(sql`date(${analyticsEvent.createdAt})`);
    }, 30000);
  }

  async getTopEvents(startDate: Date, endDate: Date, limit = 10) {
    const cacheKey = `analytics:top:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
    return cacheGetOrSet(cacheKey, async () => {
      return db.select({ eventType: analyticsEvent.eventType, count: sql<number>`count(*)` }).from(analyticsEvent).where(
        and(gte(analyticsEvent.createdAt, startDate), lte(analyticsEvent.createdAt, endDate))
      ).groupBy(analyticsEvent.eventType).orderBy(desc(sql`count(*)`)).limit(limit);
    }, 30000);
  }

  async getOverviewStats(startDate: Date, endDate: Date) {
    const cacheKey = `analytics:overview:${startDate.toISOString()}:${endDate.toISOString()}`;
    return cacheGetOrSet(cacheKey, async () => {
      const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(analyticsEvent).where(
        and(gte(analyticsEvent.createdAt, startDate), lte(analyticsEvent.createdAt, endDate))
      );
      const [uniqueUsers] = await db.select({ count: sql<number>`count(distinct ${analyticsEvent.userId})` }).from(analyticsEvent).where(
        and(gte(analyticsEvent.createdAt, startDate), lte(analyticsEvent.createdAt, endDate), sql`${analyticsEvent.userId} IS NOT NULL`)
      );
      const categories = await this.getEventCountByCategory(startDate, endDate);
      const trend = await this.getEventTrend(startDate, endDate);
      const topEvents = await this.getTopEvents(startDate, endDate);
      return { totalEvents: Number(totalEvents?.count ?? 0), uniqueUsers: Number(uniqueUsers?.count ?? 0), categories, trend, topEvents };
    }, 30000);
  }
}

export const analyticsEngine = new AnalyticsEngine();
