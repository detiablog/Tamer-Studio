# AI-RUNTIME-02 — Smart AI Gateway Intelligence

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## System Overview

The Smart AI Gateway Intelligence is a provider-agnostic AI orchestration layer that serves as the sole entry point for all communication between Tamer Studio and external AI providers. It implements intelligent routing, health monitoring, cost optimization, circuit breaking, and fallback strategies to ensure high availability, vendor independence, and operational resilience.

The gateway sits between the application layer and all external AI providers (OpenAI, Anthropic, Google). No application module communicates directly with any AI provider. All requests flow through the gateway, which manages routing decisions, health checks, cost calculations, and telemetry collection.

---

## Architecture Diagram

```
+------------------------------------------------------------------+
|                      Application Layer                            |
|  (Feature Modules, API Routes, Business Logic)                   |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    AI Gateway Intelligence                        |
|  +----------------+  +------------------+  +------------------+  |
|  | Routing Engine  |  | Health Monitor   |  | Cost Optimizer   |  |
|  | (Strategy,     |  | (Latency,        |  | (Estimation,     |  |
|  |  Selection,    |  |  Success Rate,   |  |  Comparison,     |  |
|  |  Preferences)  |  |  Failure Rate)   |  |  Credits)        |  |
|  +----------------+  +------------------+  +------------------+  |
|  +----------------+  +------------------+  +------------------+  |
|  | Fallback Engine |  | Circuit Breaker  |  | Queue Manager    |  |
|  | (Retry,        |  | (Closed, Open,   |  | (Priority,       |  |
|  |  Backoff,      |  |  Half-Open,      |  |  Scheduling,     |  |
|  |  Failover)     |  |  Recovery)       |  |  Concurrency)    |  |
|  +----------------+  +------------------+  +------------------+  |
|  +----------------+  +------------------+                       |
|  | Request Logger |  | Metrics          |                       |
|  | (Audit,        |  | (Performance,    |                       |
|  |  Telemetry)    |  |  Usage, Cost)    |                       |
|  +----------------+  +------------------+                       |
+------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+------------------------------------------------------------------+
|                    Provider Registry                              |
|  +-------------+  +----------------+  +-------------------+     |
|  | OpenAI       |  | Anthropic      |  | Google Gemini     |     |
|  | Adapter      |  | Adapter        |  | Adapter           |     |
|  +-------------+  +----------------+  +-------------------+     |
+------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+----------------+  +------------------+  +-------------------+
| OpenAI API     |  | Anthropic API    |  | Google AI API     |
+----------------+  +------------------+  +-------------------+
```

---

## Core Components

### 1. Model Registry

Manages metadata for all known AI models across providers. Stores capabilities, cost profiles, latency benchmarks, context window sizes, and scoring data.

**Key files:** `src/lib/db/schema/ai-gateway.ts` (aiModelRegistry table)

### 2. Capability Registry

Defines 13 supported AI capabilities (chat, image_generation, video_generation, embeddings, code_generation, text_to_speech, speech_to_text, translation, summarization, analysis, creative_writing, data_processing, multimodal). Each model is tagged with its supported capabilities.

**Key files:** `src/lib/db/schema/ai-gateway.ts` (aiCapabilityRegistry table)

### 3. Health Monitor

Tracks real-time health status of each provider including latency, success rate, failure rate, and last check timestamps. Feeds health data into the routing engine to avoid unhealthy providers.

**Key files:** `src/core/ai/provider-router.ts`, `src/lib/db/schema/ai-runtime.ts` (aiProviderHealth table)

### 4. Routing Engine

Selects the optimal provider and model for each request based on the configured strategy (balanced, fastest, cheapest, highest_quality, auto). Considers health status, cost, latency, user preferences, and capability requirements.

**Key files:** `src/core/ai/provider-router.ts`, `src/lib/db/schema/ai-gateway.ts` (aiRoutingDecision, aiUserPreference tables)

### 5. Fallback Engine

