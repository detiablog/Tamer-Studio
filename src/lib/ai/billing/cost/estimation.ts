import type { CostEstimate, CostEstimateBreakdown, ProviderPricing } from "../../types/billing";

export interface EstimationEngine {
  estimate(executionId: string, inputs: EstimationInput): Promise<CostEstimate>;
  estimateBreakdown(providerId: string, capabilityId: string, units: number): Promise<CostEstimateBreakdown>;
}

export interface EstimationInput {
  providerId: string;
  capabilityId: string;
  modelId: string;
  estimatedTokens?: number;
  estimatedImages?: number;
  estimatedVideoSeconds?: number;
  estimatedAudioSeconds?: number;
  estimatedRequests?: number;
}

export class DefaultEstimationEngine implements EstimationEngine {
  private pricings: ProviderPricing[] = [];

  registerPricing(pricing: ProviderPricing): void {
    this.pricings.push(pricing);
  }

  async estimate(executionId: string, inputs: EstimationInput): Promise<CostEstimate> {
    const pricing = this.pricings.find(
      (p) => p.providerId === inputs.providerId && p.capabilityId === inputs.capabilityId && p.modelId === inputs.modelId,
    );

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

    const breakdown: CostEstimateBreakdown[] = [
      {
        providerId: inputs.providerId,
        capabilityId: inputs.capabilityId,
        estimatedUnits,
        estimatedCost,
      },
    ];

    return {
      executionId,
      estimatedCredits,
      estimatedCost,
      currency: pricing.currency,
      confidence: "medium",
      breakdown,
    };
  }

  async estimateBreakdown(
    providerId: string,
    capabilityId: string,
    units: number,
  ): Promise<CostEstimateBreakdown> {
    const pricing = this.pricings.find(
      (p) => p.providerId === providerId && p.capabilityId === capabilityId,
    );

    if (!pricing) {
      return {
        providerId,
        capabilityId,
        estimatedUnits: units,
        estimatedCost: 0,
      };
    }

    const estimatedCost = units * Math.max(pricing.inputPricePerUnit, pricing.outputPricePerUnit);

    return {
      providerId,
      capabilityId,
      estimatedUnits: units,
      estimatedCost,
    };
  }
}
