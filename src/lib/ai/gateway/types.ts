import type { GatewayId, GatewayDefinition } from "../models";
export type { GatewayId, GatewayDefinition } from "../models";

export type { ExecutionId, ExecutionRequest, ExecutionResponse } from "../execution/types";

export type GatewayHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface GatewayHealth {
  gatewayId: GatewayId;
  status: GatewayHealthStatus;
  latencyMs: number;
  availability: number;
  lastChecked: string;
  errorCount: number;
  retryCount: number;
}

export interface GatewayTimeoutRule {
  capabilityId?: string;
  gatewayId?: string;
  durationMs: number;
}

export interface GatewayRetryRule {
  maxAttempts: number;
  backoffMs: number;
  retryableStatuses: string[];
}

export interface GatewayPolicy {
  primaryGatewayId: GatewayId;
  fallbackGatewayId?: GatewayId;
  capabilityRouting: Record<string, GatewayId>;
  timeoutRules: GatewayTimeoutRule[];
  retryRules: GatewayRetryRule[];
  workspaceOverrides: Record<string, Partial<GatewayPolicy>>;
  featureFlags: Record<string, boolean>;
}

export interface GatewayMetrics {
  gatewayId: GatewayId;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  lastRequestAt?: string;
}

export interface GatewayConfiguration {
  gateways: GatewayDefinition[];
  policies: GatewayPolicy[];
  defaultTimeoutMs: number;
  defaultRetryMaxAttempts: number;
  defaultRetryBackoffMs: number;
}
