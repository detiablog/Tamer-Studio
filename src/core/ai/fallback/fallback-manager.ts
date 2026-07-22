export interface FallbackManager {
  getFallbackChain(providerId: string, chain: string[]): string[];
  selectFallback(excludeProviderId: string, available: string[]): string | undefined;
}

export class DefaultFallbackManager implements FallbackManager {
  getFallbackChain(providerId: string, chain: string[]): string[] {
    return chain.filter((id) => id !== providerId);
  }

  selectFallback(excludeProviderId: string, available: string[]): string | undefined {
    return available.find((id) => id !== excludeProviderId);
  }
}
