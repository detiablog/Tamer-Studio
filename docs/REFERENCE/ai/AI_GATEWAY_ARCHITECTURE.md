# Part 1 — Vision, Principles & Core Architecture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 1. Vision

## Purpose

Tamer AI Gateway is the central intelligence layer responsible for orchestrating every AI request inside Tamer Studio.

Its primary goal is not to become another AI provider, but to provide a vendor-independent runtime capable of routing requests to the most appropriate AI gateway or provider based on policies, availability, cost, performance and user configuration.

The architecture must allow providers and gateways to be added, replaced or removed without affecting the application layer.

---

## Design Goals

The gateway architecture must satisfy the following goals.

### Vendor Independence

No business module may depend directly on:

- OpenAI
- Google
- Anthropic
- OpenRouter
- Kilo Gateway
- Zuplo
- Cloudflare AI Gateway
- or any future provider.

Every integration must happen through standardized adapters.

---

### Gateway Independence

AI gateways are interchangeable.

Examples:

- Kilo Gateway
- OpenRouter
- Zuplo AI Gateway
- Future Gateway

Removing one gateway must not require changes in business logic.

---

### Provider Independence

Providers are interchangeable.

Examples:

- Google Gemini
- OpenAI
- Anthropic
- Groq
- Mistral
- DeepSeek
- Qwen
- Llama
- Future Provider

The Runtime decides which provider should be used.

---

### Multi Gateway

One request may be routed through:

- Direct Provider
- Kilo Gateway
- OpenRouter
- Zuplo
- Future Gateway

according to Routing Policies.

---

### Multi Provider

One model may exist in multiple providers.

Example:

Gemini 2.5 Flash may be available through:

- Google
- Kilo Gateway
- OpenRouter
- Zuplo

The Runtime chooses the best route.

---

### High Availability

Gateway failures must never stop the platform.

The Runtime shall automatically:

- Retry
- Switch Gateway
- Switch Provider
- Switch Model

without requiring application changes.

---

### Cost Optimization

The Runtime should always attempt to execute requests using the lowest acceptable cost while respecting quality and policy requirements.

---

### BYOK First

Users may bring their own API Keys.

Supported levels:

- User
- Workspace
- Organization
- Enterprise

The Runtime automatically selects the appropriate key.

---

### Enterprise Ready

The architecture must support:

- RBAC
- Audit
- Billing
- Usage Tracking
- Cost Intelligence
- Workspace Policies
- Feature Flags

without requiring redesign.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 2. Architecture Principles

The following principles are mandatory.

## Runtime is the Brain

Only the Runtime makes decisions.

No gateway or provider may implement business routing logic.

---

## Cloudflare is Infrastructure

Cloudflare AI Gateway is an optional infrastructure component.

Responsibilities:

- Cache
- Proxy
- Edge Optimization
- Rate Limiting
- Analytics

Cloudflare must never decide:

- Gateway Selection
- Provider Selection
- Cost Optimization
- Retry Policy
- Fallback Policy

---

## Gateways are Adapters

Gateway implementations are transport layers only.

Examples:

- Kilo
- OpenRouter
- Zuplo

They must expose a common interface.

---

## Providers are Adapters

Providers are implementation details.

Business modules must never communicate with providers directly.

---

## Policies over Hardcoded Logic

Routing decisions must be policy-driven.

Never hardcode:

if provider == OpenAI

or

if gateway == OpenRouter

Every decision must be configurable.

---

## Registry Driven Architecture

All gateways, providers and models must be registered.

Nothing should be discovered through hardcoded conditions.

---

## Fail Gracefully

Gateway failures should never crash the application.

The Runtime must always attempt recovery according to configured policies.

---

## Configuration over Code

Changing:

- Gateway
- Provider
- Retry
- Fallback
- Pricing

must not require source code modifications.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 3. Layer Architecture

