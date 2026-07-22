import type { ProviderRegistry } from "../registry/provider-registry";
import type { AdapterFactory } from "../providers/factory";
import type { AIHealth } from "../registry/provider-registry";

export interface HealthMonitor {
  checkHealth(providerId: string): Promise<AIHealth>;
  checkAllHealth(): Promise<Map<string, AIHealth>>;
  updateHealth(providerId: string, health: AIHealth): Promise<void>;
}

export class DefaultHealthMonitor implements HealthMonitor {
  private readonly cache = new Map<string, { health: AIHealth; cachedAt: number }>();
  private readonly cacheTtlMs = 30_000;

  constructor(
    private providerRegistry: ProviderRegistry,
    private adapterFactory?: AdapterFactory
  ) {}

  async checkHealth(providerId: string): Promise<AIHealth> {
    const cached = this.cache.get(providerId);
    if (cached && Date.now() - cached.cachedAt < this.cacheTtlMs) {
      return cached.health;
    }

    const provider = await this.providerRegistry.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    let health: AIHealth;
    if (this.adapterFactory && provider.providerType) {
      const adapter = this.adapterFactory.getAdapter(provider.providerType);
      if (adapter) {
        try {
          const adapterHealth = await adapter.healthCheck();
          health = this.normalizeHealth(providerId, adapterHealth);
        } catch (error) {
          health = {
            lastChecked: new Date(),
            status: "unhealthy",
            latencyMs: -1,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          };
        }
      } else {
        health = provider.health;
      }
    } else {
      health = provider.health;
    }

    this.cache.set(providerId, { health, cachedAt: Date.now() });
    await this.providerRegistry.updateHealth(providerId, health);
    return health;
  }

  async checkAllHealth(): Promise<Map<string, AIHealth>> {
    const providers = await this.providerRegistry.getAll();
    const results = new Map<string, AIHealth>();
    for (const provider of providers) {
      const health = await this.checkHealth(provider.id);
      results.set(provider.id, health);
    }
    return results;
  }

  async updateHealth(providerId: string, health: AIHealth): Promise<void> {
    await this.providerRegistry.updateHealth(providerId, health);
    this.cache.set(providerId, { health, cachedAt: Date.now() });
  }

  clearCache(providerId?: string): void {
    if (providerId) {
      this.cache.delete(providerId);
    } else {
      this.cache.clear();
    }
  }

  private normalizeHealth(providerId: string, raw: { status: string; latencyMs: number; availability?: number }): AIHealth {
    const status = raw.status === "degraded" ? "degraded" : raw.status === "healthy" ? "healthy" : "unhealthy";
    return {
      lastChecked: new Date(),
      status: status as AIHealth["status"],
      latencyMs: raw.latencyMs,
      errorMessage: status === "unhealthy" ? "Provider health check failed" : undefined,
    };
  }
}
