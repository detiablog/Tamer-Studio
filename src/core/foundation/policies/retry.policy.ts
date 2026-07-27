export interface RetryPolicy {
  readonly name: string;
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly jitter: boolean;
  execute<T>(fn: () => Promise<T>, retryable?: (error: unknown) => boolean): Promise<T>;
}

export interface RetryPolicyConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
}

export class ExponentialBackoffRetryPolicy implements RetryPolicy {
  readonly name = "exponential-backoff";
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly jitter: boolean;

  constructor(config: RetryPolicyConfig = {}) {
    this.maxRetries = config.maxRetries ?? 3;
    this.baseDelayMs = config.baseDelayMs ?? 1000;
    this.maxDelayMs = config.maxDelayMs ?? 30000;
    this.jitter = config.jitter ?? true;
  }

  async execute<T>(fn: () => Promise<T>, retryable?: (error: unknown) => boolean): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (retryable && !retryable(error)) {
          throw error;
        }
        if (attempt === this.maxRetries) {
          throw error;
        }
        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }
    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    const exponential = this.baseDelayMs * Math.pow(2, attempt);
    const capped = Math.min(exponential, this.maxDelayMs);
    if (this.jitter) {
      return Math.floor(Math.random() * capped);
    }
    return capped;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}