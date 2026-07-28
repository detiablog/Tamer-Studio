import type { TelemetryRecord } from "../runtime/types";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";

export interface UsageRecord {
  id: string;
  timestamp: string;
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  providerId: string;
  model: string;
  capability: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  currency: string;
  durationMs: number;
  status: "success" | "failure";
  metadata?: Record<string, unknown>;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  currency: string;
  promptTokens: number;
  completionTokens: number;
  averageDurationMs: number;
  successRate: number;
  providerBreakdown: Record<string, ProviderUsageSummary>;
  modelBreakdown: Record<string, ModelUsageSummary>;
  dailyBreakdown: Record<string, DailyUsageSummary>;
}

export interface ProviderUsageSummary {
  providerId: string;
  requests: number;
  tokens: number;
  cost: number;
  successRate: number;
  averageLatencyMs: number;
}

export interface ModelUsageSummary {
  model: string;
  providerId: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface DailyUsageSummary {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface UsageRuntime {
  record(telemetry: TelemetryRecord): Promise<void>;
  getSummary(filters?: UsageFilters): UsageSummary;
  getRecords(filters?: UsageFilters): UsageRecord[];
  getProviderSummary(providerId: string): ProviderUsageSummary | undefined;
  getModelSummary(model: string): ModelUsageSummary | undefined;
  getDailySummary(days?: number): DailyUsageSummary[];
  getCostEstimate(providerId: string, model: string, estimatedTokens: number): number;
}

export interface UsageFilters {
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  providerId?: string;
  model?: string;
  capability?: string;
  startDate?: string;
  endDate?: string;
  status?: "success" | "failure";
}

export class DefaultUsageRuntime implements UsageRuntime {
  private records: UsageRecord[] = [];
  private maxRecords: number;

  constructor(maxRecords = 10000) {
    this.maxRecords = maxRecords;
  }

  async record(telemetry: TelemetryRecord): Promise<void> {
    const record: UsageRecord = {
      id: telemetry.executionId,
      timestamp: telemetry.timestamp,
      userId: telemetry.userId,
      workspaceId: telemetry.workspaceId,
      projectId: telemetry.projectId,
      providerId: telemetry.providerId ?? "unknown",
      model: telemetry.model ?? "unknown",
      capability: telemetry.capabilityId,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: telemetry.tokensUsed ?? 0,
      estimatedCost: telemetry.cost ?? 0,
      currency: "USD",
      durationMs: telemetry.durationMs,
      status: telemetry.status,
      metadata: telemetry.metadata,
    };

    this.records.push(record);

    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(-this.maxRecords);
    }

    await logAction("provider.execution.completed" as never, telemetry.userId, "system", {
      executionId: telemetry.executionId,
      providerId: record.providerId,
      model: record.model,
      tokens: record.totalTokens,
      cost: record.estimatedCost,
    });

    logger.debug("Usage recorded", {
      executionId: telemetry.executionId,
      providerId: record.providerId,
      tokens: record.totalTokens,
    });
  }

  getSummary(filters?: UsageFilters): UsageSummary {
    const filtered = this.applyFilters(filters);
    const totalRequests = filtered.length;
    const successRequests = filtered.filter((r) => r.status === "success").length;
    const totalTokens = filtered.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = filtered.reduce((sum, r) => sum + r.estimatedCost, 0);
    const promptTokens = filtered.reduce((sum, r) => sum + r.promptTokens, 0);
    const completionTokens = filtered.reduce((sum, r) => sum + r.completionTokens, 0);
    const totalDuration = filtered.reduce((sum, r) => sum + r.durationMs, 0);

    const providerBreakdown: Record<string, ProviderUsageSummary> = {};
    const modelBreakdown: Record<string, ModelUsageSummary> = {};
    const dailyBreakdown: Record<string, DailyUsageSummary> = {};

    for (const record of filtered) {
      if (!providerBreakdown[record.providerId]) {
        providerBreakdown[record.providerId] = {
          providerId: record.providerId,
          requests: 0,
          tokens: 0,
          cost: 0,
          successRate: 0,
          averageLatencyMs: 0,
        };
      }
      const pb = providerBreakdown[record.providerId];
      pb.requests++;
      pb.tokens += record.totalTokens;
      pb.cost += record.estimatedCost;
      if (record.status === "success") pb.successRate++;

      const modelKey = `${record.providerId}:${record.model}`;
      if (!modelBreakdown[modelKey]) {
        modelBreakdown[modelKey] = {
          model: record.model,
          providerId: record.providerId,
          requests: 0,
          tokens: 0,
          cost: 0,
        };
      }
      modelBreakdown[modelKey].requests++;
      modelBreakdown[modelKey].tokens += record.totalTokens;
      modelBreakdown[modelKey].cost += record.estimatedCost;

      const date = record.timestamp.substring(0, 10);
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { date, requests: 0, tokens: 0, cost: 0 };
      }
      dailyBreakdown[date].requests++;
      dailyBreakdown[date].tokens += record.totalTokens;
      dailyBreakdown[date].cost += record.estimatedCost;
    }

    for (const pb of Object.values(providerBreakdown)) {
      pb.successRate = pb.requests > 0 ? pb.successRate / pb.requests : 0;
    }

    return {
      totalRequests,
      totalTokens,
      totalCost,
      currency: "USD",
      promptTokens,
      completionTokens,
      averageDurationMs: totalRequests > 0 ? totalDuration / totalRequests : 0,
      successRate: totalRequests > 0 ? successRequests / totalRequests : 0,
      providerBreakdown,
      modelBreakdown,
      dailyBreakdown,
    };
  }

