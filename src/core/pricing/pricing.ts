import type { ProviderPricing } from "@/lib/ai/types/billing";

export interface PricingRule {
  providerId: string;
  capabilityId: string;
  modelId: string;
  inputPricePerUnit: number;
  outputPricePerUnit: number;
  unit: ProviderPricing["unit"];
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface PricingEngine {
  registerPricing(rule: PricingRule): void;
  getPricing(providerId: string, capabilityId: string, modelId?: string): PricingRule | undefined;
  calculateCost(rule: PricingRule, inputUnits: number, outputUnits: number): { inputCost: number; outputCost: number; totalCost: number };
  listPricings(): PricingRule[];
}

export class DefaultPricingEngine implements PricingEngine {
  private pricings: PricingRule[] = [];

  registerPricing(rule: PricingRule): void {
    this.pricings.push(rule);
  }

  getPricing(providerId: string, capabilityId: string, modelId?: string): PricingRule | undefined {
    return this.pricings.find(
      (p) =>
        p.providerId === providerId &&
        p.capabilityId === capabilityId &&
        (modelId === undefined || p.modelId === modelId)
    );
  }

  calculateCost(rule: PricingRule, inputUnits: number, outputUnits: number): { inputCost: number; outputCost: number; totalCost: number } {
    const inputCost = inputUnits * rule.inputPricePerUnit;
    const outputCost = outputUnits * rule.outputPricePerUnit;
    const totalCost = inputCost + outputCost;
    return { inputCost, outputCost, totalCost };
  }

  listPricings(): PricingRule[] {
    return [...this.pricings];
  }
}

export const defaultPricingRules: PricingRule[] = [
  {
    providerId: "openai",
    capabilityId: "text",
    modelId: "gpt-4o",
    inputPricePerUnit: 0.0000025,
    outputPricePerUnit: 0.00001,
    unit: "token",
    currency: "USD",
    effectiveFrom: "2024-01-01",
  },
  {
    providerId: "openai",
    capabilityId: "image",
    modelId: "dall-e-3",
    inputPricePerUnit: 0.04,
    outputPricePerUnit: 0.04,
    unit: "image",
    currency: "USD",
    effectiveFrom: "2024-01-01",
  },
  {
    providerId: "anthropic",
    capabilityId: "text",
    modelId: "claude-3-5-sonnet-20240620",
    inputPricePerUnit: 0.000003,
    outputPricePerUnit: 0.000015,
    unit: "token",
    currency: "USD",
    effectiveFrom: "2024-06-01",
  },
  {
    providerId: "replicate",
    capabilityId: "video",
    modelId: "gen-2",
    inputPricePerUnit: 0.05,
    outputPricePerUnit: 0.05,
    unit: "video_second",
    currency: "USD",
    effectiveFrom: "2024-01-01",
  },
];
