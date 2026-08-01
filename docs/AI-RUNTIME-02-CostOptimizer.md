# AI-RUNTIME-02 — Cost Optimizer

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Cost Optimizer estimates request costs before execution, compares pricing across providers, manages credit reserves, and adjusts credits after execution based on actual token usage. It integrates with the Wallet Service and Credit Engine to provide accurate cost management.

---

## Cost Estimation Model

### Pre-Execution Estimation

Before executing a request, the system estimates cost using the provider adapter's `estimateCost()` method:

```
estimatedCostUsd = (estimatedInputTokens * inputPrice / 1000) + (estimatedOutputTokens * outputPrice / 1000)
```

Where:
- `estimatedInputTokens = ceil(promptLength / 4)` (approximate token count from character count)
- `estimatedOutputTokens = maxTokens` (requested max output tokens)
- `inputPrice` and `outputPrice` are per-model pricing from the adapter

### Token Estimation

Tokens are estimated from prompt length using a 4-character-per-token approximation:

```
estimatedTokens = ceil(prompt.length / 4)
```

This approximation is used for pre-execution cost estimation. Actual token counts from the provider response are used for post-execution billing.

---

## Provider Cost Comparison

### OpenAI Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| gpt-4o | $0.0025 | $0.01 |
| gpt-4o-mini | $0.00015 | $0.0006 |
| gpt-4-turbo | $0.01 | $0.03 |
| gpt-4 | $0.03 | $0.06 |
| gpt-3.5-turbo | $0.0005 | $0.0015 |
| o1 | $0.015 | $0.06 |
| o1-mini | $0.003 | $0.012 |
| o3-mini | $0.0011 | $0.0044 |

### Anthropic Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| claude-sonnet-4-20250514 | $0.003 | $0.015 |
| claude-3-5-sonnet-20241022 | $0.003 | $0.015 |
| claude-3-5-haiku-20241022 | $0.001 | $0.005 |
| claude-3-opus-20240229 | $0.015 | $0.075 |
| claude-3-sonnet-20240229 | $0.003 | $0.015 |
| claude-3-haiku-20240307 | $0.00025 | $0.00125 |

### Google Gemini Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| gemini-2.5-pro | $0.00125 | $0.01 |
| gemini-2.5-flash | $0.00015 | $0.0006 |
| gemini-2.0-flash | $0.0001 | $0.0004 |
| gemini-1.5-pro | $0.00125 | $0.005 |
| gemini-1.5-flash | $0.000075 | $0.0003 |

### Cost Comparison (1K input tokens, 1K output tokens)

| Provider | Model | Total Cost |
|----------|-------|-----------|
| Google | gemini-1.5-flash | $0.000375 |
| Google | gemini-2.0-flash | $0.0005 |
| OpenAI | gpt-4o-mini | $0.00075 |
| Google | gemini-2.5-flash | $0.00075 |
| OpenAI | gpt-3.5-turbo | $0.002 |
| Anthropic | claude-3-haiku-20240307 | $0.0015 |
| Google | gemini-1.5-pro | $0.00625 |
| Google | gemini-2.5-pro | $0.01125 |
| OpenAI | gpt-4o | $0.0125 |
| Anthropic | claude-3-5-haiku-20241022 | $0.006 |
| Anthropic | claude-3-5-sonnet-20241022 | $0.018 |
| OpenAI | o3-mini | $0.0055 |
| OpenAI | o1-mini | $0.015 |
| Anthropic | claude-3-opus-20240229 | $0.09 |
| OpenAI | gpt-4-turbo | $0.04 |
| OpenAI | o1 | $0.075 |
| OpenAI | gpt-4 | $0.09 |

---

## Credit Calculation

### USD to Credits Conversion

Credits are the internal billing unit. The conversion rate is managed by `DefaultCreditEngine`:

```
credits = creditEngine.convertCostToCredits(costUsd, "USD")
```

### Credit Flow

```
1. Estimate cost via adapter.estimateCost()
2. Convert USD to credits
3. Check wallet.availableCredits >= estimatedCredits
4. Reserve credits: walletService.debit(type: "reserve")
5. Execute request
6. Calculate actual cost from token usage
7. Convert actual cost to credits
8. Adjust credits:
   - Over-reserved: walletService.debit(type: "release")
   - Under-reserved: walletService.debit(type: "usage_debit")
9. On failure: walletService.debit(type: "release")
```

### Credit Transaction Types

| Type | Description |
|------|-------------|
| `reserve` | Pre-execution credit hold |
| `release` | Return unused reserved credits |
| `usage_debit` | Charge for actual usage exceeding reservation |

---

## Cost Analytics

### Cost Per Request

```
actualCostUsd = (promptTokens * inputPrice / 1000) + (completionTokens * outputPrice / 1000)
```

### Cost Tracking

Each request logs:
- `estimatedCost`: Pre-execution estimate
- `actualCost`: Post-execution actual
- `costUsd`: Final USD cost
- `creditsUsed`: Credits consumed
- `promptTokens`: Input token count
- `completionTokens`: Output token count
- `totalTokens`: Total token count

### Cost Metrics

Stored in `ai_runtime_metric` with dimensions:
- Provider
- Model
- User
- Workspace

---

## Cost Optimization Strategies

### Routing Strategy Impact

| Strategy | Cost Behavior |
|----------|--------------|
| `balanced` | Moderate cost, balanced with quality |
| `fastest` | May use higher-cost low-latency models |
| `cheapest` | Selects lowest-cost eligible model |
| `highest_quality` | May use highest-cost premium models |
| `auto` | Dynamically adjusts based on constraints |

### User Cost Controls

| Setting | Effect |
|---------|--------|
| `maxCostPerRequest` | Excludes models above cost threshold |
| Provider preference | May override cheapest selection |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/estimate` | POST | Estimate request cost |
| `/api/ai-gateway/analytics` | GET | Cost analytics data |
| `/api/ai-gateway/metrics` | GET | Runtime cost metrics |
| `/api/ai-gateway/metrics/summary` | GET | Aggregated metrics summary |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/ai-runtime.ts` | Credit reserve/adjust/release logic |
| `src/core/ai/providers/openai-adapter.ts` | OpenAI MODEL_PRICING |
| `src/core/ai/providers/anthropic-adapter.ts` | Anthropic MODEL_PRICING |
| `src/core/ai/providers/google-adapter.ts` | Google MODEL_PRICING |
| `src/core/credits/credits.ts` | DefaultCreditEngine |
| `src/core/wallet/service.ts` | WalletService |