```

+------------------------------------------------------------+
|                    Business Modules                        |
+------------------------------------------------------------+
|                  Tamer AI Gateway Runtime                  |
|------------------------------------------------------------|
| Routing Policy Engine                                      |
| Provider Selection Engine                                  |
| Gateway Registry                                           |
| Provider Registry                                          |
| Model Registry                                             |
| Retry Engine                                               |
| Circuit Breaker                                            |
| Health Monitor                                             |
| Cost Optimizer                                             |
| Usage Tracker                                              |
| Feature Flags                                              |
| Workspace Policies                                         |
| BYOK Manager                                               |
+------------------------------------------------------------+
|         Cloudflare AI Gateway (Optional Layer)             |
|------------------------------------------------------------|
| Cache                                                      |
| Proxy                                                      |
| Edge                                                       |
| Rate Limit                                                 |
| Analytics                                                  |
+------------------------------------------------------------+
| Gateway Layer                                              |
|------------------------------------------------------------|
| Kilo Gateway                                               |
| OpenRouter                                                 |
| Zuplo AI Gateway                                           |
| Future Gateway                                             |
+------------------------------------------------------------+
| Provider Layer                                             |
|------------------------------------------------------------|
| Google Gemini                                              |
| OpenAI                                                     |
| Anthropic                                                  |
| Groq                                                       |
| Mistral                                                    |
| DeepSeek                                                   |
| Qwen                                                       |
| Llama                                                      |
| Future Provider                                            |
+------------------------------------------------------------+

```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 4. Core Responsibilities

The Runtime is responsible for:

- Gateway Selection
- Provider Selection
- Model Selection
- Retry
- Fallback
- Circuit Breaker
- Health Monitoring
- Usage Tracking
- Cost Optimization
- Billing Integration
- BYOK Resolution
- Workspace Policies
- Request Lifecycle
- Response Normalization

The Runtime is the only component allowed to make routing decisions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# End of Part 1

# Part 2 — Runtime Components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime Overview

The Tamer AI Gateway Runtime is the only component responsible for making AI execution decisions.

Business modules must never communicate directly with:

- Providers
- Gateways
- Cloudflare
- Models

Every request must pass through the Runtime.

The Runtime orchestrates the complete request lifecycle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime Lifecycle

Request

↓

Policy Resolution

↓

Workspace Resolution

↓

Gateway Selection

↓

Provider Selection

↓

Model Resolution

↓

Cost Estimation

↓

Execution

↓

Retry (if needed)

↓

Fallback (if needed)

↓

Response Normalization

↓

Usage Tracking

↓

Billing

↓

Logging

↓

Return Response

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime Components

The Runtime consists of the following services.

1. Gateway Registry
2. Provider Registry
3. Model Registry
4. Routing Policy Engine
5. Provider Selection Engine
6. Health Monitor
7. Retry Engine
8. Circuit Breaker
9. Cost Optimizer
10. Usage Tracker
11. Response Normalizer
12. Cache Manager
13. Workspace Policy Manager
14. BYOK Manager
15. Feature Flag Manager
16. Secret Manager
17. Telemetry Manager
18. Execution Coordinator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Gateway Registry

Purpose

Maintain every available gateway.

Responsibilities

- Register Gateway
- Remove Gateway
- Enable Gateway
- Disable Gateway
- Discover Gateway
- Gateway Metadata
- Gateway Health State

Public Interface

register()

unregister()

enable()

disable()

get()

list()

exists()

Gateway Metadata

- Name
- Version
- Priority
- Supported Providers
- Status
- Health
- Capabilities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Registry

Purpose

Maintain every available AI provider.

Responsibilities

- Register Provider
- Provider Metadata
- Provider Health
- Provider Capabilities
- Model Discovery

Public Interface

register()

unregister()

get()

list()

findByModel()

findByCapability()

Metadata

- Provider
- Models
- Pricing
- Context Window
- Vision
- Audio
- Video
- Embedding
- Tool Calling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Registry

Purpose

Maintain every model known by the Runtime.

One model may exist through multiple gateways.

Example

Gemini 2.5 Flash

↓

Google

↓

Kilo

↓

OpenRouter

↓

Zuplo

The Runtime determines which path should be used.

Metadata

- Model Name
- Aliases
- Provider
- Gateway
- Max Context
- Max Output
- Streaming
- Pricing
- Availability

Public Interface

register()

resolve()

list()

find()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Routing Policy Engine

Purpose

Determine the execution policy before any request is sent.

Responsibilities

- Gateway Priority
- Provider Priority
- Workspace Rules
- Enterprise Rules
- Cost Rules
- Region Rules
- Feature Flags
- Compliance Rules

