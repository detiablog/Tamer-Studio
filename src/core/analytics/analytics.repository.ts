import { db } from "@/lib/db";
import { productionMetrics, userActivityMetrics, workspaceMetrics } from "@/lib/db/schema/analytics";
import { sql, eq, gte, lte, and, count, sum, avg } from "drizzle-orm";

export interface ProductionMetricsAggregation {
  totalProductions: number;
  succeeded: number;
  failed: number;
  totalCost: string | null;
  avgExecutionTime: number | null;
}

export interface TopModelRow {
  model: string | null;
  count: number;
  totalCost: string | null;
}

export interface DailyTrendRow {
  date: string;
  count: number;
  success: number;
  totalCost: string | null;
}

export interface UserActivityRow {
  action: string;
  count: number;
}

export class AnalyticsRepository {
  async getProductionMetrics(workspaceId: string, startDate: Date, endDate: Date): Promise<ProductionMetricsAggregation> {
    const metrics = await db
      .select({
        totalProductions: count(),
        succeeded: count(sql`CASE WHEN ${productionMetrics.status} = 'completed' THEN 1 END`),
        failed: count(sql`CASE WHEN ${productionMetrics.status} = 'failed' THEN 1 END`),
        totalCost: sum(sql`${productionMetrics.costUsd}::numeric`),
        avgExecutionTime: avg(productionMetrics.executionTimeMs),
      })
      .from(productionMetrics)
      .where(
        and(
          eq(productionMetrics.workspaceId, workspaceId),
          gte(productionMetrics.createdAt, startDate),
          lte(productionMetrics.createdAt, endDate)
        )
      );

    const [aggregated] = metrics;
    return {
      totalProductions: aggregated?.totalProductions || 0,
      succeeded: aggregated?.succeeded || 0,
      failed: aggregated?.failed || 0,
      totalCost: aggregated?.totalCost?.toString() || "0",
      avgExecutionTime: Number(aggregated?.avgExecutionTime) || 0,
    };
  }

  async getTopModels(workspaceId: string, startDate: Date, endDate: Date): Promise<TopModelRow[]> {
    return db
      .select({
        model: productionMetrics.aiModel,
        count: count(),
        totalCost: sum(sql`${productionMetrics.costUsd}::numeric`),
      })
      .from(productionMetrics)
      .where(
        and(
          eq(productionMetrics.workspaceId, workspaceId),
          gte(productionMetrics.createdAt, startDate),
          lte(productionMetrics.createdAt, endDate)
        )
      )
      .groupBy(productionMetrics.aiModel)
      .orderBy(sql`count DESC`)
      .limit(5);
  }

  async getDailyTrend(workspaceId: string, startDate: Date, endDate: Date): Promise<DailyTrendRow[]> {
    return db
      .select({
        date: sql<string>`DATE(${productionMetrics.createdAt})`,
        count: count(),
        success: count(sql`CASE WHEN ${productionMetrics.status} = 'completed' THEN 1 END`),
        totalCost: sum(sql`${productionMetrics.costUsd}::numeric`),
      })
      .from(productionMetrics)
      .where(
        and(
          eq(productionMetrics.workspaceId, workspaceId),
          gte(productionMetrics.createdAt, startDate),
          lte(productionMetrics.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${productionMetrics.createdAt})`)
      .orderBy(sql`DATE(${productionMetrics.createdAt}) ASC`);
  }

  async getUserActivity(workspaceId: string, startDate: Date, endDate: Date): Promise<UserActivityRow[]> {
    return db
      .select({
        action: userActivityMetrics.action,
        count: count(),
      })
      .from(userActivityMetrics)
      .where(
        and(
          eq(userActivityMetrics.workspaceId, workspaceId),
          gte(userActivityMetrics.createdAt, startDate),
          lte(userActivityMetrics.createdAt, endDate)
        )
      )
      .groupBy(userActivityMetrics.action)
      .orderBy(sql`count DESC`);
  }

  async recordProductionMetric(data: {
    productionId: string;
    workspaceId: string;
    status: string;
    aiModel?: string;
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: string;
    executionTimeMs?: number;
    metadata?: Record<string, unknown>;
  }) {
    return db.insert(productionMetrics).values(data);
  }

  async recordUserActivity(data: {
    userId: string;
    workspaceId: string;
    action: string;
    resourceId?: string;
    resourceType?: string;
  }) {
    return db.insert(userActivityMetrics).values(data);
  }
}

export const analyticsRepository = new AnalyticsRepository();
