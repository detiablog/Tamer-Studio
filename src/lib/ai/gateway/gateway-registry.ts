import type { GatewayId, GatewayDefinition } from "../models";

export class GatewayRegistry {
  private gateways: Map<GatewayId, GatewayDefinition> = new Map();

  register(definition: GatewayDefinition): void {
    if (this.gateways.has(definition.id)) {
      throw new Error(`Gateway ${definition.id} is already registered`);
    }
    this.gateways.set(definition.id, definition);
  }

  registerMany(definitions: GatewayDefinition[]): void {
    for (const definition of definitions) {
      this.register(definition);
    }
  }

  resolve(gatewayId: GatewayId): GatewayDefinition | undefined {
    return this.gateways.get(gatewayId);
  }

  has(gatewayId: GatewayId): boolean {
    return this.gateways.has(gatewayId);
  }

  list(): GatewayDefinition[] {
    return Array.from(this.gateways.values());
  }

  listByCapability(capabilityId: string): GatewayDefinition[] {
    return this.list().filter((gateway) => gateway.supportedCapabilities.includes(capabilityId));
  }
}