Output

Execution Plan

The Routing Engine never executes requests.

It only creates execution strategies.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Selection Engine

Purpose

Choose the best execution target.

Input

Execution Plan

Provider Registry

Gateway Registry

Health Status

Output

Execution Target

Selection Criteria

- Health
- Cost
- Latency
- Workspace Policy
- User Preference
- Availability
- Capability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Health Monitor

Purpose

Continuously evaluate gateway and provider health.

Collect

Latency

Availability

Error Rate

Timeout

Quota

429

5xx

Health Score

Output

Health Score

0–100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Retry Engine

Purpose

Retry transient failures.

Supported

Timeout

429

Temporary Network Error

Temporary Gateway Error

Policy

Exponential Backoff

Random Jitter

Maximum Retry

Configurable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Circuit Breaker

States

Closed

↓

Open

↓

Half Open

Responsibilities

Protect the Runtime from unstable gateways.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Cost Optimizer

Purpose

Choose the lowest acceptable execution cost.

Input

Pricing

Health

Latency

Workspace Policy

Output

Cost Optimized Execution Plan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Usage Tracker

Collect

Prompt Tokens

Completion Tokens

Images

Video Seconds

Audio Seconds

Execution Time

Gateway

Provider

Model

Workspace

User

Cost

Billing ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Response Normalizer

Purpose

Normalize every provider response into a common format.

Business modules never receive provider-specific responses.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Cache Manager

Purpose

Manage Runtime cache.

Supports

Memory Cache

Distributed Cache

Cloudflare Infrastructure Cache

Semantic Cache (Future)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Workspace Policy Manager

Purpose

Resolve workspace-level AI policies.

Examples

Allowed Providers

Allowed Models

Allowed Gateway

Monthly Budget

Daily Budget

Credit Limits

Compliance Rules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# BYOK Manager

Purpose

Resolve API Keys.

Priority

User Key

↓

Workspace Key

↓

Organization Key

↓

Enterprise Key

↓

Platform Key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Feature Flag Manager

Purpose

Enable or disable Runtime capabilities.

Examples

Cloudflare Layer

Kilo Gateway

OpenRouter

Zuplo

Streaming

Fallback

Semantic Cache

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Secret Manager

Manage

Provider Keys

Gateway Keys

Workspace Keys

Encryption Keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Telemetry Manager

Collect

Metrics

Logs

Tracing

Errors

Performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Coordinator

Purpose

Orchestrate the entire Runtime lifecycle.

This is the highest-level Runtime service.

Every AI execution must pass through the Execution Coordinator.

No other component may bypass it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# End of Part 2
# Part 3 — Routing Policy, Decision Engine & Execution Plan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Purpose

The Routing System is responsible for determining the optimal execution path for every AI request.

It is the decision-making core of the Tamer AI Gateway Runtime.

The Routing System does not execute requests.

It only determines how requests should be executed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Decision Flow

Incoming Request

↓

Request Validation

↓

Workspace Resolution

↓

User Resolution

↓

Feature Flag Resolution

↓

Policy Resolution

↓

Gateway Candidates

↓

Provider Candidates

↓

Model Candidates

↓

Cost Estimation

↓

Health Evaluation

↓

Execution Plan

↓

Execution Coordinator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Decision Hierarchy

The Runtime evaluates every request in the following order.

1. Feature Flags

↓

2. Workspace Policies

↓

3. Organization Policies

↓

4. User Preferences

↓

5. Model Requirements

↓

6. Gateway Availability

↓

7. Provider Availability

↓

8. Health Score

↓

9. Estimated Cost

↓

10. Latency

↓

11. Retry Strategy

↓

12. Fallback Strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Plan

Purpose

Execution Plan is an immutable object representing the complete execution strategy for one AI request.

Every downstream component must consume the same Execution Plan.

No component may modify it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execution Plan contains

Request

Workspace

User

Gateway

Provider

Model

Capabilities

Estimated Cost

Retry Policy

Fallback Chain

Timeout

Streaming

Budget Rules

Selected API Key

Feature Flags

Execution Metadata

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Example

ExecutionPlan

Gateway

↓

OpenRouter

Provider

↓

Google

Model

↓

Gemini 2.5 Flash

Retry

↓

2

Fallback

↓

Zuplo

