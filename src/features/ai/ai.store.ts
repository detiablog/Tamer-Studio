import { logger } from "@/core/logger";

export type ProviderCategory =
  | "Large Language Models"
  | "Image Generation"
  | "Video Generation"
  | "Audio Generation"
  | "Speech-to-Text"
  | "Text-to-Speech"
  | "Embeddings"
  | "Vision Models"
  | "Workflow Automation"
  | "Custom Provider";

export type ProviderStatus = "Connected" | "Disconnected" | "Error" | "Upgrading";
export type ProviderAuthType = "API Key" | "OAuth" | "Token" | "Custom";
export type ProviderCapability =
  | "Text"
  | "Image"
  | "Video"
  | "Audio"
  | "Vision"
  | "Embedding"
  | "Automation"
  | "Speech";

export type AIProvider = {
  id: string;
  name: string;
  logo: string;
  category: ProviderCategory;
  description: string;
  version: string;
  connectionStatus: ProviderStatus;
  apiEndpoint: string;
  authType: ProviderAuthType;
  supportedModels: string[];
  supportedCapabilities: ProviderCapability[];
  defaultModel: string;
  createdAt: string;
  updatedAt: string;
  favorite?: boolean;
};

export type AIModel = {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  category: string;
  contextLength: string;
  inputTypes: string[];
  outputTypes: string[];
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsTools: boolean;
  status: "Available" | "Preview" | "Deprecated";
};

export type PromptTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  providerId: string;
  content: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AIUsageSummary = {
  requests: number;
  tokens: number;
  estimatedCost: number;
  activeProviders: number;
  mostUsedProvider: string;
  dailyRequests: number[];
  monthlyCost: number[];
  providerDistribution: { [providerName: string]: number };
};

const STORAGE_KEY = "tamer:ai-platform-state";

function readState(): { providers: AIProvider[]; marketplace: AIProvider[]; models: AIModel[]; templates: PromptTemplate[]; usage: AIUsageSummary } {
  if (typeof window === "undefined") {
    return { providers: [], marketplace: [], models: [], templates: [], usage: { requests: 0, tokens: 0, estimatedCost: 0, activeProviders: 0, mostUsedProvider: "", dailyRequests: [], monthlyCost: [], providerDistribution: {} } };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { providers: [], marketplace: [], models: [], templates: [], usage: { requests: 0, tokens: 0, estimatedCost: 0, activeProviders: 0, mostUsedProvider: "", dailyRequests: [], monthlyCost: [], providerDistribution: {} } };
    return JSON.parse(raw);
  } catch (error) {
    logger.error("Failed to read AI platform state", error as Error);
    return { providers: [], marketplace: [], models: [], templates: [], usage: { requests: 0, tokens: 0, estimatedCost: 0, activeProviders: 0, mostUsedProvider: "", dailyRequests: [], monthlyCost: [], providerDistribution: {} } };
  }
}

function writeState(state: { providers: AIProvider[]; marketplace: AIProvider[]; models: AIModel[]; templates: PromptTemplate[]; usage: AIUsageSummary }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logger.error("Failed to write AI platform state", error as Error);
  }
}

export const aiPlatformStore = {
  getProviders() {
    return readState().providers;
  },

  getProvider(id: string) {
    return readState().providers.find((provider) => provider.id === id) ?? null;
  },

  getModels() {
    return readState().models;
  },

  getModelsByProvider(providerId: string) {
    return readState().models.filter((model) => model.providerId === providerId);
  },

  getTemplates() {
    return readState().templates;
  },

  getTemplate(id: string) {
    return readState().templates.find((template) => template.id === id) ?? null;
  },

  getUsageSummary() {
    return readState().usage;
  },

  getMarketplaceProviders() {
    return readState().marketplace;
  },

  installProvider(providerId: string) {
    const state = readState();
    const provider = state.marketplace.find((item) => item.id === providerId);
    if (!provider) return null;
    const updatedMarketplace = state.marketplace.filter((item) => item.id !== providerId);
    const installedProvider: AIProvider = {
      ...provider,
      connectionStatus: "Disconnected" as ProviderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedProviders: AIProvider[] = [installedProvider, ...state.providers];
    const nextState = { ...state, providers: updatedProviders, marketplace: updatedMarketplace };
    writeState(nextState);
    return provider;
  },

  toggleProviderStatus(providerId: string) {
    const state = readState();
    const provider = state.providers.find((item) => item.id === providerId);
    if (!provider) return null;
    const nextStatus: ProviderStatus = provider.connectionStatus === "Connected" ? "Disconnected" : "Connected";
    provider.connectionStatus = nextStatus;
    provider.updatedAt = new Date().toISOString();
    writeState(state);
    return provider;
  },

  updateProvider(id: string, patch: Partial<AIProvider>) {
    const state = readState();
    const provider = state.providers.find((item) => item.id === id);
    if (!provider) return null;
    Object.assign(provider, patch, { updatedAt: new Date().toISOString() });
    writeState(state);
    return provider;
  },

  toggleTemplateFavorite(templateId: string) {
    const state = readState();
    const template = state.templates.find((item) => item.id === templateId);
    if (!template) return null;
    template.favorite = !template.favorite;
    template.updatedAt = new Date().toISOString();
    writeState(state);
    return template;
  },

  duplicateTemplate(templateId: string) {
    const state = readState();
    const template = state.templates.find((item) => item.id === templateId);
    if (!template) return null;
    const copy: PromptTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.templates.unshift(copy);
    writeState(state);
    return copy;
  },
};