Implements automatic failover when the selected provider fails. Supports configurable retry logic with exponential backoff and jitter. Follows the provider priority chain for failover.

**Key files:** `src/core/ai/ai-runtime.ts`, `src/lib/db/schema/ai-gateway.ts` (aiQueueItem table)

### 6. Circuit Breaker

Protects the platform from cascading failures by tracking consecutive failures per provider. Three states: closed (normal), open (blocking), half_open (testing recovery). Automatically recovers after a configurable timeout.

**Key files:** `src/lib/db/schema/ai-gateway.ts` (aiCircuitBreaker table)

### 7. Cost Optimizer

Estimates request costs before execution, compares provider pricing, manages credit reserves, and adjusts credits after execution based on actual usage. Integrates with the Wallet and Credit Engine.

**Key files:** `src/core/ai/ai-runtime.ts`, `src/core/ai/providers/openai-adapter.ts` (MODEL_PRICING)

### 8. Request Logger

Records every AI request with full telemetry: provider, model, tokens, cost, latency, status, retry count, fallback status, and errors. Writes to audit log and request log tables.

**Key files:** `src/lib/db/schema/ai-gateway.ts` (aiRequestLog, aiRoutingDecision tables)

### 9. Metrics

Collects runtime metrics across categories (performance, usage, cost, health) with dimensional data (provider, model, user, workspace). Supports time-series analysis and dashboarding.

**Key files:** `src/lib/db/schema/ai-gateway.ts` (aiRuntimeMetric table)

---

## Data Flow

```
AI Request (from Application)
    |
    v
[1] Capability Resolver
    - Maps requested capability to available models
    - Filters by model status and capability support
    |
    v
[2] User Preference Resolver
    - Loads user routing preferences (mode, exclusions, cost/latency limits)
    - Applies preferred/excluded providers and models
    |
    v
[3] Circuit Breaker Check
    - Checks circuit breaker state for each candidate provider
    - Skips providers with open circuit breaker
    |
    v
[4] Health Monitor Check
    - Filters out providers with high failure rates (>50%)
    - Filters out providers marked as offline
    |
    v
[5] Provider Intelligence
    - Evaluates provider health, latency, and reliability scores
    - Loads cost profiles and context window constraints
    |
    v
[6] Model Intelligence
    - Scores candidate models based on strategy weights
    - Applies quality, speed, and reliability scoring
    |
    v
[7] Routing Engine
    - Applies routing strategy (balanced, fastest, cheapest, highest_quality, auto)
    - Selects optimal provider/model pair
    - Records routing decision with reasoning
    |
    v
[8] Credit Check
    - Estimates cost via provider adapter
    - Converts USD to credits via CreditEngine
    - Validates wallet balance >= estimated credits
    |
    v
[9] Credit Reserve
    - Reserves estimated credits (debit type: "reserve")
    |
    v
[10] Execution Engine
    - Dispatches to provider adapter (OpenAI/Anthropic/Google)
    - Executes request with timeout
    |
    v
[11] Post-Execution
    - Calculates actual cost from token usage
    - Adjusts credits (release excess / charge deficit)
    - Records success in health monitor
    - Records routing decision with actual metrics
    - Logs request to audit trail
    |
    v
[12] Response
    - Returns normalized AIExecutionResult to application
```

**Failure Path:**

```
[10] Execution Engine -> Failure
    |
    v
[11] Release credit reservation
    |
    v
[12] Record failure in health monitor
    |
    v
[13] Update circuit breaker state
    |
    v
[14] Fallback Engine
    - Attempts retry with exponential backoff
    - If retries exhausted, selects fallback provider
    - Repeats from step [8] with fallback provider
    |
    v
[15] If all fallbacks exhausted -> Return error
```

---

## Integration Points

### AI Runtime (ai-runtime.ts)

The primary orchestrator that ties all components together. The `executeAIRequest()` function is the single entry point for AI execution. It coordinates provider selection, credit management, execution, cost adjustment, audit logging, and learning engine updates.

