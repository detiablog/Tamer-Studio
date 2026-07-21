import type { UsageRecord } from "../../types/monitoring";
import type { CostRecord, CostSummary, ProviderPricing } from "../../types/billing";

export interface CostEngine {
  calculateCost(executionId: string, usage: UsageRecord): Promise<CostRecord>;
  getCostSummary(workspaceId: string, period: string): Promise<CostSummary>;
  registerPricing(pricing: ProviderPricing): void;
  getPricing(providerId: string, capabilityId: string): ProviderPricing | undefined;
}

export class InMemoryCostEngine implements CostEngine {
  private pricings: ProviderPricing[] = [];
  private costRecords: Map<string, CostRecord[]> = new Map();

  registerPricing(pricing: ProviderPricing): void {
    this.pricings.push(pricing);
  }

  getPricing(providerId: string, capabilityId: string): ProviderPricing | undefined {
    return this.pricings.find(
      (p) => p.providerId === providerId && p.capabilityId === capabilityId,
    );
  }

  async calculateCost(executionId: string, usage: UsageRecord): Promise<CostRecord> {
    const providerDistribution = usage.providerDistribution ?? {};
    const providerId = Object.keys(providerDistribution)[0] ?? "unknown";
    const capabilityId = Object.keys(providerDistribution)[0] ?? "unknown";

    const pricing = this.getPricing(providerId, capabilityId);
    if (!pricing) {
      throw new Error(`No pricing found for provider ${providerId} capability ${capabilityId}`);
    }

    const inputUnits = usage.tokens ?? usage.characters ?? 0;
    const outputUnits = usage.images ?? usage.videoSeconds ?? usage.audioSeconds ?? 0;
    const inputCost = inputUnits * pricing.inputPricePerUnit;
    const outputCost = outputUnits * pricing.outputPricePerUnit;
    const totalCost = inputCost + outputCost;

    const record: CostRecord = {
      executionId,
      providerId,
      capabilityId,
      inputUnits,
      outputUnits,
      inputCost,
      outputCost,
      totalCost,
      currency: pricing.currency,
      pricingUsed: pricing,
    };

    const existing = this.costRecords.get(executionId) ?? [];
    existing.push(record);
    this.costRecords.set(executionId, existing);

    return record;
  }

  async getCostSummary(_workspaceId: string, _period: string): Promise<CostSummary> {
    const allRecords = Array.from(this.costRecords.values()).flat();
    const totalCost = allRecords.reduce((sum, record) => sum + record.totalCost, 0);
    const currency = allRecords[0]?.currency ?? "USD";

    const byProvider: Record<string, number> = {};
    const byCapability: Record<string, number> = {};

    for (const record of allRecords) {
      byProvider[record.providerId] = (byProvider[record.providerId] ?? 0) + record.totalCost;
      byCapability[record.capabilityId] = (byCapability[record.capabilityId] ?? 0) + record.totalCost;
    }

    return {
      totalCost,
      currency,
      byProvider,
      byCapability,
      byPeriod: {
        daily: [],
        monthly: [],
      },
    };
  }
}
