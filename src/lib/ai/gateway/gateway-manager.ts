import type { GatewayId, GatewayDefinition, GatewayHealth, GatewayPolicy, GatewayMetrics } from "./types";
import type { GatewayRegistry } from "./gateway-registry";

export interface GatewayManager {
  register(gateway: GatewayDefinition): void;
  registerMany(gateways: GatewayDefinition[]): void;
  resolve(gatewayId: GatewayId): GatewayDefinition | undefined;
  has(gatewayId: GatewayId): boolean;
  list(): GatewayDefinition[];
  selectForCapability(capabilityId: string, policy: GatewayPolicy): GatewayDefinition | undefined;
  updateHealth(health: GatewayHealth): void;
  getHealth(gatewayId: GatewayId): GatewayHealth | undefined;
  recordMetrics(metrics: GatewayMetrics): void;
  getMetrics(gatewayId: GatewayId): GatewayMetrics | undefined;
  discover(): Promise<GatewayDefinition[]>;
}

export class DefaultGatewayManager implements GatewayManager {
  private registry: GatewayRegistry;
  private health: Map<GatewayId, GatewayHealth> = new Map();
  private metrics: Map<GatewayId, GatewayMetrics> = new Map();

  constructor(registry: GatewayRegistry) {
    this.registry = registry;
  }

  register(gateway: GatewayDefinition): void {
    this.registry.register(gateway);
  }

  registerMany(gateways: GatewayDefinition[]): void {
    this.registry.registerMany(gateways);
  }

  resolve(gatewayId: GatewayId): GatewayDefinition | undefined {
    return this.registry.resolve(gatewayId);
  }

  has(gatewayId: GatewayId): boolean {
    return this.registry.has(gatewayId);
  }

  list(): GatewayDefinition[] {
    return this.registry.list();
  }

  selectForCapability(capabilityId: string, _policy: GatewayPolicy): GatewayDefinition | undefined {
    const candidates = this.registry.listByCapability(capabilityId);
    if (candidates.length === 0) return undefined;
    return candidates[0];
  }

  updateHealth(health: GatewayHealth): void {
    this.health.set(health.gatewayId, health);
  }

  getHealth(gatewayId: GatewayId): GatewayHealth | undefined {
    return this.health.get(gatewayId);
  }

  recordMetrics(metrics: GatewayMetrics): void {
    this.metrics.set(metrics.gatewayId, metrics);
  }

  getMetrics(gatewayId: GatewayId): GatewayMetrics | undefined {
    return this.metrics.get(gatewayId);
  }

  async discover(): Promise<GatewayDefinition[]> {
    return this.registry.list();
  }
}
