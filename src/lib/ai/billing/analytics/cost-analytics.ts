import type { CostAnalyticsReport, CostTrend, CostAnomaly } from "../../types/billing";
import type { UsageRecord } from "../../types/monitoring";

export interface CostAnalytics {
  generateReport(workspaceId: string, period: string): Promise<CostAnalyticsReport>;
  detectAnomalies(workspaceId: string, threshold: number): Promise<CostAnomaly[]>;
  getProviderDistribution(workspaceId: string): Promise<Record<string, number>>;
}

export class InMemoryCostAnalytics implements CostAnalytics {
  private usageRecords: UsageRecord[] = [];
  private costRecords: Map<string, { cost: number; credits: number; date: string }[]> = new Map();

  ingest(workspaceId: string, usage: UsageRecord, cost: number, credits: number): void {
    this.usageRecords.push(usage);
    const existing = this.costRecords.get(workspaceId) ?? [];
    existing.push({ cost, credits, date: new Date().toISOString() });
    this.costRecords.set(workspaceId, existing);
  }

  async generateReport(workspaceId: string, period: string): Promise<CostAnalyticsReport> {
    const records = this.costRecords.get(workspaceId) ?? [];
    const totalCreditsUsed = records.reduce((sum, r) => sum + r.credits, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    const trends: CostTrend[] = records.map((r) => ({
      date: r.date,
      cost: r.cost,
      credits: r.credits,
      requestCount: 1,
    }));

    const providerDistribution: Record<string, number> = {};
    for (const record of this.usageRecords) {
      const providers = record.providerDistribution ?? {};
      for (const [provider, cost] of Object.entries(providers)) {
        providerDistribution[provider] = (providerDistribution[provider] ?? 0) + cost;
      }
    }

    return {
      workspaceId,
      generatedAt: new Date().toISOString(),
      period,
      trends,
      anomalies: [],
      providerDistribution,
      totalCreditsUsed,
      totalCost,
      currency: "USD",
    };
  }

  async detectAnomalies(workspaceId: string, threshold: number): Promise<CostAnomaly[]> {
    const records = this.costRecords.get(workspaceId) ?? [];
    if (records.length < 2) return [];

    const anomalies: CostAnomaly[] = [];
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const costs = sorted.map((r) => r.cost);
    const avg = costs.reduce((sum, c) => sum + c, 0) / costs.length;

    for (let i = 1; i < sorted.length; i++) {
      const deviation = Math.abs(sorted[i].cost - avg) / (avg || 1);
      if (deviation > threshold) {
        anomalies.push({
          date: sorted[i].date,
          expectedCost: avg,
          actualCost: sorted[i].cost,
          deviation,
          severity: deviation > 0.5 ? "high" : deviation > 0.2 ? "medium" : "low",
        });
      }
    }

    return anomalies;
  }

  async getProviderDistribution(workspaceId: string): Promise<Record<string, number>> {
    const records = this.costRecords.get(workspaceId) ?? [];
    const distribution: Record<string, number> = {};
    for (const record of records) {
      distribution["total"] = (distribution["total"] ?? 0) + record.cost;
    }
    return distribution;
  }
}
