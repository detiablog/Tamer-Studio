import type { GatewayId, CircuitBreakerConfig, CircuitBreakerSnapshot, CircuitBreakerState } from "./types";

export interface CircuitBreaker {
  getState(gatewayId: GatewayId): CircuitBreakerState;
  getSnapshot(gatewayId: GatewayId): CircuitBreakerSnapshot | undefined;
  recordSuccess(gatewayId: GatewayId): void;
  recordFailure(gatewayId: GatewayId): void;
  allowRequest(gatewayId: GatewayId): boolean;
  reset(gatewayId: GatewayId): void;
  configure(config: Partial<CircuitBreakerConfig>): void;
}

export class DefaultCircuitBreaker implements CircuitBreaker {
  private snapshots: Map<GatewayId, CircuitBreakerSnapshot> = new Map();
  private config: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeoutMs: 30000,
    halfOpenMaxRequests: 3,
  };

  getState(gatewayId: GatewayId): CircuitBreakerState {
    const snapshot = this.snapshots.get(gatewayId);
    if (!snapshot) return "closed";

    if (snapshot.state === "open") {
      if (snapshot.openedAt && Date.now() - new Date(snapshot.openedAt).getTime() >= this.config.resetTimeoutMs) {
        snapshot.state = "half-open";
        snapshot.halfOpenRequests = 0;
        return "half-open";
      }
      return "open";
    }

    return snapshot.state;
  }

  getSnapshot(gatewayId: GatewayId): CircuitBreakerSnapshot | undefined {
    return this.snapshots.get(gatewayId);
  }

  recordSuccess(gatewayId: GatewayId): void {
    const snapshot = this.getOrCreateSnapshot(gatewayId);
    snapshot.failureCount = 0;
    snapshot.halfOpenRequests = 0;

    if (snapshot.state === "half-open") {
      snapshot.state = "closed";
      snapshot.openedAt = undefined;
    }
  }

  recordFailure(gatewayId: GatewayId): void {
    const snapshot = this.getOrCreateSnapshot(gatewayId);
    snapshot.failureCount += 1;
    snapshot.lastFailureAt = new Date().toISOString();

    if (snapshot.state === "closed" && snapshot.failureCount >= this.config.failureThreshold) {
      snapshot.state = "open";
      snapshot.openedAt = new Date().toISOString();
    } else if (snapshot.state === "half-open") {
      snapshot.state = "open";
      snapshot.openedAt = new Date().toISOString();
    }
  }

  allowRequest(gatewayId: GatewayId): boolean {
    const state = this.getState(gatewayId);
    if (state === "closed") return true;
    if (state === "open") return false;

    const snapshot = this.snapshots.get(gatewayId);
    if (snapshot && snapshot.halfOpenRequests < this.config.halfOpenMaxRequests) {
      snapshot.halfOpenRequests += 1;
      return true;
    }

    return false;
  }

  reset(gatewayId: GatewayId): void {
    const snapshot = this.snapshots.get(gatewayId);
    if (snapshot) {
      snapshot.state = "closed";
      snapshot.failureCount = 0;
      snapshot.halfOpenRequests = 0;
      snapshot.openedAt = undefined;
      snapshot.lastFailureAt = undefined;
    }
  }

  configure(config: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private getOrCreateSnapshot(gatewayId: GatewayId): CircuitBreakerSnapshot {
    const existing = this.snapshots.get(gatewayId);
    if (existing) return existing;

    const snapshot: CircuitBreakerSnapshot = {
      gatewayId,
      state: "closed",
      failureCount: 0,
      halfOpenRequests: 0,
    };

    this.snapshots.set(gatewayId, snapshot);
    return snapshot;
  }
}