  getRecords(filters?: UsageFilters): UsageRecord[] {
    return this.applyFilters(filters);
  }

  getProviderSummary(providerId: string): ProviderUsageSummary | undefined {
    const summary = this.getSummary({ providerId });
    return summary.providerBreakdown[providerId];
  }

  getModelSummary(model: string): ModelUsageSummary | undefined {
    const records = this.records.filter((r) => r.model === model);
    if (records.length === 0) return undefined;

    return {
      model,
      providerId: records[0].providerId,
      requests: records.length,
      tokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
      cost: records.reduce((sum, r) => sum + r.estimatedCost, 0),
    };
  }

  getDailySummary(days = 7): DailyUsageSummary[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().substring(0, 10);

    const filtered = this.records.filter((r) => r.timestamp.substring(0, 10) >= cutoffStr);
    const summary = this.getSummary();
    return Object.values(summary.dailyBreakdown)
      .filter((d) => d.date >= cutoffStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getCostEstimate(providerId: string, model: string, estimatedTokens: number): number {
    const records = this.records.filter(
      (r) => r.providerId === providerId && r.model === model
    );
    if (records.length === 0) return 0;

    const avgCostPerToken =
      records.reduce((sum, r) => sum + (r.totalTokens > 0 ? r.estimatedCost / r.totalTokens : 0), 0) /
      records.length;

    return avgCostPerToken * estimatedTokens;
  }

  private applyFilters(filters?: UsageFilters): UsageRecord[] {
    if (!filters) return [...this.records];

    return this.records.filter((r) => {
      if (filters.userId && r.userId !== filters.userId) return false;
      if (filters.workspaceId && r.workspaceId !== filters.workspaceId) return false;
      if (filters.projectId && r.projectId !== filters.projectId) return false;
      if (filters.providerId && r.providerId !== filters.providerId) return false;
      if (filters.model && r.model !== filters.model) return false;
      if (filters.capability && r.capability !== filters.capability) return false;
      if (filters.startDate && r.timestamp < filters.startDate) return false;
      if (filters.endDate && r.timestamp > filters.endDate) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  }
}

export function createUsageRuntime(maxRecords?: number): UsageRuntime {
  return new DefaultUsageRuntime(maxRecords);
}
