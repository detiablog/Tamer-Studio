import type { UsageRecord, CostRecord, CostEstimate, CostEstimateBreakdown, EstimationInput, EstimationEngine, ProviderPricing } from "@/lib/ai/types/billing";
import { DefaultPricingEngine, defaultPricingRules } from "../pricing";

export interface CostCalculationResult {
  costRecord: CostRecord;
  credits: number;
}

export class DefaultCostEngine implements EstimationEngine {
  private pricingEngine = new DefaultPricingEngine();

  constructor() {
    for (const rule of defaultPricingRules) {
      this.pricingEngine.registerPricing(rule);
    }
  }

  registerPricing(pricing: ProviderPricing): void {
    this.pricingEngine.registerPricing({
      ...pricing,
      effectiveFrom: pricing.effectiveFrom,
    });
  }

  getPricing(providerId: string, capabilityId: string, modelId?: string): ProviderPricing | undefined {
    const rule = this.pricingEngine.getPricing(providerId, capabilityId, modelId);
    if (!rule) return undefined;
    return {
      providerId: rule.providerId,
      capabilityId: rule.capabilityId,
      modelId: rule.modelId,
      inputPricePerUnit: rule.inputPricePerUnit,
      outputPricePerUnit: rule.outputPricePerUnit,
      unit: rule.unit,
      currency: rule.currency,
      effectiveFrom: rule.effectiveFrom,
    };
  }

  async calculateCost(executionId: string, usage: UsageRecord): Promise<CostCalculationResult> {
    const providerDistribution = usage.providerDistribution ?? {};
    const providerId = Object.keys(providerDistribution)[0] ?? "unknown";
    const capabilityId = Object.keys(providerDistribution)[0] ?? "unknown";
    const modelId = "";

    const pricing = this.pricingEngine.getPricing(providerId, capabilityId, modelId) ?? this.pricingEngine.getPricing(providerId, capabilityId);
    if (!pricing) {
      throw new Error(`No pricing found for provider ${providerId} capability ${capabilityId}`);
    }

    const inputUnits = usage.tokens ?? usage.characters ?? 0;
    const outputUnits = usage.images ?? usage.videoSeconds ?? usage.audioSeconds ?? 0;
    const { inputCost, outputCost, totalCost } = this.pricingEngine.calculateCost(pricing, inputUnits, outputUnits);

    const credits = Math.ceil(totalCost * 100);

    const costRecord: CostRecord = {
      executionId,
      providerId,
      capabilityId,
      inputUnits,
      outputUnits,
      inputCost,
      outputCost,
      totalCost,
      currency: pricing.currency,
      pricingUsed: {
        providerId: pricing.providerId,
        capabilityId: pricing.capabilityId,
        modelId: pricing.modelId,
        inputPricePerUnit: pricing.inputPricePerUnit,
        outputPricePerUnit: pricing.outputPricePerUnit,
        unit: pricing.unit,
        currency: pricing.currency,
        effectiveFrom: pricing.effectiveFrom,
      },
    };

    return { costRecord, credits };
  }

  async estimate(executionId: string, inputs: EstimationInput): Promise<CostEstimate> {
    const pricing = this.pricingEngine.getPricing(inputs.providerId, inputs.capabilityId, inputs.modelId);

    if (!pricing) {
      return {
        executionId,
        estimatedCredits: 0,
        estimatedCost: 0,
        currency: "USD",
        confidence: "low",
        breakdown: [],
      };
    }

    const estimatedUnits = inputs.estimatedTokens ?? inputs.estimatedRequests ?? 0;
    const estimatedCost = estimatedUnits * Math.max(pricing.inputPricePerUnit, pricing.outputPricePerUnit);
    const estimatedCredits = Math.ceil(estimatedCost * 100);

    return {
      executionId,
      estimatedCredits,
      estimatedCost,
      currency: pricing.currency,
      confidence: "medium",
      breakdown: [
        {
          providerId: inputs.providerId,
          capabilityId: inputs.capabilityId,
          estimatedUnits,
          estimatedCost,
        },
      ],
    };
  }

  async estimateBreakdown(providerId: string, capabilityId: string, units: number): Promise<CostEstimateBreakdown> {
    const pricing = this.pricingEngine.getPricing(providerId, capabilityId);
    if (!pricing) {
      return { providerId, capabilityId, estimatedUnits: units, estimatedCost: 0 };
    }
    const estimatedCost = units * Math.max(pricing.inputPricePerUnit, pricing.outputPricePerUnit);
    return { providerId, capabilityId, estimatedUnits: units, estimatedCost };
  }
}
