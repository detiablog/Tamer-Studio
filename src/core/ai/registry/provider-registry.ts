import type { AIProvider } from "@/core/admin/providers/providers.types";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import { randomUUID } from "crypto";
import type { CapabilityCategory } from "@/lib/ai/types/capability";

export interface AIHealth {
  lastChecked: Date;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  errorMessage?: string;
}

export type ProviderType = AIProvider["providerType"];

export interface ProviderRegistry {
  register(provider: AIProvider): Promise<void>;
  unregister(providerId: string): Promise<void>;
  get(providerId: string): Promise<AIProvider | undefined>;
  getAll(): Promise<AIProvider[]>;
  getByCapability(capability: string): Promise<AIProvider[]>;
  exists(providerId: string): Promise<boolean>;
  updateHealth(providerId: string, health: AIHealth): Promise<void>;
  getHealthyProviders(capability?: string): Promise<AIProvider[]>;
}

export class DefaultProviderRegistry implements ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private readonly capabilityCategories: Map<string, CapabilityCategory>;

  constructor() {
    this.capabilityCategories = this.buildCapabilityCategoryLookup();
  }

  async register(input: AIProvider | (() => Promise<AIProvider>)): Promise<void> {
    const provider = typeof input === "function" ? await input() : input;

    this.validateProvider(provider);

    if (this.providers.has(provider.id)) {
      throw new Error(`Provider ${provider.id} is already registered`);
    }

    this.providers.set(provider.id, provider);

    await logAction("provider.created", undefined, "system", {
      providerId: provider.id,
      providerType: provider.providerType,
      capabilities: provider.capabilities,
    });

    logger.info("Provider registered", {
      providerId: provider.id,
      providerType: provider.providerType,
    });
  }

  async unregister(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    this.providers.delete(providerId);

    await logAction("provider.deleted", undefined, "system", {
      providerId,
      providerType: provider.providerType,
    });

    logger.info("Provider unregistered", {
      providerId,
      providerType: provider.providerType,
    });
  }

  async get(providerId: string): Promise<AIProvider | undefined> {
    return this.providers.get(providerId);
  }

  async getAll(): Promise<AIProvider[]> {
    return Array.from(this.providers.values());
  }

  async getByCapability(capability: string): Promise<AIProvider[]> {
    return Array.from(this.providers.values()).filter((provider) =>
      provider.capabilities.some((c) => {
        const matchesId = c === capability;
        const category = this.capabilityCategories.get(c);
        const matchesCategory = category === capability;
        return matchesId || matchesCategory;
      })
    );
  }

  async exists(providerId: string): Promise<boolean> {
    return this.providers.has(providerId);
  }

  async updateHealth(providerId: string, health: AIHealth): Promise<void> {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const updatedProvider: AIProvider = {
      ...provider,
      health,
      updatedAt: new Date(),
    };

    this.providers.set(providerId, updatedProvider);

    await logAction("provider.updated", undefined, "system", {
      providerId,
      healthStatus: health.status,
      latencyMs: health.latencyMs,
      errorMessage: health.errorMessage,
    });

    logger.info("Provider health updated", {
      providerId,
      healthStatus: health.status,
      latencyMs: health.latencyMs,
    });
  }

  async getHealthyProviders(capability?: string): Promise<AIProvider[]> {
    let providers = Array.from(this.providers.values()).filter(
      (provider) => provider.status === "active" && provider.health.status === "healthy"
    );

    if (capability) {
      providers = providers.filter((provider) =>
        provider.capabilities.some((c) => {
          const matchesId = c === capability;
          const category = this.capabilityCategories.get(c);
          const matchesCategory = category === capability;
          return matchesId || matchesCategory;
        })
      );
    }

    return providers;
  }

  private validateProvider(provider: AIProvider): void {
    if (!provider.id) {
      throw new Error("Provider id is required");
    }
    if (!provider.name) {
      throw new Error("Provider name is required");
    }
    if (!provider.providerType) {
      throw new Error("Provider providerType is required");
    }
  }

  private buildCapabilityCategoryLookup(): Map<string, CapabilityCategory> {
    const map = new Map<string, CapabilityCategory>();

    map.set("text-generation", "text");
    map.set("text-summarization", "text");
    map.set("translation", "text");
    map.set("text-to-speech", "speech");
    map.set("speech-to-text", "speech");
    map.set("image-generation", "image");
    map.set("image-analysis", "image");
    map.set("video-generation", "video");
    map.set("video-analysis", "video");
    map.set("audio-generation", "audio");
    map.set("audio-analysis", "audio");
    map.set("vision", "vision");
    map.set("embeddings", "embedding");
    map.set("automation", "automation");
    map.set("custom", "custom");

    return map;
  }
}

export const defaultProviderRegistry = new DefaultProviderRegistry();

export function createProviderId(): string {
  return `prov_${randomUUID()}`;
}
