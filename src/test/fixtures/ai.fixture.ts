import type { AIRequest, AIResponse, AIHealth, AIExecutionContext } from '@/core/ai/types/domain';
import type { AIProvider } from '@/core/admin/providers/providers.types';

export function mockAIRequest(overrides: Partial<AIRequest> = {}): AIRequest {
  const context: AIExecutionContext = {
    executionId: 'exec-001',
    requestId: 'req-001',
    startedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  };

  return {
    id: 'req-001',
    capability: 'text-generation',
    model: 'gpt-4',
    payload: { prompt: 'Hello' },
    context,
    timeoutMs: 30000,
    ...overrides,
  };
}

export function mockAIResponse(overrides: Partial<AIResponse> = {}): AIResponse {
  return {
    id: 'resp-001',
    requestId: 'req-001',
    status: 'success',
    result: { content: 'mock response' },
    usage: {
      estimatedCost: 0.001,
      currency: 'USD',
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
    completedAt: new Date('2026-01-01T00:00:01.000Z').toISOString(),
    durationMs: 100,
    ...overrides,
  };
}

export function mockAIProvider(overrides: Partial<AIProvider> = {}): AIProvider {
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
    rateLimit: {
      requestsPerMinute: 100,
      tokensPerMinute: 10000,
    },
    costConfiguration: {
      currency: 'USD',
      inputPricePerToken: 0.001,
      outputPricePerToken: 0.002,
      imagePricePerUnit: 0,
      videoPricePerSecond: 0,
      audioPricePerSecond: 0,
    },
    health: {
      lastChecked: new Date('2026-01-01T00:00:00.000Z'),
      status: 'healthy',
      latencyMs: 100,
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  return { ...base, ...overrides, capabilities: overrides.capabilities ?? base.capabilities };
}

export function mockAIHealth(overrides: Partial<AIHealth> = {}): AIHealth {
  return {
    status: 'healthy',
    lastChecked: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    latencyMs: 100,
    ...overrides,
  };
}
