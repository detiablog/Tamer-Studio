import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultHealthMonitor } from '@/core/ai/health/health-monitor';
import type { AIHealth } from '@/core/ai/registry/provider-registry';
import type { AIProvider } from '@/core/admin/providers/providers.types';

const createProvider = (overrides: Partial<AIProvider> = {}): AIProvider => ({
  id: 'prov-health-1',
  name: 'Test Provider',
  providerType: 'openai',
  status: 'active',
  priority: 1,
  enabled: true,
  apiKeyConfigured: true,
  capabilities: ['text-generation'],
  models: ['gpt-4o'],
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
    latencyMs: 50,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('DefaultHealthMonitor', () => {
  it('returns cached health when within TTL', async () => {
    const registry = {
      get: async () => createProvider(),
      updateHealth: async () => {},
    };
    const monitor = new DefaultHealthMonitor(registry as any);

    const health1 = await monitor.checkHealth('prov-health-1');
    const health2 = await monitor.checkHealth('prov-health-1');

    expect(health1.status).toBe('healthy');
    expect(health2.status).toBe('healthy');
  });

  it('throws when provider not found', async () => {
    const registry = { get: async () => undefined, updateHealth: async () => {} };
    const monitor = new DefaultHealthMonitor(registry as any);

    await expect(monitor.checkHealth('nonexistent')).rejects.toThrow('Provider nonexistent not found');
  });

  it('checkAllHealth returns map of all providers', async () => {
    const providers = [createProvider({ id: 'p1' }), createProvider({ id: 'p2' })];
    const registry = {
      getAll: async () => providers,
      get: async (id: string) => providers.find(p => p.id === id),
      updateHealth: async () => {},
    };
    const monitor = new DefaultHealthMonitor(registry as any);

    const result = await monitor.checkAllHealth();
    expect(result.size).toBe(2);
    expect(result.has('p1')).toBe(true);
    expect(result.has('p2')).toBe(true);
  });

  it('clearCache removes cached entry', async () => {
    const registry = {
      get: async () => createProvider(),
      updateHealth: async () => {},
    };
    const monitor = new DefaultHealthMonitor(registry as any);

    await monitor.checkHealth('prov-health-1');
    monitor.clearCache('prov-health-1');
    expect(monitor['cache'].has('prov-health-1')).toBe(false);
  });
});
