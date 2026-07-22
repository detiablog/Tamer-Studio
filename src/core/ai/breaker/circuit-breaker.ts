import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";
import type { AuditAction } from "@/core/audit";
import type { CircuitBreakerPolicy } from "../types/pipeline";

export interface CircuitBreaker {
  allowRequest(providerId: string): boolean;
  recordSuccess(providerId: string): void;
  recordFailure(providerId: string): void;
  getState(providerId: string): "closed" | "open" | "half-open";
}

interface ProviderSnapshot {
  state: "closed" | "open" | "half-open";
  failureCount: number;
  halfOpenSuccesses: number;
  openedAt: number;
}

export class DefaultCircuitBreaker implements CircuitBreaker {
  private readonly snapshots = new Map<string, ProviderSnapshot>();
  private readonly policy: Required<CircuitBreakerPolicy>;

  constructor(policy?: Partial<CircuitBreakerPolicy>) {
    this.policy = {
      failureThreshold: policy?.failureThreshold ?? 5,
      successThreshold: policy?.successThreshold ?? 2,
      recoveryTimeoutMs: policy?.recoveryTimeoutMs ?? 30000,
    };
  }

  allowRequest(providerId: string): boolean {
    const state = this.getState(providerId);
    return state === "closed" || state === "half-open";
  }

  recordSuccess(providerId: string): void {
    const snapshot = this.ensureSnapshot(providerId);

    if (snapshot.state === "half-open") {
      snapshot.halfOpenSuccesses += 1;

      if (snapshot.halfOpenSuccesses >= this.policy.successThreshold) {
        const previousState = snapshot.state;
        snapshot.state = "closed";
        snapshot.failureCount = 0;
        snapshot.halfOpenSuccesses = 0;
        snapshot.openedAt = 0;
        this.emitStateChange(providerId, previousState, snapshot.state);
      }
      return;
    }

    snapshot.failureCount = 0;
  }

  recordFailure(providerId: string): void {
    const snapshot = this.ensureSnapshot(providerId);

    if (snapshot.state === "half-open") {
      const previousState = snapshot.state;
      snapshot.state = "open";
      snapshot.failureCount = 0;
      snapshot.halfOpenSuccesses = 0;
      snapshot.openedAt = Date.now();
      this.emitStateChange(providerId, previousState, snapshot.state);
      return;
    }

    if (snapshot.state === "closed") {
      snapshot.failureCount += 1;

      if (snapshot.failureCount >= this.policy.failureThreshold) {
        const previousState = snapshot.state;
        snapshot.state = "open";
        snapshot.openedAt = Date.now();
        this.emitStateChange(providerId, previousState, snapshot.state);
      }
    }
  }

  getState(providerId: string): "closed" | "open" | "half-open" {
    const snapshot = this.snapshots.get(providerId);
    if (!snapshot || snapshot.state !== "open") {
      return snapshot?.state ?? "closed";
    }

    if (Date.now() - snapshot.openedAt >= this.policy.recoveryTimeoutMs) {
      const previousState = snapshot.state;
      snapshot.state = "half-open";
      snapshot.halfOpenSuccesses = 0;
      this.emitStateChange(providerId, previousState, snapshot.state);
      return "half-open";
    }

    return "open";
  }

  private ensureSnapshot(providerId: string): ProviderSnapshot {
    const existing = this.snapshots.get(providerId);
    if (existing) return existing;

    const snapshot: ProviderSnapshot = {
      state: "closed",
      failureCount: 0,
      halfOpenSuccesses: 0,
      openedAt: 0,
    };

    this.snapshots.set(providerId, snapshot);
    return snapshot;
  }

  private emitStateChange(providerId: string, fromState: string, toState: string): void {
    const action = `ai.circuit_breaker.${toState}` as AuditAction;
    logger.info("Circuit breaker state changed", {
      providerId,
      fromState,
      toState,
    });
    void logAction(action, undefined, undefined, {
      providerId,
      fromState,
      toState,
    }).catch(() => {});
  }
}
