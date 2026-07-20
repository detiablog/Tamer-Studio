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

const sampleProviders: AIProvider[] = [
  {
    id: "provider-tamer-ai",
    name: "Tamer AI Engine",
    logo: "TA",
    category: "Large Language Models",
    description: "A premium text and reasoning model built for content workflows and team collaboration.",
    version: "v2.1",
    connectionStatus: "Connected" as ProviderStatus,
    apiEndpoint: "https://api.tamer.ai/v2",
    authType: "API Key",
    supportedModels: ["tamer-pro-1", "tamer-code-1"],
    supportedCapabilities: ["Text", "Embedding", "Automation"],
    defaultModel: "tamer-pro-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    favorite: true,
  },
  {
    id: "provider-visionflux",
    name: "VisionFlux",
    logo: "VF",
    category: "Vision Models",
    description: "Fast visual reasoning and image generation models for modern creative workflows.",
    version: "v1.4",
    connectionStatus: "Connected" as ProviderStatus,
    apiEndpoint: "https://visionflux.ai/api",
    authType: "Token",
    supportedModels: ["visionflux-v1"],
    supportedCapabilities: ["Image", "Vision"],
    defaultModel: "visionflux-v1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "provider-wavesynth",
    name: "WaveSynth",
    logo: "WS",
    category: "Audio Generation",
    description: "Audio synthesis and speech models designed for podcasts, ads, and storytelling.",
    version: "v0.8",
    connectionStatus: "Disconnected" as ProviderStatus,
    apiEndpoint: "https://wavesynth.ai/v1",
    authType: "OAuth",
    supportedModels: ["wavesynth-sound-1"],
    supportedCapabilities: ["Audio", "Speech"],
    defaultModel: "wavesynth-sound-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

const sampleMarketplace: AIProvider[] = [
  {
    id: "provider-novatext",
    name: "NovaText",
    logo: "NT",
    category: "Large Language Models",
    description: "A scalable LLM designed for high-throughput content pipelines and long-context reasoning.",
    version: "v1.0",
    connectionStatus: "Disconnected" as ProviderStatus,
    apiEndpoint: "https://api.novatext.com/v1",
    authType: "API Key",
    supportedModels: ["nova-text-2"],
    supportedCapabilities: ["Text", "Embedding"],
    defaultModel: "nova-text-2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "provider-pixelforge",
    name: "PixelForge",
    logo: "PF",
    category: "Image Generation",
    description: "A modern image provider for creative visual concepts, moodboards and asset generation.",
    version: "v2.0",
    connectionStatus: "Disconnected" as ProviderStatus,
    apiEndpoint: "https://api.pixelforge.ai/v1",
    authType: "API Key",
    supportedModels: ["pf-image-1"],
    supportedCapabilities: ["Image", "Vision"],
    defaultModel: "pf-image-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleModels: AIModel[] = [
  {
    id: "model-tamer-pro-1",
    providerId: "provider-tamer-ai",
    name: "tamer-pro-1",
    displayName: "Tamer Pro 1",
    category: "Large Language Models",
    contextLength: "16k",
    inputTypes: ["text", "code"],
    outputTypes: ["text"],
    maxTokens: 16000,
    supportsStreaming: true,
    supportsVision: false,
    supportsTools: true,
    status: "Available",
  },
  {
    id: "model-visionflux-v1",
    providerId: "provider-visionflux",
    name: "visionflux-v1",
    displayName: "VisionFlux V1",
    category: "Vision Models",
    contextLength: "8k",
    inputTypes: ["image", "text"],
    outputTypes: ["image", "text"],
    maxTokens: 8000,
    supportsStreaming: false,
    supportsVision: true,
    supportsTools: false,
    status: "Available",
  },
  {
    id: "model-wavesynth-sound-1",
    providerId: "provider-wavesynth",
    name: "wavesynth-sound-1",
    displayName: "WaveSynth Sound 1",
    category: "Audio Generation",
    contextLength: "4k",
    inputTypes: ["audio", "text"],
    outputTypes: ["audio"],
    maxTokens: 4000,
    supportsStreaming: true,
    supportsVision: false,
    supportsTools: false,
    status: "Preview",
  },
];

const sampleTemplates: PromptTemplate[] = [
  {
    id: "template-launch-brief",
    name: "Launch Brief",
    category: "Copywriting",
    description: "Generate a polished launch brief for campaigns, product launches, and announcements.",
    providerId: "provider-tamer-ai",
    content: "Write a launch brief for {{product}} targeting {{audience}}, including goals, timeline, and messaging.",
    favorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "template-image-concept",
    name: "Image Concept",
    category: "Creative",
    description: "Create a detailed prompt for image generation based on brand tone, scene, and visual style.",
    providerId: "provider-visionflux",
    content: "Generate an image of {{subject}} in a {{style}} style with high contrast lighting.",
    favorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "template-podcast-script",
    name: "Podcast Script",
    category: "Audio",
    description: "Draft a podcast episode script with segments, transitions, and key talking points.",
    providerId: "provider-wavesynth",
    content: "Write a podcast episode script about {{topic}} with an intro, key points, and outro.",
    favorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

const sampleUsage: AIUsageSummary = {
  requests: 1284,
  tokens: 92500,
  estimatedCost: 215.5,
  activeProviders: sampleProviders.length,
  mostUsedProvider: "Tamer AI Engine",
  dailyRequests: [120, 140, 130, 150, 125, 135, 110],
  monthlyCost: [18, 22, 20, 25, 21, 24, 19, 23, 26, 20, 22, 25],
  providerDistribution: {
    "Tamer AI Engine": 52,
    VisionFlux: 28,
    WaveSynth: 20,
  },
};

function readState(): { providers: AIProvider[]; marketplace: AIProvider[]; models: AIModel[]; templates: PromptTemplate[]; usage: AIUsageSummary } {
  if (typeof window === "undefined") {
    return { providers: sampleProviders, marketplace: sampleMarketplace, models: sampleModels, templates: sampleTemplates, usage: sampleUsage };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { providers: sampleProviders, marketplace: sampleMarketplace, models: sampleModels, templates: sampleTemplates, usage: sampleUsage };
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read AI platform state", error);
    return { providers: sampleProviders, marketplace: sampleMarketplace, models: sampleModels, templates: sampleTemplates, usage: sampleUsage };
  }
}

function writeState(state: { providers: AIProvider[]; marketplace: AIProvider[]; models: AIModel[]; templates: PromptTemplate[]; usage: AIUsageSummary }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to write AI platform state", error);
  }
}

function seedState() {
  const state = readState();
  if (state.providers.length || state.marketplace.length) return state;
  const initialState = {
    providers: sampleProviders,
    marketplace: sampleMarketplace,
    models: sampleModels,
    templates: sampleTemplates,
    usage: sampleUsage,
  };
  if (typeof window !== "undefined") {
    writeState(initialState);
  }
  return initialState;
}

export const aiPlatformStore = {
  getProviders() {
    return seedState().providers;
  },

  getProvider(id: string) {
    return seedState().providers.find((provider) => provider.id === id) ?? null;
  },

  getModels() {
    return seedState().models;
  },

  getModelsByProvider(providerId: string) {
    return seedState().models.filter((model) => model.providerId === providerId);
  },

  getTemplates() {
    return seedState().templates;
  },

  getTemplate(id: string) {
    return seedState().templates.find((template) => template.id === id) ?? null;
  },

  getUsageSummary() {
    return seedState().usage;
  },

  getMarketplaceProviders() {
    return seedState().marketplace;
  },

  installProvider(providerId: string) {
    const state = seedState();
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
    const state = seedState();
    const provider = state.providers.find((item) => item.id === providerId);
    if (!provider) return null;
    const nextStatus: ProviderStatus = provider.connectionStatus === "Connected" ? "Disconnected" : "Connected";
    provider.connectionStatus = nextStatus;
    provider.updatedAt = new Date().toISOString();
    writeState(state);
    return provider;
  },

  updateProvider(id: string, patch: Partial<AIProvider>) {
    const state = seedState();
    const provider = state.providers.find((item) => item.id === id);
    if (!provider) return null;
    Object.assign(provider, patch, { updatedAt: new Date().toISOString() });
    writeState(state);
    return provider;
  },

  toggleTemplateFavorite(templateId: string) {
    const state = seedState();
    const template = state.templates.find((item) => item.id === templateId);
    if (!template) return null;
    template.favorite = !template.favorite;
    template.updatedAt = new Date().toISOString();
    writeState(state);
    return template;
  },

  duplicateTemplate(templateId: string) {
    const state = seedState();
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
