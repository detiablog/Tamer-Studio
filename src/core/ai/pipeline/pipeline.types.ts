import type { AIRequest } from "../types/domain";
import type { RuntimeOptions } from "../runtime/types";
import type { AIError } from "../../errors/ai-error";

export interface PipelineContext {
  request: AIRequest;
  options?: RuntimeOptions;
  signal?: AbortSignal;
  attempt: number;
  maxAttempts: number;
  startTime: number;
  metadata?: Record<string, unknown>;
}

export interface PipelineResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AIError;
  providerUsed?: string;
  modelUsed?: string;
  durationMs: number;
  retries: number;
  fallbackUsed: boolean;
}
