import type { ProviderRegistry } from "../registry/provider-registry";
import type { AIHealth } from "../registry/provider-registry";

export interface HealthMonitor {
  checkHealth(providerId: string): Promise<AIHealth>;
  updateHealth(providerId: string, health: AIHealth): Promise<void>;
}

export class DefaultHealthMonitor implements HealthMonitor {
  constructor(private providerRegistry: ProviderRegistry) {}

  async checkHealth(providerId: string): Promise<AIHealth> {
    const provider = await this.providerRegistry.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }
    return provider.health;
  }

  async updateHealth(providerId: string, health: AIHealth): Promise<void> {
    await this.providerRegistry.updateHealth(providerId, health);
  }
}
