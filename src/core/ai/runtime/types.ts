import type {
  AIRequest,
  AIError,
  FallbackPolicy,
} from "../types/domain";
import type { RetryPolicy, CircuitBreakerPolicy as _CBPolicy } from "../types/pipeline";

export type { AIRequest, AIError, FallbackPolicy } from "../types/domain";
export type { RetryPolicy, CircuitBreakerPolicy } from "../types/pipeline";

export interface TelemetryRecord {
  executionId: string;
  capabilityId: string;
  status: "success" | "failure";
  durationMs: number;
  tokensUsed?: number;
  cost?: number;
  providerId?: string;
  retryCount?: number;
  fallbackUsed?: boolean;
  failureReason?: string;
  streamingDurationMs?: number;
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  model?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface RuntimeOptions {
  timeoutMs?: number;
  retryPolicy?: RetryPolicy;
  fallbackPolicy?: FallbackPolicy;
  telemetryEnabled?: boolean;
  metadata?: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface RuntimeResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AIError;
  telemetry?: TelemetryRecord;
}

export interface AIHealth {
  status: "healthy" | "degraded" | "unhealthy";
  providers: Array<{
    id: string;
    status: string;
    latencyMs?: number;
    lastChecked: string;
  }>;
  checkedAt: string;
}

export interface ProviderSelector {
  select(request: AIRequest, options?: RuntimeOptions): Promise<string>;
}

export interface ProviderRegistry {
  listProviders(): string[];
  getHealth(providerId?: string): Promise<AIHealth>;
}

export interface ExecutionPipeline {
  execute<T = unknown>(
    request: AIRequest,
    options?: RuntimeOptions,
    signal?: AbortSignal
  ): Promise<RuntimeResult<T>>;
  executeStream<T = unknown>(
    request: AIRequest,
    options?: RuntimeOptions,
    signal?: AbortSignal
  ): AsyncIterable<RuntimeResult<T>>;
  cancel(executionId: string): Promise<void>;
}

export interface TelemetryService {
  record(record: TelemetryRecord): Promise<void>;
}

export interface AIRuntime {
  execute<T = unknown>(request: AIRequest, options?: RuntimeOptions): Promise<RuntimeResult<T>>;
  executeStream<T = unknown>(request: AIRequest, options?: RuntimeOptions): AsyncIterable<RuntimeResult<T>>;
  cancel(executionId: string): Promise<void>;
  getHealth(): Promise<AIHealth>;
}
