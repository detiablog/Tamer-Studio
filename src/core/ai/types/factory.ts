import type {
  AIProvider,
  AIProviderConfig,
  CapabilityId,
  ProviderId,
  AIRequest,
} from "./domain";

export interface ProviderFactory {
  createProvider(id: ProviderId, config: AIProviderConfig): Promise<AIProvider>;
  disposeProvider(id: ProviderId): Promise<void>;
  isProviderCreated(id: ProviderId): boolean;
}

export interface ProviderRegistry {
  register(provider: AIProvider): void;
  unregister(id: ProviderId): void;
  get(id: ProviderId): AIProvider | undefined;
  getAll(): readonly AIProvider[];
  getByCapability(capability: CapabilityId): readonly AIProvider[];
  exists(id: ProviderId): boolean;
}

export interface ProviderSelector {
  select(
    request: AIRequest,
    availableProviders: readonly AIProvider[],
    policy?: unknown,
  ): AIProvider | undefined;
  getFallbackChain(capability: CapabilityId): readonly AIProvider[];
}
