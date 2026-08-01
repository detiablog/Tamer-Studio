# AI-RUNTIME-02 — Provider Registry

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Provider Registry manages the lifecycle, discovery, and health status of all external AI providers. It serves as the single source of truth for provider capabilities, configuration, and availability.

---

## Supported Providers

### OpenAI

| Property | Value |
|----------|-------|
| Adapter | `OpenAIAdapter` |
| SDK | `openai` (npm) |
| Env Variable | `OPENAI_API_KEY` |
| Display Name | OpenAI |

**Supported Models:**

| Model | Input Cost/1K Tokens | Output Cost/1K Tokens |
|-------|---------------------|----------------------|
| gpt-4o | $0.0025 | $0.01 |
| gpt-4o-mini | $0.00015 | $0.0006 |
| gpt-4-turbo | $0.01 | $0.03 |
| gpt-4 | $0.03 | $0.06 |
| gpt-3.5-turbo | $0.0005 | $0.0015 |
| o1 | $0.015 | $0.06 |
| o1-mini | $0.003 | $0.012 |
| o3-mini | $0.0011 | $0.0044 |

### Anthropic

| Property | Value |
|----------|-------|
| Adapter | `AnthropicAdapter` |
| SDK | `@anthropic-ai/sdk` (npm) |
| Env Variable | `ANTHROPIC_API_KEY` |
| Display Name | Anthropic |

**Supported Models:**

| Model | Input Cost/1K Tokens | Output Cost/1K Tokens |
|-------|---------------------|----------------------|
| claude-sonnet-4-20250514 | $0.003 | $0.015 |
| claude-3-5-sonnet-20241022 | $0.003 | $0.015 |
| claude-3-5-haiku-20241022 | $0.001 | $0.005 |
| claude-3-opus-20240229 | $0.015 | $0.075 |
| claude-3-sonnet-20240229 | $0.003 | $0.015 |
| claude-3-haiku-20240307 | $0.00025 | $0.00125 |

### Google Gemini

| Property | Value |
|----------|-------|
| Adapter | `GoogleAdapter` |
| SDK | `@google/generative-ai` (npm) |
| Env Variable | `GOOGLE_AI_API_KEY` |
| Display Name | Google AI |

**Supported Models:**

| Model | Input Cost/1K Tokens | Output Cost/1K Tokens |
|-------|---------------------|----------------------|
| gemini-2.5-pro | $0.00125 | $0.01 |
| gemini-2.5-flash | $0.00015 | $0.0006 |
| gemini-2.0-flash | $0.0001 | $0.0004 |
| gemini-1.5-pro | $0.00125 | $0.005 |
| gemini-1.5-flash | $0.000075 | $0.0003 |

---

## Provider Adapter Design

Each provider implements the `AIProviderAdapter` interface defined in `src/core/ai/provider-registry.ts`:

```typescript
interface AIProviderAdapter {
  name: string;
  execute(input: ProviderInput): Promise<ProviderOutput>;
  estimateCost(input: ProviderInput): number;
  getModels(): string[];
}
```

### ProviderInput

```typescript
interface ProviderInput {
  prompt: string;
  model: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}
```

### ProviderOutput

```typescript
interface ProviderOutput {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration: number;
  model: string;
}
```

### Adapter Responsibilities

- Translate normalized `ProviderInput` to provider-specific API calls
- Handle provider-specific authentication (API key from env vars)
- Return normalized `ProviderOutput` with token usage and duration
- Estimate cost based on token count and model pricing
- List supported model identifiers

### Adapter Constraints

- No business logic inside adapters
- Adapters must not access the database directly
- Adapters must not store state between requests (except lazy client initialization)
- Cost estimation uses a fallback model if the requested model is not in the pricing table

---

## Provider Health Integration

The registry integrates with the health monitoring system through `ProviderRouter`:

- `recordSuccess(providerId, latencyMs)`: Updates health metrics after successful execution
- `recordFailure(providerId, error)`: Updates health metrics after failed execution
- `isHealthy(providerId)`: Checks provider health status before routing

Health data is persisted in `ai_provider_health` and queried during routing decisions.

---

## Provider Priority

Providers are assigned a priority in the `ai_provider` table. Higher priority providers are evaluated first during routing. The default priority order is:

1. OpenAI (priority: 0)
2. Anthropic (priority: 0)
3. Google Gemini (priority: 0)

Priority can be adjusted through the admin API at `/api/ai-admin/providers`.

---

## Lazy Initialization

Adapters are initialized lazily on first access via `ensureAdapters()`. The singleton pattern ensures only one instance of each adapter exists. Client SDKs are initialized on first `execute()` call, not at adapter creation.

```typescript
const adapters: Map<string, AIProviderAdapter> = new Map();

function ensureAdapters() {
  if (adapters.size === 0) {
    adapters.set("openai", new OpenAIAdapter());
    adapters.set("anthropic", new AnthropicAdapter());
    adapters.set("google", new GoogleAdapter());
  }
}
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-providers` | GET | List available providers and models |
| `/api/ai/providers` | GET | List providers with health status |
| `/api/ai/providers/health` | GET | Provider health status details |
| `/api/ai-gateway/models` | GET | List all registered models |
| `/api/ai-gateway/models/[id]` | GET/PUT | Get/update model metadata |
| `/api/ai-gateway/models/[id]/scores` | GET | Get model quality scores |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/provider-registry.ts` | Registry interface and adapter management |
| `src/core/ai/providers/openai-adapter.ts` | OpenAI adapter implementation |
| `src/core/ai/providers/anthropic-adapter.ts` | Anthropic adapter implementation |
| `src/core/ai/providers/google-adapter.ts` | Google Gemini adapter implementation |
| `src/core/ai/provider-router.ts` | ProviderRouter with health integration |
| `src/lib/db/schema/ai-providers.ts` | aiProvider and aiProviderModel tables |
