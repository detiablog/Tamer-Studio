export interface AIProvider {
  id: string;
  name: string;
  providerType: "openai" | "anthropic" | "google" | "aws" | "azure" | "custom";
  status: "active" | "inactive" | "error" | "maintenance";
  priority: number;
  enabled: boolean;
  apiKeyConfigured: boolean;
  capabilities: string[];
  models: string[];
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  costConfiguration: {
    currency: string;
    inputPricePerToken: number;
    outputPricePerToken: number;
    imagePricePerUnit: number;
    videoPricePerSecond: number;
    audioPricePerSecond: number;
  };
  health: {
    lastChecked: Date;
    status: "healthy" | "degraded" | "unhealthy";
    latencyMs: number;
    errorMessage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  config?: {
    apiKey?: string;
    baseUrl?: string;
    timeoutMs?: number;
    retryCount?: number;
    providerType?: string;
    headers?: Record<string, string>;
  };
}

export interface ProviderModelAvailability {
  providerId: string;
  modelId: string;
  capability: string;
  available: boolean;
  deprecated: boolean;
  deprecationDate?: Date;
  replacementModel?: string;
}

export interface ProviderHealthCheck {
  providerId: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  checkedAt: Date;
  errorMessage?: string;
}

export interface ProviderConfigurationInput {
  name: string;
  providerType: AIProvider["providerType"];
  priority?: number;
  enabled?: boolean;
  apiKey: string;
  capabilities: string[];
  models: string[];
  rateLimit: AIProvider["rateLimit"];
  costConfiguration: AIProvider["costConfiguration"];
}
