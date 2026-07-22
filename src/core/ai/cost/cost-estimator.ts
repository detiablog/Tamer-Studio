import type { AIRequest } from "../types/domain";
import { DefaultProviderPricing } from "@/lib/ai/billing/cost/provider-pricing";

export interface CostEstimate {
  estimatedCost: number;
  currency: string;
  promptTokens: number;
  completionTokens: number;
  credits: number;
}

export interface CostEstimator {
  estimate(request: AIRequest, model: string, provider: string, usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }): CostEstimate;
}

const CREDITS_PER_USD = 1000;

export class DefaultCostEstimator implements CostEstimator {
  estimate(request: AIRequest, model: string, provider: string, usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }): CostEstimate {
    const pricing = DefaultProviderPricing.findPricing(provider, this.guessCapability(request), model);
    const promptTokens = usage?.promptTokens ?? 0;
    const completionTokens = usage?.completionTokens ?? 0;

    let estimatedCost = 0;
    if (pricing) {
      const inputCost = pricing.inputPricePerUnit * promptTokens;
      const outputCost = pricing.outputPricePerUnit * completionTokens;
      estimatedCost = inputCost + outputCost;
    }

    return {
      estimatedCost,
      currency: pricing?.currency ?? "USD",
      promptTokens,
      completionTokens,
      credits: Math.ceil(estimatedCost * CREDITS_PER_USD),
    };
  }

  private guessCapability(request: AIRequest): string {
    if (request.capability.includes("image")) return "image";
    if (request.capability.includes("video")) return "video";
    if (request.capability.includes("embedding")) return "embedding";
    return "text";
  }
}
