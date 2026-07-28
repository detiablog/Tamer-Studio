import { analyticsRepository } from "./analytics.repository";

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
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<DashboardMetrics> {
  const [aggregated, topModels, dailyTrend, activities] = await Promise.all([
    analyticsRepository.getProductionMetrics(workspaceId, startDate, endDate),
    analyticsRepository.getTopModels(workspaceId, startDate, endDate),
    analyticsRepository.getDailyTrend(workspaceId, startDate, endDate),
    analyticsRepository.getUserActivity(workspaceId, startDate, endDate),
  ]);

  const total = aggregated.totalProductions;
  const succeeded = aggregated.succeeded;

  return {
    totalProductions: total,
    successRate: total > 0 ? (succeeded / total) * 100 : 0,
    failureRate: total > 0 ? ((total - succeeded) / total) * 100 : 0,
    totalCostUsd: aggregated.totalCost || "0",
    averageExecutionTime: aggregated.avgExecutionTime || 0,
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
  return analyticsRepository.recordProductionMetric(data);
}

export async function recordUserActivity(data: {
  userId: string;
  workspaceId: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
}) {
  return analyticsRepository.recordUserActivity(data);
}
