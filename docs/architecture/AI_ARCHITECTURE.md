# AI Platform Core Architecture

Version: 1.0
Status: Active
Owner: Tamer Studio
Last Updated: 2026-07-23

---

# 1. Overview

The AI Platform Core is the unified abstraction layer for all external AI provider interactions within Tamer Studio. It provides a single entry point for AI requests, enforcing centralized provider selection, retry logic, circuit breaking, fallback, telemetry, and security.

No application module, feature module, API route, or service may communicate directly with an external AI provider. All requests must pass through the AI Runtime.

# 2. Directory Structure

```text
src/core/ai/
├── runtime/                 # Request normalization, execution orchestration, telemetry
├── registry/                # Provider registration, discovery, lifecycle
├── factory/                 # Provider instance creation and DI
├── providers/               # Adapter implementations (OpenAI, Gemini, OpenRouter, Kilo)
│   └── factory.ts           # Adapter factory
├── selector/                # Provider selection by policy (health, latency, cost, region)
├── pipeline/                # Execution pipeline with timeout management
├── retry/                   # Retry manager with exponential backoff
├── breaker/                 # Circuit breaker implementation
├── fallback/                # Fallback chain manager
├── telemetry/               # In-memory telemetry service
├── health/                  # Health monitor
├── cost/                    # Cost estimation interface
├── security/                # Credential loader
├── types/                   # Shared contracts (domain, pipeline, testing)
│   ├── domain.ts
│   ├── pipeline.ts
│   └── testing.ts
├── utils/                   # ID generation utilities
│   └── ai-id.ts
├── errors/                  # AI error types
├── index.ts                 # Public barrel export
└── types.ts                 # Legacy type entry
```

# 3. Component Responsibilities

## AI Runtime

- Normalizes incoming AI requests and outgoing responses.
- Orchestrates the execution pipeline.
- Integrates logging, audit, and telemetry.
- Enforces request cancellation and timeout boundaries.
- **Remains independent from Next.js, React, and UI concerns.**

## Provider Registry

- Manages provider registration and unregistration.
- Supports provider discovery by capability.
- Maintains provider health states.
- **Enables hot-swapping of providers without downtime.**

## Provider Factory

- Creates provider instances with injected configuration.
- Manages provider lifecycle and reuse.
- Prevents direct instantiation from business logic.

## Provider Adapters

- Translate between the internal AI request/response format and provider-specific APIs.
- Handle provider authentication, request building, response normalization, and error translation.
- **Contain no business rules.** Only translation and transport logic.

## Provider Selector

- Evaluates available providers against configurable selection policies.
- Considers health status, latency, cost, capability, region, and user preferences.
- Returns the highest-ranked provider ID.

## Execution Pipeline

- Executes requests through the full fault-tolerance chain: selector → registry → retry → circuit breaker → adapter → fallback.
- Manages execution timeouts and cancellation tokens.
- Records telemetry for each execution stage.

## Retry Manager

- Applies retry policies with exponential backoff and jitter.
- Determines retriable errors and respects maximum attempt limits.

## Circuit Breaker

- Protects the platform from unstable providers.
- Tracks failure rates and transitions between closed, open, and half-open states.

## Fallback Manager

- Manages automatic failover to alternative providers.
- Selects the next provider in a configurable chain when the primary provider fails.

## Telemetry

- Records execution metrics: provider, latency, status, cost, retry count, fallback count.
- Provides observability for monitoring and optimization.

## Health

- Monitors provider availability and latency.
- Exposes health information for the selector and circuit breaker.

## Cost

- Provides cost estimation interfaces for AI requests.
- Enforces centralized cost tracking, preventing direct cost calculations in business modules.

## Security

- Loads provider credentials from the centralized configuration layer.
- Ensures secrets are never logged or exposed to business modules.

# 4. Request Flow

```text
Feature Module
      │
      ▼
  AI Runtime
      │
      ▼
  Execution Pipeline
      │
      ├──▶ Provider Selector ──▶ Select best provider
      │
      ├──▶ Circuit Breaker ────▶ Allow or reject request
      │
      ├──▶ Provider Registry ──▶ Resolve provider by ID
      │
      ├──▶ Adapter Factory ────▶ Get adapter for provider type
      │
      ├──▶ Retry Manager ──────▶ Execute with retry policy
      │
      └──▶ Fallback Manager ───▶ Failover if retry exhausted
                │
                ▼
        Provider Adapter
                │
                ▼
        External AI Provider
```

# 5. Provider Adapter Contract

Every adapter MUST implement `AIProviderAdapter`:

- `readonly providerType: string` — Unique provider type identifier.
- `execute(request, config): Promise<AIResponse>` — Synchronous execution.
- `executeStream(request, config): AsyncIterable<AIResponse>` — Streaming execution.
- `healthCheck(): Promise<AIHealth>` — Provider health status.
- `getModels(): Promise<AIModel[]>` — Available models for this provider.
- `estimateCost(request): Promise<number>` — Cost estimation for the request.

Adapters MAY extend `BaseProviderAdapter` for shared utilities such as:

- `normalizeResponse(raw)` — Normalizes raw provider responses into the platform format.
- `buildError(code, message, retryable)` — Constructs standardized AI errors.

**Adapter rules:**

- Adapters must not contain business rules.
- Adapters must not make assumptions about platform state.
- Adapters must only translate between the internal contract and the provider API.

# 6. Testing Guide

## Unit Tests

