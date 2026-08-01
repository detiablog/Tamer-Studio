# AI-RUNTIME-02 — Routing Engine

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Routing Engine is responsible for selecting the optimal AI provider and model for each incoming request. It evaluates candidates based on the configured routing strategy, provider health, cost constraints, latency requirements, and user preferences.

---

## Routing Strategies

### balanced

The default strategy. Weights cost, quality, and speed equally. Selects the provider/model pair that achieves the best composite score across all three dimensions.

**Use case:** General-purpose requests where no single factor dominates.

### fastest

Prioritizes low latency. Evaluates candidates primarily by their `avgLatencyMs` and `speedScore`. Favors providers with the lowest historical response times.

**Use case:** Real-time interactions, chat, live content generation.

### cheapest

Minimizes cost per request. Evaluates candidates primarily by `costPer1kInput` and `costPer1kOutput`. Selects the lowest-cost model that meets the capability requirement.

**Use case:** Bulk processing, background tasks, cost-sensitive operations.

### highest_quality

Maximizes output quality. Evaluates candidates primarily by `qualityScore` and `reliabilityScore`. Selects the highest-scoring model regardless of cost or latency.

**Use case:** Critical content generation, final outputs, high-stakes requests.

### auto

Dynamically selects the strategy based on request context:

- If user has a preferred mode set in `aiUserPreference`, uses that mode
- If request has a `maxCostPerRequest` constraint, switches to `cheapest`
- If request has a `maxLatencyMs` constraint, switches to `fastest`
- Otherwise, defaults to `balanced`

---

## Candidate Selection Algorithm

```
1. Resolve Capability
   - Map request capability to ai_capability_registry
   - Filter ai_model_registry by capability and status = "active"

2. Apply User Preferences
   - Load ai_user_preference for requesting user
   - Remove models in excludedModels
   - Remove providers in excludedProviders
   - Filter by maxCostPerRequest (if set)
   - Filter by maxLatencyMs (if set)
   - Boost score for models in preferredModels (1.2x multiplier)
   - Boost score for providers in preferredProviders (1.2x multiplier)

3. Health Filter
   - Query ai_provider_health for each candidate provider
   - Remove providers with status = "offline"
   - Remove providers with failureRate > 50%
   - Remove providers with circuit breaker state = "open"

4. Score Candidates
   For each remaining (provider, model) pair:
   - qualityScore: 0-100 from ai_model_registry.quality_score
   - speedScore: 0-100 from ai_model_registry.speed_score
   - reliabilityScore: 0-100 from ai_model_registry.reliability_score
   - costScore: 100 - (normalized cost / max cost * 100)
   - latencyScore: 100 - (normalized latency / max latency * 100)

   Composite score per strategy:
   - balanced:     0.33 * quality + 0.33 * costScore + 0.34 * speed
   - fastest:      0.10 * quality + 0.10 * costScore + 0.80 * speed
   - cheapest:     0.10 * quality + 0.80 * costScore + 0.10 * speed
   - highest_quality: 0.80 * quality + 0.10 * costScore + 0.10 * speed

5. Select Winner
   - Sort candidates by composite score descending
   - Select highest-scoring candidate
   - Record routing decision in ai_routing_decision
```

---

## Circuit Breaker Integration

Before candidate scoring, the routing engine checks circuit breaker state for each provider:

- **Closed** (normal): Provider is eligible for selection
- **Open** (blocking): Provider is excluded from candidate pool
- **Half-Open** (testing): Provider is eligible but with a reduced score multiplier (0.5x)

If the circuit breaker transitions from open to half-open, the routing engine allows one probe request. If it succeeds, the breaker transitions to closed. If it fails, the breaker reopens.

---

## User Preference Integration

User preferences are stored in `ai_user_preference` and applied during candidate filtering:

| Field | Effect |
|-------|--------|
| `mode` | Default routing strategy (balanced, fastest, cheapest, highest_quality) |
| `maxCostPerRequest` | Excludes models with estimated cost above this threshold |
| `maxLatencyMs` | Excludes models with average latency above this threshold |
| `preferredProviders` | Boosts score for listed providers by 1.2x |
| `preferredModels` | Boosts score for listed models by 1.2x |
| `excludedProviders` | Removes listed providers from candidate pool |
| `excludedModels` | Removes listed models from candidate pool |

---

## Decision Logging

Every routing decision is recorded in the `ai_routing_decision` table with:

| Field | Description |
|-------|-------------|
| `requestId` | Unique request identifier |
| `userId` | Requesting user |
| `capability` | Requested AI capability |
| `selectedProvider` | Chosen provider |
| `selectedModel` | Chosen model |
| `fallbackProvider` | Backup provider (if primary fails) |
| `fallbackModel` | Backup model |
| `reason` | Decision rationale (auto_select_healthy, user_preferred, fallback_first) |
| `estimatedCost` | Pre-execution cost estimate |
| `actualCost` | Post-execution actual cost |
| `estimatedLatencyMs` | Expected latency |
| `actualLatencyMs` | Measured latency |
| `qualityScore` | Model quality score |
| `wasFallback` | Whether this was a fallback selection |
| `retryCount` | Number of retries before success |
| `routingStrategy` | Strategy used for selection |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/routing` | GET | Get current routing decisions |
| `/api/ai-gateway/routing/stats` | GET | Get routing statistics |
| `/api/ai-gateway/routing/preferences` | GET/PUT | Get/update user routing preferences |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/provider-router.ts` | ProviderRouter class with selection logic |
| `src/lib/db/schema/ai-gateway.ts` | aiRoutingDecision, aiUserPreference tables |
| `src/lib/db/schema/ai-admin.ts` | aiRoutingRule table for configurable rules |
