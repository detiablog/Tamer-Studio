import type { UsageRecord, UsageSummary } from "../types/monitoring";
import type { ExecutionId } from "../types/execution";
import type { CapabilityId } from "../types/capability";

export interface UsageTracker {
  record(executionId: ExecutionId, usage: UsageRecord): Promise<void>;
  getSummary(): Promise<UsageSummary>;
  getByCapability(capabilityId: CapabilityId): Promise<UsageRecord | undefined>;
}

export class InMemoryUsageTracker implements UsageTracker {
  private records: Map<ExecutionId, UsageRecord> = new Map();
  private byCapability: Map<CapabilityId, UsageRecord[]> = new Map();

  async record(executionId: ExecutionId, usage: UsageRecord): Promise<void> {
    this.records.set(executionId, usage);

    const existing = this.byCapability.get(usage.providerDistribution ? Object.keys(usage.providerDistribution)[0] ?? "" : "") ?? [];
    this.byCapability.set(Object.keys(usage.providerDistribution ?? {})[0] ?? "", [...existing, usage]);
  }

  async getSummary(): Promise<UsageSummary> {
    const all = Array.from(this.records.values());
    return {
      totalRequests: all.reduce((sum, record) => sum + record.requests, 0),
      totalTokens: all.reduce((sum, record) => sum + (record.tokens ?? 0), 0),
      totalEstimatedCost: all.reduce((sum, record) => sum + record.estimatedCost, 0),
      currency: "USD",
      byCapability: {},
      byPeriod: {
        daily: [],
        monthly: [],
      },
    };
  }

  async getByCapability(capabilityId: CapabilityId): Promise<UsageRecord | undefined> {
    const records = this.byCapability.get(capabilityId) ?? [];
    return records[records.length - 1];
  }
}
