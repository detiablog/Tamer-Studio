import type { RetryPolicy } from "./pipeline";

export type CapabilityId = string;
export type ModelId = string;
export type ProviderId = string;
export type RequestId = string;

export type CapabilityCategory =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "speech"
  | "embedding"
  | "vision"
  | "custom";

export type AIProviderStatus =
  | "active"
  | "inactive"
  | "degraded"
  | "maintenance";

export type AIRequestStatus =
  | "success"
  | "failed"
  | "partial"
  | "timeout"
  | "cancelled";

export interface AIExecutionContext {
  readonly executionId: string;
  readonly requestId: RequestId;
  readonly userId?: string;
  readonly workspaceId?: string;
  readonly projectId?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AIError {
  readonly code: string;
  readonly message: string;
  readonly provider?: string;
  readonly retryable?: boolean;
  readonly retryAfterMs?: number;
  readonly details?: Record<string, unknown>;
  readonly stackTrace?: string;
}

export interface AIUsage {
  readonly promptTokens?: number;
  readonly completionTokens?: number;
  readonly totalTokens?: number;
  readonly images?: number;
  readonly videoSeconds?: number;
  readonly audioSeconds?: number;
  readonly characters?: number;
  readonly estimatedCost: number;
  readonly currency: string;
  readonly providerDistribution?: Record<string, number>;
}

export interface FallbackPolicy {
  readonly enabled: boolean;
  readonly chain: readonly string[];
  readonly onStatus?: readonly AIRequestStatus[];
}

export interface AIRequest {
  readonly id?: RequestId;
  readonly capability: CapabilityId;
  readonly model?: ModelId;
  readonly payload: Record<string, unknown>;
  readonly context: AIExecutionContext;
  readonly metadata?: Record<string, unknown>;
  readonly timeoutMs?: number;
  readonly retryPolicy?: RetryPolicy;
  readonly fallbackPolicy?: FallbackPolicy;
}

export interface AIResponse {
  readonly id: string;
  readonly requestId: RequestId;
  readonly status: AIRequestStatus;
  readonly result?: Record<string, unknown>;
  readonly error?: AIError;
  readonly usage: AIUsage;
  readonly metadata?: Record<string, unknown>;
  readonly completedAt?: string;
  readonly durationMs?: number;
}

export interface AIProviderConfig {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly apiVersion?: string;
  readonly headers?: Record<string, string>;
  readonly timeoutMs?: number;
  readonly retryCount?: number;
  readonly region?: string;
}

export interface AIHealth {
  readonly status: "healthy" | "degraded" | "unhealthy" | "unknown";
  readonly lastChecked: string;
  readonly latencyMs?: number;
  readonly errorMessage?: string;
  readonly consecutiveFailures?: number;
  readonly uptime?: number;
}

export interface AIProviderCapability {
  readonly id: string;
  readonly name: string;
  readonly category: CapabilityCategory;
  readonly description?: string;
  readonly inputSchema?: Record<string, unknown>;
  readonly outputSchema?: Record<string, unknown>;
  readonly maxConcurrent?: number;
  readonly estimatedLatencyMs?: number;
}

export interface AIModel {
  readonly id: ModelId;
  readonly providerId: ProviderId;
  readonly name: string;
  readonly displayName: string;
  readonly category: CapabilityCategory;
  readonly contextLength?: number;
  readonly inputTypes: readonly string[];
  readonly outputTypes: readonly string[];
  readonly maxTokens?: number;
  readonly supportsStreaming?: boolean;
  readonly supportsVision?: boolean;
  readonly supportsTools?: boolean;
  readonly pricing?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

export interface AIProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly providerType:
    | "openai"
    | "google"
    | "anthropic"
    | "openrouter"
    | "kilo"
    | "custom";
  readonly status: AIProviderStatus;
  readonly capabilities: readonly AIProviderCapability[];
  readonly models: readonly AIModel[];
  readonly config: AIProviderConfig;
  readonly health: AIHealth;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}
