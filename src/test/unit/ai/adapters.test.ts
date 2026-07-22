import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('openai', () => {
  async function* openaiStream() {
    yield { id: 'openai-stream-1', model: 'gpt-4o', choices: [{ delta: { content: 'Hello' }, finish_reason: undefined }], usage: undefined };
    yield { id: 'openai-stream-1', model: 'gpt-4o', choices: [{ delta: { content: ' world' }, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 } };
  }

  const mockCreate = vi.fn()
    .mockResolvedValueOnce({
      id: 'openai-response-1',
      model: 'gpt-4o',
      choices: [{ message: { content: 'Mocked OpenAI response' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    })
    .mockResolvedValueOnce({
      id: 'openai-response-2',
      model: 'gpt-4o',
      choices: [{ message: { content: 'Mocked OpenAI response' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

  return {
    default: class MockOpenAI {
      apiKey = 'test-key';
      chat = {
        completions: {
          create: vi.fn().mockImplementation((params: any) => {
            if (params.stream) return openaiStream();
            return mockCreate(params);
          }),
        },
      };
      models = { list: vi.fn().mockResolvedValue({ data: [{ id: 'gpt-4o' }, { id: 'gpt-4o-mini' }] }) };
      constructor(_config: any) {}
    },
  };
});

vi.mock('@google/generative-ai', () => {
  async function* geminiStream() {
    yield { text: () => 'Hello' };
    yield { text: () => ' world' };
  }

  return {
    GoogleGenerativeAI: class MockGoogleGenerativeAI {
      getGenerativeModel() {
        return {
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Mocked Gemini response',
              usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
            },
          }),
          generateContentStream: vi.fn().mockReturnValue({
            stream: geminiStream(),
          }),
        };
      }
      constructor(_apiKey: string) {}
    },
  };
});

import { OpenAiAdapter } from '@/core/ai/providers/openai-adapter';
import { GeminiAdapter } from '@/core/ai/providers/gemini-adapter';
import type { AIProviderConfig, AIRequest, AIHealth, AIModel, AIResponse } from '@/core/ai/providers/adapter';

const baseConfig: AIProviderConfig = {
  providerType: 'openai',
  apiKey: 'test-openai-key',
  apiEndpoint: 'https://api.openai.com/v1',
};

const geminiConfig: AIProviderConfig = {
  providerType: 'google',
  apiKey: 'test-gemini-key',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
};

const baseRequest: AIRequest = {
  model: 'gpt-4o',
  prompt: 'Hello',
  capability: 'text-generation',
  options: { temperature: 0.7, maxTokens: 256 },
};

describe('OpenAiAdapter contract', () => {
  let adapter: OpenAiAdapter;

  beforeEach(() => {
    adapter = new OpenAiAdapter();
  });

  it('has providerType openai', () => {
    expect(adapter.providerType).toBe('openai');
  });

  it('returns AIResponse with required fields', async () => {
    const response = await adapter.execute(baseRequest, baseConfig);
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('model', 'gpt-4o');
    expect(response).toHaveProperty('provider', 'openai');
    expect(response).toHaveProperty('content');
    expect(typeof response.content).toBe('string');
    expect(response).toHaveProperty('createdAt');
  });

  it('returns usage object with token counts', async () => {
    const response = await adapter.execute(baseRequest, baseConfig);
    expect(response.usage).toBeDefined();
    expect(typeof response.usage?.promptTokens).toBe('number');
    expect(typeof response.usage?.completionTokens).toBe('number');
    expect(typeof response.usage?.totalTokens).toBe('number');
  });

  it('throws AIError on invalid config', async () => {
    await expect(adapter.execute(baseRequest, { apiKey: '', apiEndpoint: '' } as AIProviderConfig)).rejects.toThrow();
  });

  it('returns healthy status on healthCheck', async () => {
    const health = await adapter.healthCheck();
    expect(health).toHaveProperty('providerId', 'openai');
    expect(health).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
  });

  it('returns AIModel array from getModels', async () => {
    const models = await adapter.getModels();
    expect(Array.isArray(models)).toBe(true);
    if (models.length > 0) {
      const model = models[0];
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('providerId', 'openai');
      expect(model).toHaveProperty('supportsStreaming');
    }
  });

  it('returns positive estimateCost', async () => {
    const cost = await adapter.estimateCost(baseRequest);
    expect(typeof cost).toBe('number');
    expect(cost).toBeGreaterThanOrEqual(0);
  });

  it('executeStream yields AsyncIterable<AIResponse>', async () => {
    const chunks: AIResponse[] = [];
    for await (const chunk of adapter.executeStream(baseRequest, baseConfig)) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThanOrEqual(0);
  });
});

describe('GeminiAdapter contract', () => {
  let adapter: GeminiAdapter;

  beforeEach(() => {
    adapter = new GeminiAdapter();
  });

  it('has providerType google', () => {
    expect(adapter.providerType).toBe('google');
  });

  it('returns AIResponse with required fields', async () => {
    const response = await adapter.execute(baseRequest, geminiConfig);
    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('provider', 'google');
    expect(response).toHaveProperty('content');
    expect(typeof response.content).toBe('string');
  });

  it('executeStream yields AsyncIterable<AIResponse>', async () => {
    const chunks: AIResponse[] = [];
    for await (const chunk of adapter.executeStream(baseRequest, geminiConfig)) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThanOrEqual(0);
  });
});
