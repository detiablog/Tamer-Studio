import type { GatewayId } from "../../models";
export type { GatewayId } from "../../models";

import type { GatewayHealth } from "../types";
export type { GatewayHealth } from "../types";

export type CircuitBreakerState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxRequests: number;
}

export interface CircuitBreakerSnapshot {
  gatewayId: GatewayId;
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureAt?: string;
  openedAt?: string;
  halfOpenRequests: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
}

export interface RetryAttempt {
  attempt: number;
  delayMs: number;
  error?: string;
}

export type GatewayEventType =
  | "gateway.health.changed"
  | "gateway.circuit_breaker.opened"
  | "gateway.circuit_breaker.closed"
  | "gateway.circuit_breaker.half_opened"
  | "gateway.failover.triggered"
  | "gateway.recovery.started"
  | "gateway.recovery.completed"
  | "gateway.request.started"
  | "gateway.request.completed"
  | "gateway.request.failed";

export interface GatewayEvent {
  type: GatewayEventType;
  gatewayId: GatewayId;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface GatewayRuntimeState {
  primaryGatewayId: GatewayId;
  fallbackGatewayId?: GatewayId;
  activeGatewayId?: GatewayId;
  isFailover: boolean;
  circuitBreakers: Map<GatewayId, CircuitBreakerSnapshot>;
  health: Map<GatewayId, GatewayHealth>;
  lastEvent?: GatewayEvent;
}
