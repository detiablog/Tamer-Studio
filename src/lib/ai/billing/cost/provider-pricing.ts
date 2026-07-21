import type { ProviderPricing } from "../../types/billing";

export class DefaultProviderPricing {
  private static defaultPricing: ProviderPricing[] = [
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

  static getDefaultPricing(): ProviderPricing[] {
    return [...DefaultProviderPricing.defaultPricing];
  }

  static findPricing(
    providerId: string,
    capabilityId: string,
    modelId?: string,
  ): ProviderPricing | undefined {
    return DefaultProviderPricing.defaultPricing.find(
      (p) =>
        p.providerId === providerId &&
        p.capabilityId === capabilityId &&
        (modelId === undefined || p.modelId === modelId),
    );
  }
}
