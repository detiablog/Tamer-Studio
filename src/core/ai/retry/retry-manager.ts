import { logger } from "@/core/logger";
import type { RetryPolicy } from "../types/pipeline";

export interface RetryManager {
  execute<T>(fn: () => Promise<T>, policy: RetryPolicy): Promise<T>;
}

export class DefaultRetryManager implements RetryManager {
  async execute<T>(fn: () => Promise<T>, policy: RetryPolicy): Promise<T> {
    const maxAttempts = policy.maxAttempts;
    const backoffMs = policy.backoffMs ?? 1000;
    const backoffMultiplier = policy.backoffMultiplier ?? 2;
    const maxBackoffMs = policy.maxBackoffMs ?? 30000;
    const retryableStatusCodes = new Set(policy.retryableStatusCodes ?? []);
    const retryableErrors = new Set(policy.retryableErrors ?? []);

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt >= maxAttempts) {
          break;
        }

        const isRetryable = this.isRetryable(error, retryableStatusCodes, retryableErrors);
        if (!isRetryable) {
          break;
        }

        const delayMs = this.calculateDelay(attempt, backoffMs, backoffMultiplier, maxBackoffMs);
        logger.warn("Retrying after failure", {
          attempt,
          maxAttempts,
          delayMs,
        });
        await this.sleep(delayMs);
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private isRetryable(
    error: unknown,
    retryableStatusCodes: Set<number>,
    retryableErrors: Set<string>
  ): boolean {
    if (retryableStatusCodes.size > 0) {
      const statusCode = this.extractStatusCode(error);
      if (typeof statusCode === "number" && retryableStatusCodes.has(statusCode)) {
        return true;
      }
    }

    if (retryableErrors.size > 0) {
      const errorCode = this.extractErrorCode(error);
      if (typeof errorCode === "string" && retryableErrors.has(errorCode)) {
        return true;
      }
    }

    return false;
  }

  private extractStatusCode(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;

    const candidate = error as Record<string, unknown>;
    if (typeof candidate.status === "number") return candidate.status;
    if (typeof candidate.statusCode === "number") return candidate.statusCode;
    return undefined;
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== "object") return undefined;

    const candidate = error as Record<string, unknown>;
    if (typeof candidate.code === "string") return candidate.code;
    return undefined;
  }

  private calculateDelay(
    attempt: number,
    backoffMs: number,
    backoffMultiplier: number,
    maxBackoffMs: number
  ): number {
    const exponentialDelay = backoffMs * Math.pow(backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, maxBackoffMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