↓

Gemini Direct

Budget

↓

$0.05

Streaming

↓

Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Gateway Selection Policy

The Runtime evaluates:

Gateway Enabled

Gateway Health

Gateway Priority

Gateway Cost

Gateway Latency

Gateway Availability

Gateway Capabilities

Gateway Region

Gateway Rate Limits

Gateway Workspace Rules

Gateway Feature Flags

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Selection Policy

The Runtime evaluates:

Provider Enabled

Provider Health

Provider Cost

Provider Availability

Provider Region

Provider Context Window

Provider Tool Calling

Provider Vision

Provider Audio

Provider Video

Provider Embedding

Provider Streaming

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Selection Policy

The Runtime evaluates:

Model Availability

Model Context

Model Cost

Model Latency

Model Quality Tier

Model Supports Streaming

Model Supports Function Calling

Model Supports Vision

Model Supports Audio

Model Supports Video

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Workspace Policy Resolution

Workspace policies override default policies.

Examples

Allowed Gateway

Allowed Provider

Allowed Model

Monthly Budget

Daily Budget

Maximum Context

Maximum Cost

Allowed Features

Streaming Allowed

Vision Allowed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Organization Policy Resolution

Organizations may define:

Approved Providers

Approved Gateways

Compliance Policies

Data Residency

Cost Limits

Allowed Regions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# User Preferences

Users may define:

Preferred Gateway

Preferred Provider

Preferred Model

Preferred Language

Preferred Region

Streaming Preference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Capability Resolution

The Runtime determines required capabilities.

Examples

Text Generation

Vision

Speech

Image Generation

Video Generation

Embedding

Reasoning

Tool Calling

Structured Output

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Health Evaluation

Every candidate receives a Health Score.

Health Score

0–100

Calculated from:

Latency

Availability

Timeout Rate

429 Rate

5xx Rate

Recent Failures

Circuit Breaker Status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Cost Evaluation

Estimated using:

Gateway Cost

Provider Cost

Token Cost

Media Cost

Storage Cost

Expected Output Tokens

Budget Remaining

Subscription Rules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Decision Matrix

Each candidate receives a weighted score.

Example

Health

40%

Cost

20%

Latency

15%

Workspace Policy

10%

User Preference

5%

Availability

10%

The candidate with the highest score becomes the primary execution target.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Candidate Chain

Instead of selecting one provider,

the Runtime creates a Candidate Chain.

Example

Candidate 1

↓

Kilo

↓

Gemini Flash

Candidate 2

↓

OpenRouter

↓

Gemini Flash

Candidate 3

↓

Zuplo

↓

Gemini Flash

Candidate 4

↓

Direct Gemini

Candidate 5

↓

Direct OpenAI

Execution Coordinator consumes this chain.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Policy Types

System Policy

Global Policy

Organization Policy

Workspace Policy

User Policy

Runtime Policy

Emergency Policy

Policies are evaluated from highest priority to lowest.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Explainable Decisions

Every Execution Plan must include:

Why this Gateway?

Why this Provider?

Why this Model?

Why this Cost?

Why this Retry Policy?

Why this Fallback Chain?

These explanations are stored for:

- Audit
- Billing
- Debugging
- Analytics
- Enterprise Compliance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Decision Logging

Every decision must be logged.

Example

Gateway Selected

OpenRouter

Reason

Lowest Cost

Health

98

Latency

320 ms

Estimated Cost

$0.00003

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# End of Part 3
# Part 4 — Execution Engine, Retry, Fallback & High Availability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Purpose

The Execution Engine is responsible for executing an immutable Execution Plan.

It coordinates every stage of AI execution while ensuring reliability, resiliency and high availability.

Business modules never communicate directly with gateways or providers.

Every execution must go through the Execution Engine.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Flow

Incoming Request

↓

Execution Plan

↓

Execution Coordinator

↓

Gateway Adapter

↓

Provider Adapter

↓

AI Provider

↓

Response

↓

Normalizer

↓

Usage Tracker

↓

Billing

↓

Audit

↓

Return Response

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Coordinator

Purpose

The Execution Coordinator is the highest-level orchestration service.

Responsibilities

- Receive Execution Plan
- Build Candidate Chain
- Execute Candidates
- Retry Failures
- Switch Gateway
- Switch Provider
- Normalize Responses
- Publish Runtime Events

