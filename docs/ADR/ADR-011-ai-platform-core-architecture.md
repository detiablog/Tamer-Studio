# ADR-011 — AI Platform Core Architecture

- **Status:** Accepted
- **Date:** 2026-07-22
- **Authors:** Tamer Studio Engineering
- **Decision Type:** Core Architecture
- **Related ADRs:** ADR-001, ADR-002, ADR-003, ADR-005, ADR-007, ADR-010

---

# Context

Tamer Studio is an AI-first platform that integrates multiple external AI providers for image generation, video generation, text generation, embeddings, and future AI capabilities.

During the repository audit, several architectural issues were identified:

- AI Gateway exists but is not integrated into the application runtime.
- Some modules are capable of bypassing the intended abstraction.
- External AI providers are not managed through a unified runtime.
- Provider selection, retry logic, fallback strategy, telemetry, and health monitoring are not centralized.

Without a dedicated AI Platform Core, future integrations would introduce duplicated logic, inconsistent error handling, and increased maintenance cost.

---

# Decision

The platform SHALL introduce a dedicated **AI Platform Core** located at:

```text
src/core/ai/
```

The AI Platform Core becomes the **only entry point** for all communication with external AI providers.

No application module, feature module, API route, or service may communicate directly with an external AI provider.

---

# Architecture

```
Application
        │
        ▼
AI Runtime
        │
        ▼
Provider Registry
        │
        ▼
Provider Selector
        │
        ▼
Retry Manager
        │
        ▼
Circuit Breaker
        │
        ▼
Fallback Manager
        │
        ▼
Provider Adapter
        │
        ▼
External AI Provider
```

---

# Core Components

The AI Platform Core consists of the following modules.

## Runtime

Responsible for:

- Request normalization
- Response normalization
- Request execution
- Logging
- Telemetry integration

The Runtime contains **no provider-specific implementation**.

---

## Provider Registry

Responsible for:

- Provider registration
- Provider discovery
- Provider lifecycle

All provider discovery must occur through the Registry.

---

## Provider Factory

Responsible for:

- Creating provider instances
- Dependency injection
- Configuration loading

Provider creation must never occur directly inside business logic.

---

## Provider Interface

Every provider SHALL implement the shared interface.

Example capabilities include:

- Chat
- Image Generation
- Video Generation
- Embeddings
- Health Check

This guarantees runtime independence from provider implementations.

---

## Provider Adapter

Each external provider SHALL be implemented as an adapter.

Examples include:

- Gemini
- OpenAI
- OpenRouter
- Kilo Gateway

Adapters are responsible only for translating requests and responses.

Business rules are prohibited inside adapters.

---

## Provider Selector

Responsible for selecting the most appropriate provider according to configurable policies.

Selection factors may include:

- Availability
- Cost
- Latency
- Capability
- Region
- User preference

The selection strategy must remain configurable.

---

## Retry Manager

Responsible for transient failure recovery.

Supported retry conditions include:

- HTTP 429
- HTTP 500
- HTTP 502
- HTTP 503
- HTTP 504

Retry policies must support exponential backoff and jitter.

---

## Circuit Breaker

Responsible for protecting the platform from unstable providers.

Supported states:

- Closed
- Open
- Half Open

---

## Fallback Manager

Responsible for automatic provider failover.

Example:

```
Gemini
    ↓
OpenRouter
    ↓
OpenAI
    ↓
Kilo
```

Fallback priorities must be configurable.

---

## Health Monitor

Each provider SHALL expose a health endpoint or equivalent health mechanism.

The Health Monitor maintains provider availability information for the Provider Selector.

---

## Telemetry

Every AI request SHALL produce telemetry data including:

- Provider
- Latency
- Token usage
- Estimated cost
- Retry count
- Fallback count
- Success or failure

Telemetry is required for monitoring, analytics, and optimization.

---

## Cost Manager

The platform SHALL record AI usage metrics including:

- Provider
- Credits consumed
- Estimated USD cost
- User
- Workspace
- Project
- Generation ID

Business modules must not calculate provider costs directly.

---

# Mandatory Rules

The following rules are mandatory.

## Rule 1

Feature modules SHALL NOT communicate directly with external AI providers.

Forbidden:

```
Feature
    ↓
OpenAI SDK
```

Required:

```
Feature
    ↓
AI Runtime
```

---

## Rule 2

No provider-specific logic may exist outside Provider Adapters.

---

## Rule 3

Provider implementations must remain replaceable without changing business logic.

---

## Rule 4

Business modules SHALL depend only on the AI Runtime.

They must remain unaware of:

- SDKs
- HTTP clients
- Authentication mechanisms
- Retry implementations
- Cost calculations

---

## Rule 5

The Runtime SHALL remain provider-agnostic.

Adding a new provider must not require changes to existing business modules.

---

## Rule 6

All AI requests SHALL pass through:

- Logging
- Telemetry
- Error normalization
- Retry
- Circuit Breaker
- Fallback

---

## Rule 7

Secrets and API keys SHALL be loaded exclusively from the centralized configuration layer.

Business modules must never access provider credentials directly.

---

# Folder Structure

```text
src/
└── core/
    └── ai/
        ├── runtime/
        ├── registry/
        ├── factory/
        ├── providers/
        ├── selector/
        ├── retry/
        ├── breaker/
        ├── fallback/
        ├── telemetry/
        ├── health/
        ├── cost/
        ├── types/
        ├── errors/
        └── utils/
```

---

# Consequences

## Positive

- Single AI abstraction layer.
- Consistent provider integration.
- Easier addition of new AI providers.
- Centralized retry, fallback, and telemetry.
- Reduced duplication.
- Improved observability.
- Better production resilience.
- Lower long-term maintenance cost.

## Negative

- Slightly higher implementation complexity.
- Additional abstraction layer.
- Increased upfront engineering effort.

---

# Compliance

The following are considered architecture violations:

- Direct SDK usage inside Feature modules.
- Direct HTTP requests to AI providers outside Provider Adapters.
- Business logic inside Provider Adapters.
- Provider-specific conditionals (`switch`/`if`) scattered throughout the application.
- Feature modules accessing provider API keys directly.

All future AI integrations MUST comply with this ADR.

---

# Review

This ADR SHALL be reviewed whenever:

- A new AI provider is introduced.
- The AI Runtime architecture changes.
- Provider selection strategy changes.
- Telemetry or cost management architecture changes.
- AI infrastructure is significantly refactored.