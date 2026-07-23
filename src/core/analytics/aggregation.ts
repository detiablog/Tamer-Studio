import { db } from "@/lib/db";
import { productionMetrics, userActivityMetrics, workspaceMetrics } from "@/lib/db/schema/analytics";
import { sql, eq, gte, lte, and, count, sum, avg } from "drizzle-orm";

export interface ProductionMetricsQuery {
  workspaceId: string;
  startDate: Date;
  endDate: Date;
  aiModel?: string;
}

export interface DashboardMetrics {
  totalProductions: number;
  successRate: number;
  failureRate: number;
  totalCostUsd: string;
  averageExecutionTime: number;
  topModels: Array<{ model: string; count: number; cost: string }>;
  dailyTrend: Array<{
    date: string;
    count: number;
    success: number;
    cost: string;
  }>;
  userActivity: Array<{
    action: string;
    count: number;
  }>;
}

export async function getWorkspaceDashboardMetrics(
  workspaceId: string,
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
  endDate: Date = new Date()
): Promise<DashboardMetrics> {
  // Production metrics
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

  // Top AI models
  const topModels = await db
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

  // Daily trend
  const dailyTrend = await db
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

  // User activity
  const activities = await db
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

  const total = aggregated?.totalProductions || 0;
  const succeeded = aggregated?.succeeded || 0;

  return {
    totalProductions: total,
    successRate: total > 0 ? (succeeded / total) * 100 : 0,
    failureRate: total > 0 ? ((total - succeeded) / total) * 100 : 0,
    totalCostUsd: aggregated?.totalCost?.toString() || "0",
    averageExecutionTime: aggregated?.avgExecutionTime || 0,
    topModels: topModels.map((m) => ({
      model: m.model || "unknown",
      count: m.count,
      cost: m.totalCost?.toString() || "0",
    })),
    dailyTrend: dailyTrend.map((d) => ({
      date: d.date,
      count: d.count,
      success: d.success,
      cost: d.totalCost?.toString() || "0",
    })),
    userActivity: activities.map((a) => ({
      action: a.action,
      count: a.count,
    })),
  };
}

export async function recordProductionMetric(data: {
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

export async function recordUserActivity(data: {
  userId: string;
  workspaceId: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
}) {
  return db.insert(userActivityMetrics).values(data);
}