The Coordinator never makes routing decisions.

It only executes the Execution Plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Candidate Chain

The Execution Plan contains a Candidate Chain.

Example

Candidate 1

Gateway

Kilo

Provider

Gemini

Model

gemini-2.5-flash

↓

Candidate 2

Gateway

OpenRouter

Provider

Gemini

↓

Candidate 3

Gateway

Zuplo

Provider

Gemini

↓

Candidate 4

Gateway

Direct

Provider

Gemini

↓

Candidate 5

Gateway

Direct

Provider

OpenAI

The Coordinator executes candidates sequentially unless a policy specifies parallel execution.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution States

Queued

↓

Preparing

↓

Executing

↓

Retrying

↓

Fallback

↓

Completed

↓

Failed

↓

Cancelled

Every execution must have exactly one final state.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Retry Strategy

Retry only transient failures.

Retryable Errors

- Timeout
- Connection Reset
- Temporary Network Failure
- HTTP 429
- HTTP 502
- HTTP 503
- HTTP 504

Non-Retryable Errors

- Invalid API Key
- Authentication Failure
- Invalid Prompt
- Unsupported Model
- Permission Denied
- Validation Error

Retry Policy

- Exponential Backoff
- Random Jitter
- Configurable Delay
- Maximum Retry Count

Retry must occur on the current candidate before switching to the next candidate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Fallback Strategy

Fallback begins only after the Retry Policy is exhausted.

Example

Kilo

↓

Retry

↓

Retry

↓

Failed

↓

OpenRouter

↓

Retry

↓

Failed

↓

Zuplo

↓

Success

Fallback decisions must follow the Candidate Chain defined in the Execution Plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Circuit Breaker

States

Closed

↓

Open

↓

Half Open

Closed

Normal execution.

Open

No new requests are sent.

Half Open

Limited test requests are allowed.

If successful

↓

Closed

If failed

↓

Open

Circuit Breaker operates independently for every:

- Gateway
- Provider
- Model

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Health Monitoring

The Runtime continuously measures:

Gateway Health

Provider Health

Model Availability

Latency

Timeout Rate

429 Rate

5xx Rate

Average Response Time

Recent Success Rate

Health Score

0–100

Health Score influences future Execution Plans but never changes the current Execution Plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Timeout Policy

Every execution must define:

Connection Timeout

Read Timeout

Streaming Timeout

Overall Execution Timeout

Timeout values are configurable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Parallel Execution

The Runtime may execute multiple candidates simultaneously.

Example

Candidate A

↓

Gemini

Candidate B

↓

OpenAI

First successful response wins.

Remaining executions are cancelled.

Parallel execution is controlled by Runtime Policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Streaming Execution

Streaming execution follows the same Execution Plan.

Requirements

- Ordered Chunks
- Stream Recovery
- Graceful Cancellation
- Stream Timeout
- Usage Tracking

Streaming failures may trigger Retry or Fallback according to policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Cancellation

Execution may be cancelled by:

- User
- Workspace
- Administrator
- Timeout
- Budget Limit
- Runtime Shutdown

Cancellation must propagate through every active adapter.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Response Normalization

Every adapter returns its own response format.

The Runtime converts all responses into a common structure.

Business modules must never receive provider-specific payloads.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime Events

Every execution publishes events.

Examples

Execution Started

Execution Retried

Execution Fallback

Execution Completed

Execution Failed

Execution Cancelled

Execution Timed Out

Execution Stream Started

Execution Stream Completed

Execution Stream Failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Failure Recovery

The Runtime must always attempt graceful recovery.

Recovery order

Retry

↓

Fallback

↓

Provider Switch

↓

Gateway Switch

↓

Return Failure

The application must never crash because one provider becomes unavailable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Audit

Every execution stores:

Execution Plan ID

Decision Trace ID

Gateway

Provider

Model

Retries

Fallback Count

Latency

Cost

Health Score

Response Status

Failure Reason

Usage ID

Billing ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# End of Part 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Context

Purpose

Execution Context stores all immutable and mutable data required during one execution lifecycle.

Execution Context contains:

