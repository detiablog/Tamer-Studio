import { logger } from "@/core/logger";
import type { AIProviderAdapter} from "./adapter";
import { BaseProviderAdapter } from "./adapter";
import { OpenAiAdapter } from "./openai-adapter";
import { GeminiAdapter } from "./gemini-adapter";
import { OpenRouterAdapter } from "./openrouter-adapter";
import { KiloAdapter } from "./kilo-adapter";

export interface AdapterFactory {
  getAdapter(providerType: string): AIProviderAdapter | undefined;
  registerAdapter(type: string, adapterClass: new () => BaseProviderAdapter): void;
  getAvailableAdapters(): string[];
}

export class DefaultAdapterFactory implements AdapterFactory {
  private registry: Map<string, BaseProviderAdapter> = new Map();

  constructor() {
    this.registerDefaults();
  }

  getAdapter(providerType: string): AIProviderAdapter | undefined {
    return this.registry.get(providerType);
  }

  registerAdapter(type: string, adapterClass: new () => BaseProviderAdapter): void {
    const instance = new adapterClass();
    if (!(instance instanceof BaseProviderAdapter)) {
      throw new Error(`Adapter class must extend BaseProviderAdapter`);
    }
    if (instance.providerType !== type) {
      logger.warn("Provider type mismatch during registration", {
        registeredType: type,
        adapterType: instance.providerType,
      });
    }
    this.registry.set(type, instance);
  }

  getAvailableAdapters(): string[] {
    return Array.from(this.registry.keys());
  }

  private registerDefaults(): void {
    this.registerAdapter("openai", OpenAiAdapter);
    this.registerAdapter("google", GeminiAdapter);
    this.registerAdapter("openrouter", OpenRouterAdapter);
    this.registerAdapter("kilo", KiloAdapter);
  }
}

let defaultFactory: DefaultAdapterFactory | null = null;

export function getDefaultFactory(): DefaultAdapterFactory {
  if (!defaultFactory) {
    defaultFactory = new DefaultAdapterFactory();
  }
  return defaultFactory;
}

export function resetDefaultFactory(): void {
  defaultFactory = null;
}
