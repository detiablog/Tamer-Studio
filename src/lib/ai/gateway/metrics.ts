import type { GatewayId, GatewayMetrics } from "./types";

export interface GatewayMetricsCollector {
  recordRequest(gatewayId: GatewayId, success: boolean, latencyMs: number): void;
  getMetrics(gatewayId: GatewayId): GatewayMetrics | undefined;
  listMetrics(): GatewayMetrics[];
  reset(gatewayId: GatewayId): void;
}

export class DefaultGatewayMetricsCollector implements GatewayMetricsCollector {
  private metrics: Map<GatewayId, GatewayMetrics> = new Map();

  recordRequest(gatewayId: GatewayId, success: boolean, latencyMs: number): void {
    const existing = this.metrics.get(gatewayId) ?? {
      gatewayId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatencyMs: 0,
      lastRequestAt: new Date().toISOString(),
    };

    existing.totalRequests += 1;
    existing.lastRequestAt = new Date().toISOString();

    if (success) {
      existing.successfulRequests += 1;
    } else {
      existing.failedRequests += 1;
    }

    const total = existing.successfulRequests + existing.failedRequests;
    existing.averageLatencyMs = existing.averageLatencyMs + (latencyMs - existing.averageLatencyMs) / total;

    this.metrics.set(gatewayId, existing);
  }

  getMetrics(gatewayId: GatewayId): GatewayMetrics | undefined {
    return this.metrics.get(gatewayId);
  }

  listMetrics(): GatewayMetrics[] {
    return Array.from(this.metrics.values());
  }

  reset(gatewayId: GatewayId): void {
    this.metrics.delete(gatewayId);
  }
}
