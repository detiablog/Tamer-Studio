import type { RetryConfig } from "./types";

export interface RetryManager {
  shouldRetry(attempt: number, config: RetryConfig): boolean;
  calculateDelay(attempt: number, config: RetryConfig): number;
  execute<T>(operation: () => Promise<T>, config: RetryConfig): Promise<T>;
}

export class DefaultRetryManager implements RetryManager {
  private config: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    jitterMs: 500,
  };

  shouldRetry(attempt: number, config: RetryConfig): boolean {
    const resolvedConfig = { ...this.config, ...config };
    return attempt < resolvedConfig.maxAttempts;
  }

  calculateDelay(attempt: number, config: RetryConfig): number {
    const resolvedConfig = { ...this.config, ...config };
    const exponentialDelay = resolvedConfig.baseDelayMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * resolvedConfig.jitterMs;
    return Math.min(exponentialDelay + jitter, resolvedConfig.maxDelayMs);
  }

  async execute<T>(operation: () => Promise<T>, config: RetryConfig): Promise<T> {
    const resolvedConfig = { ...this.config, ...config };
    let lastError: unknown;
    let attempt = 0;

    while (this.shouldRetry(attempt, resolvedConfig)) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempt++;

        if (!this.shouldRetry(attempt, resolvedConfig)) {
          break;
        }

        const delayMs = this.calculateDelay(attempt, resolvedConfig);
        await this.sleep(delayMs);
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  configure(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
