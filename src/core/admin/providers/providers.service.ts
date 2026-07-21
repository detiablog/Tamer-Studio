import type { AIProvider, ProviderModelAvailability, ProviderHealthCheck, ProviderConfigurationInput } from "./providers.types";
import { logAdminAction } from "@/core/audit";
import { logger } from "@/core/logger";

const registeredProviders: Map<string, AIProvider> = new Map();

export class ProvidersService {
  async registerProvider(input: ProviderConfigurationInput, adminId: string): Promise<AIProvider> {
    const now = new Date();
    const provider: AIProvider = {
      id: `provider_${Date.now()}`,
      name: input.name,
      providerType: input.providerType,
      status: "active",
      priority: input.priority ?? 0,
      enabled: input.enabled ?? true,
      apiKeyConfigured: !!input.apiKey,
      capabilities: input.capabilities,
      models: input.models,
      rateLimit: input.rateLimit,
      costConfiguration: input.costConfiguration,
      health: {
        lastChecked: now,
        status: "healthy",
        latencyMs: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    registeredProviders.set(provider.id, provider);
    logAdminAction("provider.created", adminId, { providerId: provider.id, name: input.name });
    logger.info("Provider registered", { providerId: provider.id, name: input.name });
    return provider;
  }

  async updateProvider(providerId: string, data: Partial<AIProvider>, adminId: string): Promise<AIProvider | undefined> {
    const existing = registeredProviders.get(providerId);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    registeredProviders.set(providerId, updated);
    logAdminAction("provider.updated", adminId, { providerId, changes: data });
    logger.info("Provider updated", { providerId });
    return updated;
  }

  async disableProvider(providerId: string, adminId: string): Promise<void> {
    const provider = registeredProviders.get(providerId);
    if (!provider) return;
    provider.status = "inactive";
    provider.enabled = false;
    provider.updatedAt = new Date();
    registeredProviders.set(providerId, provider);
    logAdminAction("provider.disabled", adminId, { providerId });
    logger.info("Provider disabled", { providerId, adminId });
  }

  async enableProvider(providerId: string, adminId: string): Promise<void> {
    const provider = registeredProviders.get(providerId);
    if (!provider) return;
    provider.status = "active";
    provider.enabled = true;
    provider.updatedAt = new Date();
    registeredProviders.set(providerId, provider);
    logAdminAction("provider.enabled", adminId, { providerId });
    logger.info("Provider enabled", { providerId, adminId });
  }

  async deleteProvider(providerId: string, adminId: string): Promise<void> {
    registeredProviders.delete(providerId);
    logAdminAction("provider.deleted", adminId, { providerId });
    logger.info("Provider deleted", { providerId, adminId });
  }

  async getProvider(providerId: string): Promise<AIProvider | undefined> {
    return registeredProviders.get(providerId);
  }

  async listProviders(): Promise<AIProvider[]> {
    return Array.from(registeredProviders.values());
  }

  async setProviderPriority(providerId: string, priority: number, adminId: string): Promise<void> {
    const provider = registeredProviders.get(providerId);
    if (!provider) return;
    provider.priority = priority;
    provider.updatedAt = new Date();
    registeredProviders.set(providerId, provider);
    logAdminAction("provider.priority.updated", adminId, { providerId, priority });
  }

  async setProviderHealth(providerId: string, health: ProviderHealthCheck): Promise<void> {
    const provider = registeredProviders.get(providerId);
    if (!provider) return;
    provider.health = {
      lastChecked: health.checkedAt,
      status: health.status,
      latencyMs: health.latencyMs,
      errorMessage: health.errorMessage,
    };
    provider.status = health.status === "healthy" ? "active" : "error";
    provider.updatedAt = new Date();
    registeredProviders.set(providerId, provider);
  }

  async updateCostConfiguration(providerId: string, costConfig: AIProvider["costConfiguration"], adminId: string): Promise<void> {
    const provider = registeredProviders.get(providerId);
    if (!provider) return;
    provider.costConfiguration = costConfig;
    provider.updatedAt = new Date();
    registeredProviders.set(providerId, provider);
    logAdminAction("provider.cost.updated", adminId, { providerId });
  }

  async getModelAvailability(providerId: string): Promise<ProviderModelAvailability[]> {
    const provider = registeredProviders.get(providerId);
    if (!provider) return [];
    return provider.models.map((modelId) => ({
      providerId,
      modelId,
      capability: "text",
      available: true,
      deprecated: false,
    }));
  }
}
