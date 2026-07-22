export interface SelectionScore {
  providerId: string;
  score: number;
  reasons: string[];
}

export interface SelectionPolicy {
  capability: string;
  preferredProviders?: string[];
  excludedProviders?: string[];
  minHealthStatus?: "healthy" | "degraded" | "unhealthy";
  maxCostPerUnit?: number;
  maxLatencyMs?: number;
  region?: string;
  fallbackChain?: string[];
}
