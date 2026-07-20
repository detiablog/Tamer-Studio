import type { GatewayId, GatewayHealth } from "./types";

export interface GatewayHealthMonitor {
  checkHealth(gatewayId: GatewayId): Promise<GatewayHealth>;
  updateHealth(health: GatewayHealth): void;
  getHealth(gatewayId: GatewayId): GatewayHealth | undefined;
  listHealth(): GatewayHealth[];
}

export class DefaultGatewayHealthMonitor implements GatewayHealthMonitor {
  private health: Map<GatewayId, GatewayHealth> = new Map();

  async checkHealth(_gatewayId: GatewayId): Promise<GatewayHealth> {
    return {
      gatewayId: _gatewayId,
      status: "unknown",
      latencyMs: 0,
      availability: 0,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
      retryCount: 0,
    };
  }

  updateHealth(health: GatewayHealth): void {
    this.health.set(health.gatewayId, health);
  }

  getHealth(gatewayId: GatewayId): GatewayHealth | undefined {
    return this.health.get(gatewayId);
  }

  listHealth(): GatewayHealth[] {
    return Array.from(this.health.values());
  }
}
