import { describe, it, expect } from 'vitest';
import { DefaultProviderSelector } from '@/core/ai/selector/provider-selector';
import type { AIProvider } from '@/core/admin/providers/providers.types';
import type { AIRequest } from '@/core/ai/types/domain';

function createProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  const baseCapabilities: string[] = ['text-generation'];
  const baseModels: string[] = ['gpt-4'];
  const providerId = overrides.id || 'prov-1';

  const base: AIProvider = {
    id: providerId,
    name: 'Test Provider',
    providerType: 'openai',
    status: 'active',
    priority: 1,
    enabled: true,
    apiKeyConfigured: true,
    capabilities: baseCapabilities,
    models: baseModels,
    rateLimit: { requestsPerMinute: 100, tokensPerMinute: 10000 },
    costConfiguration: {
      currency: 'USD',
      inputPricePerToken: 0.001,
      outputPricePerToken: 0.002,
      imagePricePerUnit: 0,
      videoPricePerSecond: 0,
      audioPricePerSecond: 0,
    },
    health: {
      lastChecked: new Date(),
      status: 'healthy',
      latencyMs: 100,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { ...base, ...overrides, capabilities: overrides.capabilities ?? base.capabilities };
}

describe('DefaultProviderSelector', () => {
  const createRequest = (capability: string): AIRequest => ({
    id: 'req-1',
    capability,
    payload: {},
    context: {
      executionId: 'exec-1',
      requestId: 'req-1',
      startedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    },
  });

  it('select() returns provider ID when capability matches', async () => {
    const registry = {
      getByCapability: async (_capability: string) => [createProvider({ id: 'prov-1' })],
    };
    const selector = new DefaultProviderSelector(registry as any);
    const result = await selector.select(createRequest('text-generation'));
    expect(result).toBe('prov-1');
  });

  it('select() returns undefined when no providers match capability', async () => {
    const registry = {
      getByCapability: async () => [],
    };
    const selector = new DefaultProviderSelector(registry as any);
    const result = await selector.select(createRequest('text-generation'));
    expect(result).toBeUndefined();
  });

  it('select() filters excluded providers', async () => {
    const provider1 = createProvider({ id: 'prov-1' });
    const provider2 = createProvider({ id: 'prov-2' });
    const registry = {
      getByCapability: async () => [provider1, provider2],
    };
    const selector = new DefaultProviderSelector(registry as any);
    const result = await selector.select(createRequest('text-generation'), {
      capability: 'text-generation',
      excludedProviders: ['prov-1'],
    });
    expect(result).toBe('prov-2');
  });

  it('rankProviders() returns providers sorted by score', () => {
    const provider1 = createProvider({
      id: 'prov-1',
      health: { lastChecked: new Date(), status: 'healthy' as const, latencyMs: 100 },
    });
    const provider2 = createProvider({
      id: 'prov-2',
      health: { lastChecked: new Date(), status: 'degraded' as const, latencyMs: 500 },
    });
    const registry = { getByCapability: async () => [] };
    const selector = new DefaultProviderSelector(registry as any);
    const request = createRequest('text-generation');
    const ranked = selector.rankProviders(request, [provider1, provider2]);
    expect(ranked[0].providerId).toBe('prov-1');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
