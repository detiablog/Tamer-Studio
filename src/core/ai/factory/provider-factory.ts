import type { AIProvider } from "@/core/admin/providers/providers.types";
import type { AIProviderConfig } from "../types";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";

export interface ProviderFactory {
  createProvider(id: string, config: AIProviderConfig): Promise<AIProvider>;
  disposeProvider(id: string): Promise<void>;
  isProviderCreated(id: string): boolean;
  getCreatedProviders(): string[];
}

export class DefaultProviderFactory implements ProviderFactory {
  private readonly createdProviders: Set<string> = new Set();

  async createProvider(id: string, config: AIProviderConfig): Promise<AIProvider> {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new Error("apiKey is required");
    }

    if (config.providerType !== "custom" && (!config.baseUrl || config.baseUrl.trim().length === 0)) {
      throw new Error("baseUrl is required for non-custom provider types");
    }

    const now = new Date();
    const provider: AIProvider = {
      id: crypto.randomUUID(),
      name: config.name ?? `${config.providerType}-provider`,
      providerType: config.providerType,
      status: "active",
      priority: 0,
      enabled: true,
      apiKeyConfigured: true,
      capabilities: [],
      models: [],
      rateLimit: {
        requestsPerMinute: 0,
        tokensPerMinute: 0,
      },
      costConfiguration: {
        currency: "USD",
        inputPricePerToken: 0,
        outputPricePerToken: 0,
        imagePricePerUnit: 0,
        videoPricePerSecond: 0,
        audioPricePerSecond: 0,
      },
      health: {
        lastChecked: now,
        status: "healthy",
        latencyMs: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    this.createdProviders.add(provider.id);
    logger.info("Provider created via factory", { providerId: provider.id, providerType: config.providerType, name: provider.name });
    await logAction("provider.factory.created", undefined, undefined, { providerId: provider.id, providerType: config.providerType, name: provider.name });

    return provider;
  }

  async disposeProvider(id: string): Promise<void> {
    if (this.createdProviders.has(id)) {
      this.createdProviders.delete(id);
      logger.info("Provider disposed via factory", { providerId: id });
      await logAction("provider.factory.disposed", undefined, undefined, { providerId: id });
    }
  }

  isProviderCreated(id: string): boolean {
    return this.createdProviders.has(id);
  }

  getCreatedProviders(): string[] {
    return Array.from(this.createdProviders);
  }
}
