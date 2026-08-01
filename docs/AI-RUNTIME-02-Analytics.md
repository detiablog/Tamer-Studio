# AI-RUNTIME-02 — Analytics

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Analytics system provides comprehensive visibility into AI gateway operations through request logging, cost analytics, provider usage tracking, and performance metrics. All data is collected automatically during request processing.

---

## Request Logging

Every AI request is logged to the `ai_request_log` table with full telemetry.

### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Primary key |
| `requestId` | varchar(100) | Unique request identifier |
| `userId` | text | Requesting user |
| `workspaceId` | text | Associated workspace |
| `provider` | varchar(100) | Provider used |
| `model` | varchar(200) | Model used |
| `capability` | varchar(100) | Requested capability |
| `status` | varchar(50) | Request status (pending, completed, failed) |
| `promptTokens` | integer | Input token count |
| `completionTokens` | integer | Output token count |
| `totalTokens` | integer | Total token count |
| `creditsUsed` | integer | Credits consumed |
| `costUsd` | real | Cost in USD |
| `latencyMs` | integer | Response latency (ms) |
| `queueTimeMs` | integer | Time spent in queue (ms) |
| `wasFallback` | boolean | Whether fallback was used |
| `retryCount` | integer | Number of retries |
| `error` | text | Error message (if failed) |
| `metadata` | jsonb | Extensible metadata |
| `createdAt` | timestamp | Request timestamp |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `ai_request_log_request_idx` | (requestId) | Request lookup |
| `ai_request_log_user_idx` | (userId) | User activity queries |
| `ai_request_log_provider_idx` | (provider) | Provider usage queries |
| `ai_request_log_status_idx` | (status) | Status filtering |
| `ai_request_log_created_idx` | (createdAt) | Time-range queries |

---

## Cost Analytics

### Per-Request Cost

```
costUsd = (promptTokens * inputPrice / 1000) + (completionTokens * outputPrice / 1000)
```

### Cost Aggregation

Cost data can be aggregated by:

- **Time range**: Hourly, daily, weekly, monthly
- **Provider**: Cost per provider
- **Model**: Cost per model
- **User**: Cost per user
- **Workspace**: Cost per workspace
- **Capability**: Cost per capability type

### Cost Metrics

Stored in `ai_runtime_metric` with:
- `metricName`: Cost-related metric name
- `category`: "cost"
- `value`: Numeric value
- `unit`: "usd", "credits"
- `provider`, `model`: Optional dimensions
- `dimensions`: JSON object for additional context

---

## Provider Usage

### Usage Tracking

Each request logs:
- Provider name
- Model identifier
- Capability requested
- Token counts (input, output, total)
- Latency
- Success/failure status

### Usage Aggregation

Provider usage can be analyzed by:

| Dimension | Description |
|-----------|-------------|
| Provider | Total requests per provider |
| Model | Total requests per model |
| Capability | Requests per capability type |
| User | Requests per user |
| Time | Requests over time |

### Provider Health Correlation

Usage data correlates with health data to identify:
- Providers with high failure rates
- Models with degraded performance
- Capability availability issues

---

## Performance Metrics

### Latency Tracking

| Metric | Description |
|--------|-------------|
| `latencyMs` | Provider response time |
| `queueTimeMs` | Time waiting in queue |
| `totalTimeMs` | End-to-end request time |

### Throughput Tracking

| Metric | Description |
|--------|-------------|
| Requests per minute | Request rate |
| Tokens per second | Processing throughput |
| Concurrent requests | Active request count |

### Success Rate

```
successRate = (completedRequests / totalRequests) * 100
```

### Performance Metrics Storage

Stored in `ai_runtime_metric` with:

| Field | Value |
|-------|-------|
| `category` | "performance" |
| `metricName` | latency, throughput, success_rate |
| `dimensions` | { provider, model, capability } |

---

## Routing Decision Analytics

The `ai_routing_decision` table records every routing decision with:

| Field | Purpose |
|-------|---------|
| `routingStrategy` | Strategy used |
| `selectedProvider` | Chosen provider |
| `selectedModel` | Chosen model |
| `reason` | Decision rationale |
| `estimatedCost` vs `actualCost` | Cost accuracy |
| `estimatedLatencyMs` vs `actualLatencyMs` | Latency accuracy |
| `wasFallback` | Fallback usage rate |
| `retryCount` | Retry frequency |

### Routing Quality Metrics

- **Cost accuracy**: |estimated - actual| / actual
- **Latency accuracy**: |estimated - actual| / actual
- **Fallback rate**: fallback requests / total requests
- **Retry rate**: retried requests / total requests

---

## Generation History

The `ai_generation_history` table provides a high-level view of AI generation activity:

| Field | Description |
|-------|-------------|
| `userId` | Requesting user |
| `type` | Generation type |
| `model` | Model used |
| `provider` | Provider used |
| `status` | Generation status |
| `creditsUsed` | Credits consumed |
| `executionTimeMs` | Execution duration |
| `inputTokens` | Input token count |
| `outputTokens` | Output token count |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/analytics` | GET | Analytics dashboard data |
| `/api/ai-gateway/metrics` | GET | Runtime metrics |
| `/api/ai-gateway/metrics/summary` | GET | Aggregated metrics summary |
| `/api/ai-gateway/routing/stats` | GET | Routing decision statistics |
| `/api/ai-gateway/requests` | GET | Request log with filtering |
| `/api/ai-gateway/requests/[id]` | GET | Individual request details |
| `/api/ai-gateway/requests/stats` | GET | Request statistics |
| `/api/ai/stats` | GET | High-level AI statistics |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/lib/db/schema/ai-gateway.ts` | aiRequestLog, aiRoutingDecision, aiRuntimeMetric tables |
| `src/lib/db/schema/ai-runtime.ts` | aiGenerationHistory, aiProviderHealth tables |
| `src/core/ai/ai-runtime.ts` | Request logging during execution |
| `src/core/ai/provider-router.ts` | Routing decision recording |
| `src/core/ai/generation-history.service.ts` | Generation history management |
| `src/app/api/ai-gateway/analytics/route.ts` | Analytics API endpoint |
| `src/app/api/ai-gateway/metrics/route.ts` | Metrics API endpoint |