- Request
- Execution Plan
- Execution Session
- Decision Trace
- Workspace
- User
- Organization
- API Key
- Runtime Metadata
- Correlation ID
- Trace ID

Every Runtime Component receives the same Execution Context.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Correlation ID

Every request must receive a globally unique Correlation ID.

The Correlation ID must propagate through:

- Runtime
- Gateway
- Provider
- Billing
- Usage
- Logging
- Audit
- Notification
- Workflow

Purpose

- Distributed tracing
- Debugging
- Audit
- Enterprise support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Trace ID

Every retry and fallback generates child traces.

Example

Correlation ID

abc-123

↓

Trace

1

Kilo

↓

Trace

2

Retry

↓

Trace

3

OpenRouter

↓

Trace

4

Zuplo

Every execution timeline must be reconstructable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime Timeline

Every execution records chronological events.

Example

09:00:00

Request Received

↓

09:00:01

Execution Plan Created

↓

09:00:02

Gateway Selected

↓

09:00:03

Provider Selected

↓

09:00:05

Retry

↓

09:00:07

Fallback

↓

09:00:09

Completed

Timeline is immutable after execution completes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Metrics

Every execution collects:

Queue Time

Planning Time

Gateway Time

Provider Time

Streaming Time

Retry Time

Fallback Time

Normalization Time

Total Execution Time

These metrics are used by:

- Analytics
- Cost Engine
- Health Monitor
- Enterprise Dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Resource Guard

Before execution begins, the Runtime validates:

- User Credits
- Workspace Budget
- Organization Budget
- Subscription Limits
- Rate Limits
- Provider Quota
- Gateway Quota

Execution must fail immediately if required resources are unavailable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Budget Guard

Before execution:

Estimate Cost

↓

Check Remaining Budget

↓

Approve

or

Reject

Budgets may exist at:

- User
- Workspace
- Organization
- Enterprise

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Quota Guard

Validate:

- Daily Requests
- Monthly Requests
- Tokens
- Images
- Video Seconds
- Audio Seconds

Quota validation occurs before contacting any provider.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime Events

Every execution publishes lifecycle events.

Mandatory Events

ExecutionQueued

ExecutionPrepared

ExecutionStarted

GatewaySelected

ProviderSelected

RetryStarted

RetryCompleted

FallbackStarted

FallbackCompleted

StreamingStarted

StreamingChunk

StreamingCompleted

ExecutionCompleted

ExecutionFailed

ExecutionCancelled

ExecutionTimedOut

These events are consumed by:

- Billing
- Usage
- Analytics
- Notifications
- Monitoring
- Audit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Execution Snapshot

The Runtime periodically stores lightweight snapshots.

Snapshots contain:

- Current Candidate
- Current State
- Retry Count
- Current Gateway
- Current Provider
- Current Model
- Elapsed Time

Snapshots enable:

- Live Dashboard
- Monitoring
- Future Resume Support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Graceful Shutdown

When the Runtime shuts down:

- Stop accepting new executions.
- Finish active executions.
- Save execution snapshots.
- Close gateway connections.
- Flush logs.
- Flush usage data.
- Flush billing events.

No execution may be lost during shutdown.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Idempotency

Every execution request must support Idempotency.

Duplicate requests with the same Idempotency Key must never execute twice.

This protects:

- Billing
- Credits
- Usage
- Provider Requests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Runtime State Machine

Every execution follows this state machine.

Pending

↓

Validated

↓

Planned

↓

Queued

↓

Preparing

↓

Executing

↓

Streaming (optional)

↓

Completed

or

Retrying

↓

Fallback

↓

Completed

or

Failed

or

Cancelled

No invalid state transitions are allowed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Architecture Rule

Business modules must never create Execution Plans.

Business modules only submit Requests.

Only the Runtime may create:

- Decision Trace
- Execution Plan
- Execution Session
- Execution Context
- Runtime Timeline

This guarantees that all AI executions follow a single standardized lifecycle.
# Part 5 — Gateway & Provider Architecture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Purpose

Gateways and Providers are infrastructure adapters.

They must never contain business logic.

They are responsible only for transporting requests between the Runtime and external AI services.

All routing decisions remain inside the Runtime.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Architecture Overview

Business Modules

↓

Execution Coordinator

↓

Gateway Adapter

↓

Provider Adapter

↓

