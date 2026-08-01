# AI-RUNTIME-02 — Health Monitoring

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Health Monitoring system tracks real-time and historical health status of all AI providers. It feeds health data into the routing engine to ensure requests are directed only to healthy providers and provides visibility into provider reliability.

---

## Provider Health Tracking

Each provider's health is tracked in the `ai_provider_health` table with the following fields:

### Identity

| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Primary key (format: `health_{hash}`) |
| `providerId` | text | Associated provider identifier |

### Status

| Field | Type | Description |
|-------|------|-------------|
| `status` | varchar(50) | Current status: `online`, `offline`, `unknown` |
| `lastCheckedAt` | timestamp | When health was last evaluated |
| `lastSuccessAt` | timestamp | When last successful request occurred |
| `lastFailureAt` | timestamp | When last failed request occurred |
| `lastError` | text | Most recent error message |

### Metrics

| Field | Type | Description |
|-------|------|-------------|
| `latencyMs` | integer | Most recent request latency |
| `successRate` | text | Success rate as percentage string (e.g., "95.5") |
| `failureRate` | text | Failure rate as percentage string (e.g., "4.5") |
| `totalRequests` | integer | Cumulative request count |
| `totalFailures` | integer | Cumulative failure count |

### Metadata

| Field | Type | Description |
|-------|------|-------------|
| `metadata` | jsonb | Extensible metadata object |
| `createdAt` | timestamp | Record creation time |
| `updatedAt` | timestamp | Record last update time |

---

## Health Metrics

### Latency

- Recorded per request as `latencyMs`
- Used for provider comparison in routing decisions
- Tracked in `ai_runtime_metric` for time-series analysis

### Success Rate

Calculated as: `((totalRequests - totalFailures) / totalRequests) * 100`

Providers with success rate below 50% are excluded from routing.

### Failure Rate

Calculated as: `(totalFailures / totalRequests) * 100`

Providers with failure rate above 50% are excluded from routing.

---

## Health Check Recording

### Recording Success

When a provider request succeeds, `ProviderRouter.recordSuccess()` is called:

1. Increments `totalRequests` by 1
2. Updates `latencyMs` to the measured latency
3. Recalculates `successRate` and `failureRate`
4. Sets `lastSuccessAt` to current time
5. Sets `status` to `online`
6. Updates `lastCheckedAt` to current time

### Recording Failure

When a provider request fails, `ProviderRouter.recordFailure()` is called:

1. Increments `totalRequests` by 1
2. Increments `totalFailures` by 1
3. Recalculates `successRate` and `failureRate`
4. Sets `lastFailureAt` to current time
5. Sets `lastError` to the error message
6. Sets `status` to `offline` if failure rate exceeds threshold
7. Updates `lastCheckedAt` to current time

### Health Check Query

`isHealthy(providerId)` checks:

1. Query the most recent health record for the provider
2. If no record exists, assume healthy (optimistic default)
3. If status is `offline`, return `false`
4. If failure rate exceeds 50%, return `false`
5. Otherwise, return `true`

---

## Historical Health Data

Health records are retained in the database for historical analysis. The system maintains:

- **Current snapshot**: Latest health record per provider
- **Cumulative metrics**: Running totals of requests and failures
- **Time-series data**: Individual health check records with timestamps
- **Metric history**: `ai_runtime_metric` entries for latency, success rate, and failure rate over time

### Retention

Health records are retained indefinitely by default. The `ai_runtime_metric` table accumulates dimensional metrics that can be aggregated for dashboards and reporting.

---

## Circuit Breaker Integration

Health monitoring feeds directly into the circuit breaker system:

| Health State | Circuit Breaker Effect |
|--------------|----------------------|
| Online, success rate > 80% | Breaker remains closed |
| Online, success rate 50-80% | Breaker remains closed (monitoring) |
| Offline, or failure rate > 50% | Breaker transitions to open |
| Recovery after timeout | Breaker transitions to half-open |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/health` | GET | List all provider health statuses |
| `/api/ai-gateway/health/[providerId]` | GET | Get specific provider health |
| `/api/ai-gateway/health/[providerId]/check` | POST | Trigger manual health check |
| `/api/ai/providers/health` | GET | Provider health with admin details |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/provider-router.ts` | ProviderRouter with health recording and checking |
| `src/lib/db/schema/ai-runtime.ts` | aiProviderHealth table definition |
| `src/lib/db/schema/ai-gateway.ts` | aiRuntimeMetric table for dimensional metrics |
| `src/app/api/ai-gateway/health/route.ts` | Health API endpoint |
