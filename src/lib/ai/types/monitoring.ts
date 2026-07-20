export interface UsageRecord {
  requests: number;
  tokens?: number;
  characters?: number;
  images?: number;
  videoSeconds?: number;
  audioSeconds?: number;
  estimatedCost: number;
  currency: string;
  providerDistribution?: Record<string, number>;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalEstimatedCost: number;
  currency: string;
  byCapability: Record<string, UsageRecord>;
  byPeriod: {
    daily: number[];
    monthly: number[];
  };
}
