import type { UsageCollector } from "./usage-collector";
import type { UsageRecord, UsageSummary } from "../../types/monitoring";
import type { ExecutionId } from "../../types/execution";
import type { CapabilityId } from "../../types/capability";

export class InMemoryUsageCollector implements UsageCollector {
  private records: Map<ExecutionId, UsageRecord> = new Map();
  private byCapability: Map<CapabilityId, UsageRecord[]> = new Map();

  async record(executionId: ExecutionId, usage: UsageRecord): Promise<void> {
    this.records.set(executionId, usage);

    const capabilityKey = usage.providerDistribution
      ? Object.keys(usage.providerDistribution)[0] ?? ""
      : "";
    if (capabilityKey) {
      const existing = this.byCapability.get(capabilityKey) ?? [];
      this.byCapability.set(capabilityKey, [...existing, usage]);
    }
  }

  async getByExecution(executionId: ExecutionId): Promise<UsageRecord | undefined> {
    return this.records.get(executionId);
  }

  async getByCapability(capabilityId: CapabilityId): Promise<UsageRecord[]> {
    return this.byCapability.get(capabilityId) ?? [];
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
}
