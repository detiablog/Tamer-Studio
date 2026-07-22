import type { AIResponse, AIError } from "./domain";

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly backoffMs?: number;
  readonly backoffMultiplier?: number;
  readonly maxBackoffMs?: number;
  readonly retryableStatusCodes?: readonly number[];
  readonly retryableErrors?: readonly string[];
}

export interface CircuitBreakerPolicy {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly recoveryTimeoutMs: number;
}

export interface TimeoutPolicy {
  readonly connectTimeoutMs?: number;
  readonly readTimeoutMs?: number;
  readonly writeTimeoutMs?: number;
  readonly totalTimeoutMs?: number;
}

export interface PipelineContext {
  readonly requestId: string;
  readonly capability: string;
  readonly provider: string;
  readonly model: string;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly startTime: string;
  readonly metadata?: Record<string, unknown>;
}

export interface PipelineResult {
  readonly success: boolean;
  readonly response?: AIResponse;
  readonly error?: AIError;
  readonly providerUsed: string;
  readonly modelUsed: string;
  readonly durationMs: number;
  readonly retries: number;
  readonly fallbackUsed?: boolean;
}