External AI Service

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Gateway Layer

Purpose

A Gateway acts as a transport layer.

Examples

- Kilo Gateway
- OpenRouter
- Zuplo AI Gateway
- Future Gateway

Gateways never make routing decisions.

They simply execute Runtime instructions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Gateway Responsibilities

A Gateway Adapter is responsible for:

- Authentication
- Request Transformation
- Response Transformation
- Streaming Transport
- Error Mapping
- Health Check
- Capability Discovery

A Gateway must never:

- Select Providers
- Retry Requests
- Perform Fallback
- Estimate Cost
- Apply Billing Logic
- Apply Business Policies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Layer

Purpose

A Provider executes AI workloads.

Examples

- Google Gemini
- OpenAI
- Anthropic
- Groq
- Mistral
- DeepSeek
- Qwen
- Llama
- Future Provider

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Responsibilities

Provider Adapters are responsible for:

- Authentication
- Request Formatting
- Model Mapping
- Streaming Support
- Response Mapping
- Token Extraction
- Usage Metadata

Provider Adapters must never:

- Retry Requests
- Select Gateway
- Select Provider
- Apply Pricing Rules
- Apply Workspace Policies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Gateway Adapter Contract

Every Gateway Adapter must implement:

initialize()

shutdown()

health()

capabilities()

execute()

stream()

cancel()

listProviders()

listModels()

estimate()

validate()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Adapter Contract

Every Provider Adapter must implement:

initialize()

shutdown()

health()

capabilities()

execute()

stream()

cancel()

tokenize()

estimate()

validate()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Gateway Registry

The Runtime maintains a Gateway Registry.

Each Gateway contains:

Gateway ID

Gateway Name

Version

Priority

Status

Enabled

Health

Capabilities

Supported Providers

Supported Features

Metadata

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Registry

Each Provider contains:

Provider ID

Provider Name

Status

Health

Capabilities

Pricing

Context Window

Streaming

Vision

Audio

Video

Embedding

Reasoning

Tool Calling

Structured Output

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Registry

Every model has one canonical identity.

Example

Canonical Model

Gemini 2.5 Flash

Available Through

Google Direct

Kilo Gateway

OpenRouter

Zuplo

Future Gateway

Each implementation maps to the same canonical model.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Aliasing

Example

Canonical

gemini-2.5-flash

Aliases

google/gemini-2.5-flash

gemini-flash

gemini25flash

The Runtime resolves aliases automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Capability Discovery

Gateways and Providers publish capabilities.

Examples

Text

Streaming

Vision

Image Generation

Video Generation

Audio

Embedding

Tool Calling

Reasoning

Structured Output

Realtime

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Health Check

Every adapter must expose:

Status

Latency

Availability

Failure Rate

Last Check

Health Score

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Error Normalization

Every adapter converts provider-specific errors into Runtime Errors.

Examples

Invalid API Key

Quota Exceeded

Rate Limited

Timeout

Authentication Failed

Permission Denied

Internal Error

Business modules never receive provider-specific errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Streaming Contract

Every adapter must support:

Start

Chunk

Heartbeat

Finish

Cancel

Error

All streaming responses are normalized.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# BYOK Support

Gateway adapters must support:

Platform Key

Organization Key

Workspace Key

User Key

without changing adapter logic.

API Keys are injected by the Runtime.

Adapters never load API Keys directly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Adapter Lifecycle

Created

↓

Initialized

↓

Ready

↓

Executing

↓

Idle

↓

Shutdown

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Adapter Isolation

A failing adapter must never affect:

- Runtime
- Other Gateways
- Other Providers

Every adapter operates in isolation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Feature Flags

Every adapter supports:

Enabled

Disabled

Maintenance Mode

Read Only

Experimental

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Future Compatibility

The architecture must allow adding a new Gateway or Provider without modifying:

- Runtime
- Billing
- Usage
- Workflow
- Business Modules

Only a new adapter and registry entry should be required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Architecture Rule

Business modules

↓

Runtime

↓

Gateway Adapter

↓

Provider Adapter

↓

AI Service

No component may bypass this flow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# End of Part 5

# Part 6 — Universal Model Registry & Capability System

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Purpose

The Universal Model Registry provides a canonical representation of every AI model available within the Tamer AI Platform.

