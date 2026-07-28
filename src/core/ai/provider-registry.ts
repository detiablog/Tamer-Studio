import { OpenAIAdapter } from "./providers/openai-adapter";
import { AnthropicAdapter } from "./providers/anthropic-adapter";
import { GoogleAdapter } from "./providers/google-adapter";

export interface ProviderInput {
  prompt: string;
  model: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ProviderOutput {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration: number;
  model: string;
}

export interface AIProviderAdapter {
  name: string;
  execute(input: ProviderInput): Promise<ProviderOutput>;
  estimateCost(input: ProviderInput): number;
  getModels(): string[];
}

export interface AIProviderInfo {
  name: string;
  displayName: string;
  enabled: boolean;
  models: string[];
}

const adapters: Map<string, AIProviderAdapter> = new Map();

function ensureAdapters() {
  if (adapters.size === 0) {
    const openai = new OpenAIAdapter();
    const anthropic = new AnthropicAdapter();
    const google = new GoogleAdapter();

    adapters.set("openai", openai);
    adapters.set("anthropic", anthropic);
    adapters.set("google", google);
  }
}

export function getProviderAdapter(name: string): AIProviderAdapter {
  ensureAdapters();
  const adapter = adapters.get(name);
  if (!adapter) {
    throw new Error(`Unknown AI provider: ${name}`);
  }
  return adapter;
}

export function getAvailableProviders(): AIProviderInfo[] {
  ensureAdapters();
  return [
    {
      name: "openai",
      displayName: "OpenAI",
      enabled: !!process.env.OPENAI_API_KEY,
      models: adapters.get("openai")!.getModels(),
    },
    {
      name: "anthropic",
      displayName: "Anthropic",
      enabled: !!process.env.ANTHROPIC_API_KEY,
      models: adapters.get("anthropic")!.getModels(),
    },
    {
      name: "google",
      displayName: "Google AI",
      enabled: !!process.env.GOOGLE_AI_API_KEY,
      models: adapters.get("google")!.getModels(),
    },
  ];
}

export function getAllModels(): Array<{ provider: string; model: string }> {
  ensureAdapters();
  const models: Array<{ provider: string; model: string }> = [];
  for (const [name, adapter] of adapters) {
    for (const model of adapter.getModels()) {
      models.push({ provider: name, model });
    }
  }
  return models;
}

export function estimateCost(provider: string, model: string, prompt: string, maxTokens?: number): number {
  const adapter = getProviderAdapter(provider);
  return adapter.estimateCost({ prompt, model, maxTokens });
}
