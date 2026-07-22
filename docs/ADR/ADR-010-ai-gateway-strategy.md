# ADR-010 — AI Gateway Strategy

- **Status:** Accepted
- **Date:** 2026-07-22
- **Authors:** Tamer Studio Engineering
- **Decision Type:** Platform Strategy
- **Superseded By:** ADR-011 (AI Platform Core Architecture) for implementation details
- **Related ADRs:** ADR-001, ADR-003, ADR-007, ADR-011

---

# Context

Tamer Studio is an AI-native platform that depends on multiple external AI providers for image generation, video generation, text generation, embeddings, and future AI capabilities.

Relying on a single provider introduces several risks:

- Vendor lock-in
- Pricing changes
- Regional restrictions
- Service outages
- Rate limiting
- Feature fragmentation

The platform therefore requires a provider-independent strategy that allows providers to be added, removed, or replaced with minimal impact on business features.

This ADR defines the **strategic direction** for AI provider management. Technical implementation is defined separately in ADR-011.

---

# Decision

Tamer Studio SHALL adopt a **Multi-Provider AI Gateway Strategy**.

The platform will never depend on a single AI provider.

Instead, it will support multiple providers through a unified AI platform.

Business modules remain provider-agnostic and interact only with the internal AI Platform Core defined in ADR-011.

---

# Strategic Objectives

The AI Gateway Strategy is designed to achieve:

- High availability
- Vendor independence
- Cost optimization
- Operational resilience
- Flexible provider selection
- Future extensibility

---

# Supported Provider Categories

The strategy supports multiple provider types, including:

- Commercial AI APIs
- Bring Your Own Key (BYOK)
- Open-source model gateways
- Self-hosted inference servers
- Future provider integrations

The architecture must not assume any single vendor.

---

# Initial Provider Strategy

The initial provider ecosystem includes:

## Primary Providers

- Gemini
- OpenAI

## Gateway Providers

- OpenRouter
- Kilo Gateway

## Infrastructure Layer (Optional)

- Cloudflare AI Gateway

Cloudflare AI Gateway is considered an infrastructure optimization layer, not an AI provider.

---

# Provider Selection Principles

Provider selection should consider:

1. Capability
2. Availability
3. Cost
4. Latency
5. Reliability
6. User configuration
7. Regional availability

The implementation of provider selection is defined in ADR-011.

---

# Bring Your Own Key (BYOK)

The platform SHALL support BYOK where technically feasible.

Benefits include:

- Customer-owned API keys
- Reduced platform operating costs
- Enterprise flexibility
- Easier migration between providers

Business logic must remain identical regardless of whether requests use platform-managed credentials or user-provided credentials.

---

# Fallback Strategy

The platform SHALL support automatic provider failover.

Example priority:

1. Gemini
2. OpenRouter
3. OpenAI
4. Kilo Gateway

Fallback order must remain configurable.

Implementation details are defined in ADR-011.

---

# Cost Strategy

The platform should optimize provider usage based on:

- Request type
- Provider pricing
- Credit consumption
- User plan
- Performance requirements

Actual cost calculation is implemented by the AI Platform Core (ADR-011).

---

# Observability Strategy

The AI platform should provide visibility into:

- Provider availability
- Error rates
- Latency
- Usage trends
- Cost trends

Telemetry implementation is defined in ADR-011.

---

# Security Principles

Provider credentials must:

- Never be hardcoded
- Be centrally managed
- Be isolated from business modules
- Support secure rotation

Credential loading is implemented by the platform configuration layer.

---

# Architecture Boundary

This ADR intentionally does **not** define:

- Runtime architecture
- Provider adapters
- Retry implementation
- Circuit breaker
- Registry
- Factory
- Telemetry implementation
- Health monitoring

These are defined by ADR-011.

---

# Consequences

## Positive

- Eliminates vendor lock-in.
- Enables gradual provider adoption.
- Supports cost optimization.
- Improves resilience.
- Simplifies future provider integration.

## Negative

- Increased operational complexity.
- Additional monitoring requirements.
- More sophisticated routing decisions.

---

# Compliance

The following principles are mandatory:

- The platform must support multiple AI providers.
- Business modules must remain provider-agnostic.
- AI provider strategy must be configurable.
- Provider additions must not require changes to business modules.
- Strategic provider decisions belong to this ADR.
- Runtime implementation belongs to ADR-011.

---

# Relationship with ADR-011

ADR-010 defines **why** Tamer Studio adopts a multi-provider AI strategy.

ADR-011 defines **how** that strategy is implemented through the AI Platform Core.

Together they form the complete AI architecture:

ADR-010 → Strategic Direction

↓

ADR-011 → Technical Implementation

---

# Review

This ADR should be reviewed when:

- A new provider category is introduced.
- Business strategy changes.
- BYOK policy changes.
- Infrastructure strategy changes.
- Major provider partnerships are added or removed.