Business modules must never reference provider-specific model names.

The Runtime resolves logical model requests into executable provider models.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Architecture

Business Module

↓

Logical Model

↓

Universal Model Registry

↓

Canonical Model

↓

Gateway Mapping

↓

Provider Mapping

↓

Execution

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Layers

The Runtime recognizes four layers of model identity.

Logical Model

↓

Canonical Model

↓

Gateway Model

↓

Provider Model

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Example

Logical Model

FastText

↓

Canonical Model

Gemini 2.5 Flash

↓

Gateway

OpenRouter

↓

Provider Model

google/gemini-2.5-flash

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Logical Models

Logical Models represent business intent.

Examples

Fast Text

Balanced Text

Premium Text

Reasoning

Vision

Image Generation

Video Generation

Audio Generation

Embedding

Realtime Conversation

Tool Calling

Structured Output

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Canonical Model

Canonical Models are vendor-independent.

Examples

Gemini 2.5 Flash

Gemini 2.5 Pro

GPT-5

Claude Sonnet

Claude Opus

Llama 4

DeepSeek V3

Qwen Max

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Provider Model

Provider-specific model identifiers.

Examples

google/gemini-2.5-flash

gpt-5

claude-sonnet-4

deepseek-chat

These identifiers remain inside adapters only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Metadata

Each Canonical Model stores:

- Model ID
- Display Name
- Version
- Provider Family
- Release Date
- Status
- Deprecation Date
- Context Window
- Max Output Tokens
- Streaming Support
- Tool Calling
- Structured Output
- Vision
- Audio
- Video
- Image Generation
- Embedding
- Reasoning
- Function Calling
- JSON Mode
- Safety Level

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Capability Matrix

Every model advertises supported capabilities.

Examples

✓ Text

✓ Vision

✓ Audio Input

✓ Audio Output

✓ Video Generation

✓ Image Generation

✓ Embedding

✓ Tool Calling

✓ Reasoning

✓ JSON Output

✓ Streaming

✓ Realtime

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Performance Profile

Every model maintains a continuously updated performance profile.

Metrics

Average Latency

Success Rate

Token Throughput

Streaming Stability

Availability

Quality Score

Cost Score

Health Score

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Cost Profile

Every model stores pricing information.

Prompt Token Cost

Completion Token Cost

Cached Token Cost

Image Cost

Video Cost

Audio Cost

Realtime Cost

The Runtime estimates total execution cost before selecting a model.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Context Profile

Each model declares:

Maximum Context Window

Maximum Output Tokens

Maximum Image Size

Maximum Video Duration

Maximum Audio Duration

Maximum Tool Calls

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Lifecycle Status

Every model has one lifecycle state.

Experimental

↓

Preview

↓

General Availability

↓

Deprecated

↓

Retired

Deprecated models may still execute according to workspace policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Compatibility

Each model declares compatibility with:

Gateway

Provider

Region

Subscription Tier

Workspace Policy

Enterprise Policy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Selection Rules

The Runtime evaluates:

Capability Match

↓

Workspace Policy

↓

Budget

↓

Latency

↓

Health

↓

Quality

↓

Availability

↓

Provider Preference

↓

Gateway Preference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Dynamic Model Ranking

Models receive a continuously updated ranking.

Example Inputs

Health Score

Quality Score

Recent Failures

Latency

Cost

Availability

Enterprise Rating

Community Rating (optional)

The Runtime prefers the highest-ranked compatible model.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Aliases

Aliases simplify migration between providers.

Example

fast-text

↓

Gemini Flash

↓

GPT-5 Mini

↓

Claude Sonnet

The Runtime resolves aliases dynamically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Discovery

Adapters may publish newly available models.

The Runtime validates them before registration.

New models are never exposed automatically to business modules.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Versioning

Each model supports semantic versioning.

Major

Minor

Patch

Older versions remain available until retirement according to policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Model Deprecation

When a model is deprecated:

- Existing executions continue.
- New executions follow workspace policy.
- Administrators receive notifications.
- Migration recommendations are generated automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Architecture Rules

Business modules must never reference:

- Provider model names
- Gateway model names
- Provider-specific versions

Business modules only reference:

- Logical Models
- Required Capabilities

The Runtime resolves every other detail.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# End of Part 6