### Provider Registry (provider-registry.ts)

Manages the lifecycle of provider adapters. Provides `getProviderAdapter()`, `getAvailableProviders()`, `getAllModels()`, and `estimateCost()`. Lazy-initializes adapters on first access.

### Provider Router (provider-router.ts)

Implements the `ProviderRouter` class which handles provider selection based on health status, recording success/failure outcomes, and maintaining health metrics in the database.

### Provider Adapters

Three provider adapters implement the `AIProviderAdapter` interface:

- **OpenAIAdapter** (`providers/openai-adapter.ts`): OpenAI API integration with 8 models
- **AnthropicAdapter** (`providers/anthropic-adapter.ts`): Anthropic API integration with 6 models
- **GoogleAdapter** (`providers/google-adapter.ts`): Google Gemini API integration with 5 models

Each adapter implements:
- `execute(input: ProviderInput): Promise<ProviderOutput>` - Execute AI request
- `estimateCost(input: ProviderInput): number` - Pre-execution cost estimation in USD
- `getModels(): string[]` - List supported model identifiers

### Credit Integration

The gateway integrates with `WalletService` and `DefaultCreditEngine` from `src/core/wallet/` and `src/core/credits/`. Credits serve as the internal billing unit, converted from USD via configurable exchange rates.

### Audit Integration

All AI executions are logged through `DefaultAuditRepository` from `src/core/audit/`. Both successful and failed executions produce audit entries with detailed metadata including provider, model, tokens, cost, and duration.

### Creative Memory Integration

The runtime optionally enriches prompts with creative memory context via `contextBuilderService` and records usage patterns via `learningEngineService`.

---

## Database Schema

The gateway uses 8 dedicated tables defined in `src/lib/db/schema/ai-gateway.ts`:

| Table | Purpose |
|-------|---------|
| `ai_model_registry` | Model metadata, capabilities, costs, scores |
| `ai_capability_registry` | AI capability definitions |
| `ai_routing_decision` | Routing decision audit trail |
| `ai_request_log` | Full request telemetry log |
| `ai_circuit_breaker` | Circuit breaker state per provider |
| `ai_queue_item` | Request queue with priority |
| `ai_user_preference` | Per-user routing preferences |
| `ai_runtime_metric` | Dimensional runtime metrics |

Plus 3 tables from `src/lib/db/schema/ai-runtime.ts`:

| Table | Purpose |
|-------|---------|
| `ai_provider_health` | Provider health tracking |
| `ai_prompt_template` | Prompt template management |
| `ai_generation_history` | Generation history tracking |

And 2 tables from `src/lib/db/schema/ai-providers.ts`:

| Table | Purpose |
|-------|---------|
| `ai_provider` | Provider configuration |
| `ai_provider_model` | Provider-model associations |

And 4 tables from `src/lib/db/schema/ai-admin.ts`:

| Table | Purpose |
|-------|---------|
| `ai_feature_flag` | Feature flags for AI capabilities |
| `ai_routing_rule` | Configurable routing rules |
| `ai_runtime_setting` | Runtime key-value settings |
| `ai_safety_policy` | Safety and content policies |
| `ai_admin_action` | Admin action audit log |

---

## API Surface

The gateway exposes 26 REST endpoints under `/api/ai-gateway/` and `/api/ai/`. See `AI-RUNTIME-02-API.md` for full endpoint documentation.

---

## Configuration

Provider API keys are loaded from environment variables:

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic |
| `GOOGLE_AI_API_KEY` | Google Gemini |

No provider credentials are hardcoded or stored in the database.

---

## Compliance

All AI integrations in Tamer Studio comply with ADR-010 (AI Gateway Strategy) and ADR-011 (AI Platform Core Architecture):

- No application module communicates directly with external AI providers
- Provider-specific logic exists only in adapter implementations
- All requests pass through logging, telemetry, retry, circuit breaker, and fallback
- Business modules depend only on the AI Runtime abstraction
