import type { AIModel, CapabilityCategory } from "../types/domain";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";
import { randomUUID } from "crypto";

export interface ModelRegistry {
  register(model: AIModel): Promise<void>;
  unregister(modelId: string): Promise<void>;
  get(modelId: string): AIModel | undefined;
  getAll(): AIModel[];
  getByProvider(providerId: string): AIModel[];
  getByCategory(category: CapabilityCategory): AIModel[];
  getByCapability(capability: string): AIModel[];
  search(query: string): AIModel[];
  exists(modelId: string): boolean;
  update(modelId: string, patch: Partial<AIModel>): Promise<void>;
  resolveModel(modelId: string, providerId?: string): ResolvedModel | undefined;
  getRecommendedModel(capability: string, requirements?: ModelRequirements): AIModel | undefined;
}

export interface ModelRequirements {
  minContextLength?: number;
  maxCostPerToken?: number;
  supportsStreaming?: boolean;
  supportsVision?: boolean;
  supportsTools?: boolean;
  preferredProviderId?: string;
}

export interface ResolvedModel {
  model: AIModel;
  providerId: string;
  providerType: string;
  estimatedCostPerToken: number;
  capabilityMatch: boolean;
}

export class DefaultModelRegistry implements ModelRegistry {
  private models: Map<string, AIModel> = new Map();

  async register(model: AIModel): Promise<void> {
    this.validateModel(model);

    if (this.models.has(model.id)) {
      throw new Error(`Model ${model.id} is already registered`);
    }

    this.models.set(model.id, model);

    await logAction("provider.created" as never, undefined, "system", {
      modelId: model.id,
      providerId: model.providerId,
      name: model.name,
      category: model.category,
    });

    logger.info("Model registered", {
      modelId: model.id,
      providerId: model.providerId,
      name: model.name,
    });
  }

  async unregister(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    this.models.delete(modelId);

    await logAction("provider.deleted" as never, undefined, "system", {
      modelId,
      providerId: model.providerId,
    });

    logger.info("Model unregistered", { modelId });
  }

  get(modelId: string): AIModel | undefined {
    return this.models.get(modelId);
  }

  getAll(): AIModel[] {
    return Array.from(this.models.values());
  }

  getByProvider(providerId: string): AIModel[] {
    return this.getAll().filter((m) => m.providerId === providerId);
  }

  getByCategory(category: CapabilityCategory): AIModel[] {
    return this.getAll().filter((m) => m.category === category);
  }

  getByCapability(capability: string): AIModel[] {
    const lowerCap = capability.toLowerCase();
    return this.getAll().filter((m) => {
      const matchesCategory = m.category.toLowerCase() === lowerCap;
      const matchesInput = m.inputTypes.some((t) => t.toLowerCase().includes(lowerCap));
      const matchesOutput = m.outputTypes.some((t) => t.toLowerCase().includes(lowerCap));
      return matchesCategory || matchesInput || matchesOutput;
    });
  }

  search(query: string): AIModel[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.displayName.toLowerCase().includes(lowerQuery) ||
        m.category.toLowerCase().includes(lowerQuery) ||
        m.id.toLowerCase().includes(lowerQuery)
    );
  }

  exists(modelId: string): boolean {
    return this.models.has(modelId);
  }

  async update(modelId: string, patch: Partial<AIModel>): Promise<void> {
    const existing = this.models.get(modelId);
    if (!existing) {
      throw new Error(`Model ${modelId} not found`);
    }

    const updated: AIModel = { ...existing, ...patch, id: existing.id };
    this.models.set(modelId, updated);

    await logAction("provider.updated" as never, undefined, "system", {
      modelId,
      changes: Object.keys(patch),
    });
  }

  resolveModel(modelId: string, providerId?: string): ResolvedModel | undefined {
    let model = this.models.get(modelId);

    if (!model && providerId) {
      model = this.getAll().find(
        (m) => m.name === modelId && m.providerId === providerId
      );
    }

    if (!model) {
      model = this.getAll().find((m) => m.name === modelId);
    }

    if (!model) return undefined;

    return {
      model,
      providerId: model.providerId,
      providerType: this.guessProviderType(model.providerId),
      estimatedCostPerToken: this.estimateCostPerToken(model),
      capabilityMatch: true,
    };
  }

  getRecommendedModel(capability: string, requirements?: ModelRequirements): AIModel | undefined {
    let candidates = this.getByCapability(capability);

    if (requirements?.minContextLength) {
      candidates = candidates.filter((m) => {
        const length = this.parseContextLength(m.contextLength);
        return length >= requirements.minContextLength!;
      });
    }

    if (requirements?.supportsStreaming !== undefined) {
      candidates = candidates.filter((m) => m.supportsStreaming === requirements.supportsStreaming);
    }

    if (requirements?.supportsVision !== undefined) {
      candidates = candidates.filter((m) => m.supportsVision === requirements.supportsVision);
    }

    if (requirements?.supportsTools !== undefined) {
      candidates = candidates.filter((m) => m.supportsTools === requirements.supportsTools);
    }

    if (requirements?.preferredProviderId) {
      const preferred = candidates.filter((m) => m.providerId === requirements.preferredProviderId);
      if (preferred.length > 0) candidates = preferred;
    }

    return candidates[0];
  }

  private validateModel(model: AIModel): void {
    if (!model.id) throw new Error("Model id is required");
    if (!model.name) throw new Error("Model name is required");
    if (!model.providerId) throw new Error("Model providerId is required");
    if (!model.category) throw new Error("Model category is required");
  }

  private guessProviderType(providerId: string): string {
    const lower = providerId.toLowerCase();
    if (lower.includes("openai")) return "openai";
    if (lower.includes("google") || lower.includes("gemini")) return "google";
    if (lower.includes("openrouter")) return "openrouter";
    if (lower.includes("kilo")) return "kilo";
    if (lower.includes("anthropic")) return "anthropic";
    return "unknown";
  }

  private estimateCostPerToken(model: AIModel): number {
    if (model.pricing && typeof model.pricing === "object") {
      const pricing = model.pricing as Record<string, unknown>;
      if (typeof pricing.inputPricePerToken === "number") {
        return pricing.inputPricePerToken;
      }
    }
    return 0.001;
  }

  private parseContextLength(contextLength: number | string | undefined): number {
    if (contextLength === undefined || contextLength === null) return 0;
    if (typeof contextLength === "number") return contextLength;
    const match = contextLength.match(/(\d+)/);
    if (!match) return 0;
    const num = parseInt(match[1], 10);
    if (contextLength.toLowerCase().includes("k")) return num * 1000;
    if (contextLength.toLowerCase().includes("m")) return num * 1_000_000;
    return num;
  }
}

export const defaultModelRegistry = new DefaultModelRegistry();

export function createModelId(): string {
  return `model_${randomUUID()}`;
}
