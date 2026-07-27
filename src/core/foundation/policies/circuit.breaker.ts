export type CircuitBreakerState = "closed" | "open" | "half-open";

export interface CircuitBreakerEvents {
  onStateChange?: (from: CircuitBreakerState, to: CircuitBreakerState) => void;
  onFailure?: (error: unknown) => void;
  onSuccess?: () => void;
}

export interface CircuitBreaker {
  readonly name: string;
  readonly state: CircuitBreakerState;
  execute<T>(fn: () => Promise<T>): Promise<T>;
  recordSuccess(): void;
  recordFailure(): void;
  reset(): void;
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  recoveryTimeoutMs?: number;
  halfOpenMaxCalls?: number;
}

export class CircuitBreakerImpl implements CircuitBreaker {
  readonly name: string;
  private _state: CircuitBreakerState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly halfOpenMaxCalls: number;
  private halfOpenCalls = 0;
  private readonly events: CircuitBreakerEvents;

  constructor(name: string, config: CircuitBreakerConfig = {}, events: CircuitBreakerEvents = {}) {
    this.name = name;
    this.failureThreshold = config.failureThreshold ?? 5;
    this.recoveryTimeoutMs = config.recoveryTimeoutMs ?? 30000;
    this.halfOpenMaxCalls = config.halfOpenMaxCalls ?? 3;
    this.events = events;
  }

  get state(): CircuitBreakerState {
    return this._state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this._state === "open") {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeoutMs) {
        this.transitionTo("half-open");
        this.halfOpenCalls = 0;
      } else {
        throw new Error(`Circuit breaker ${this.name} is open`);
      }
    }

    if (this._state === "half-open") {
      if (this.halfOpenCalls >= this.halfOpenMaxCalls) {
        throw new Error(`Circuit breaker ${this.name} is half-open, max calls reached`);
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordSuccess(): void {
    if (this._state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.halfOpenMaxCalls) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
    this.events.onSuccess?.();
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.events.onFailure?.(new Error(`Circuit breaker ${this.name} recorded failure`));

    if (this._state === "half-open" || this.failureCount >= this.failureThreshold) {
      this.transitionTo("open");
    }
  }

  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.transitionTo("closed");
  }

  private transitionTo(newState: CircuitBreakerState): void {
    const oldState = this._state;
    this._state = newState;
    this.events.onStateChange?.(oldState, newState);
  }
}