- Place unit tests in `src/test/unit/ai/`.
- Use the testing contracts defined in `src/core/ai/types/testing.ts`:
  - `MockProvider` — for mocking provider behavior.
  - `FakeRuntime` — for simulating runtime state.
  - `AIExecutionHarness` — for end-to-end execution simulation with failure injection.

## Integration Tests

- Verify the full pipeline: runtime → selector → registry → adapter → fallback.
- Test retry behavior with transient failures.
- Test circuit breaker state transitions under load.
- Test fallback chain execution when primary providers fail.

## Contract Tests

- Every adapter must pass contract tests verifying:
  - Request normalization.
  - Response normalization.
  - Error translation.
  - Health check behavior.
  - Cost estimation interface.

## Architecture Compliance Tests

- Verify no Feature module imports provider SDKs directly.
- Verify no adapter contains business logic.
- Verify runtime has no direct database imports.
- Verify runtime has no UI framework imports.

# 7. Security Considerations

## Credential Management

- All provider API keys and secrets are loaded exclusively via `ProviderCredentialLoader` from the centralized configuration layer.
- Business modules, adapters, and runtime components must never access raw credentials directly.

## Audit Logging

- Every AI execution is audited via `logAction("provider.execution.*", ...)`.
- Sensitive fields in telemetry context are redacted by the centralized logger.

## Input Validation

- All AI requests are validated through `validateAIRequest` and normalized through `normalizeAIRequest` before reaching the pipeline.
- Invalid requests are rejected with structured `AIError` responses.

## Exposure Prevention

- Adapters must not log raw provider responses containing secrets.
- Telemetry records must not include API keys, tokens, or raw prompt payloads.

## Rate Limiting and Abuse Prevention

- Circuit breaker and retry manager protect against provider abuse.
- Fallback manager prevents cascading failures across providers.

# 8. Architecture Validation

The following validation checks were performed based on ADR-011 and ADR-012 rules.

## 8.1 No Feature module communicates directly with providers

**Search scope:** `src/features/` and `src/app/`

**Findings:**

- `src/features/ai/ai.store.ts` — Contains local UI state management (localStorage, sample data). No direct provider SDK imports found.
- No files in `src/features/` or `src/app/` import from `@/core/ai/providers` or any external AI SDK (OpenAI, Anthropic, Google, AWS, Azure, OpenAI SDK, AI SDK, LangChain, Llama).

**Result:** PASS — No architecture violations detected.

## 8.2 No business logic inside adapters

**Search scope:** `src/core/ai/providers/`

**Findings:**

- `OpenAiAdapter` — Contains `validateConfig` (configuration validation) and `buildRequest` (request translation). These are adapter responsibilities. No business rules, decision logic, or cross-provider orchestration found.
- `GeminiAdapter`, `OpenRouterAdapter`, `KiloAdapter` — Implement translation and transport only.
- `BaseProviderAdapter` — Provides shared normalization and error construction utilities.

**Result:** PASS — Adapters contain only translation and transport logic.

## 8.3 Runtime is independent from Next.js, React, and UI

**Search scope:** `src/core/ai/runtime/`

**Findings:**

- `src/core/ai/runtime/ai-runtime.ts` — Imports only from:
  - `src/core/ai/runtime/types.ts`
  - `src/core/ai/runtime/validation.ts`
  - `@/core/logger` (core logger, UI-agnostic)
  - `@/core/audit` (core audit service)
- No imports from `next/`, `react/`, `@/components/`, `@/app/`, or any UI framework.
- Runtime operates purely on data contracts and core services.

**Result:** PASS — Runtime is framework-agnostic.

## 8.4 Runtime is independent from Database

**Search scope:** `src/core/ai/runtime/`

**Findings:**

- `src/core/ai/runtime/ai-runtime.ts` — Does not import any database module (`@/lib/db`, `@/core/db`, ORM, query builder, etc.).
- Persistence concerns are delegated to the Telemetry service (in-memory by default) and Audit service (core repository).

**Result:** PASS — Runtime has no direct database dependency.

## 8.5 Providers are hot-swappable

**Search scope:** `src/core/ai/registry/`

**Findings:**

- `ProviderRegistry` interface defines `register(input)` and `unregister(providerId)`.
- `DefaultProviderRegistry` implements both operations with runtime validation.
- `register` accepts either a provider instance or an async factory function.
- `unregister` removes the provider from the internal `Map` and emits an audit log.
- `ExecutionPipeline` resolves the latest provider from the registry on each execution, ensuring newly registered providers are immediately available.

**Result:** PASS — Registry supports full hot-swap lifecycle.

## 8.6 Business modules depend only on AI Runtime

**Search scope:** `src/features/`, `src/app/`

**Findings:**

- No feature or app module imports provider SDKs or adapter internals.
- The existing `src/features/ai/ai.store.ts` is a client-side Zustand-style store for dashboard UI state. It does not execute AI requests.

**Result:** PASS — Business modules depend only on the platform abstraction layer.

# 9. Compliance Summary

| Rule | Status |
|------|--------|
| No Feature module communicates directly with providers | PASS |
| No provider-specific logic exists outside Adapters | PASS |
| Provider implementations are replaceable without changing business logic | PASS |
| Business modules depend only on AI Runtime | PASS |
| Runtime is provider-agnostic | PASS |
| All AI requests pass through logging, telemetry, error normalization, retry, circuit breaker, and fallback | PASS |
| Secrets and API keys are loaded exclusively from the centralized configuration layer | PASS |
