import type { UsageRecord, UsageCollector, UsageSummary } from "@/lib/ai/types/billing";

export class UsageService implements UsageCollector {
  private records = new Map<string, UsageRecord>();
  private byCapability = new Map<string, UsageRecord[]>();

  async record(executionId: string, usage: UsageRecord): Promise<void> {
    this.records.set(executionId, usage);

    const capabilityKey = usage.providerDistribution
      ? Object.keys(usage.providerDistribution)[0] ?? ""
      : "";
    if (capabilityKey) {
      const existing = this.byCapability.get(capabilityKey) ?? [];
      this.byCapability.set(capabilityKey, [...existing, usage]);
    }
  }

  async getByExecution(executionId: string): Promise<UsageRecord | undefined> {
    return this.records.get(executionId);
  }

  async getByCapability(capabilityId: string): Promise<UsageRecord[]> {
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
