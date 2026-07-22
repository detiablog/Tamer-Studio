import type {
  AIRequest,
  AIError,
} from "../types/domain";

export type { AIRequest, AIError } from "../types/domain";

export interface TelemetryRecord {
  executionId: string;
  capabilityId: string;
  status: "success" | "failure";
  durationMs: number;
  tokensUsed?: number;
  cost?: number;
  providerId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface RuntimeOptions {
  timeoutMs?: number;
  retryPolicy?: Record<string, unknown>;
  fallbackPolicy?: Record<string, unknown>;
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
