# AI-RUNTIME-02 — Fallback Engine

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Fallback Engine implements automatic failover when the selected provider fails. It ensures request completion by retrying with the same provider and, if retries are exhausted, falling back to alternative providers.

---

## Fallback Strategies

### Immediate Retry

The first response to a failure is an immediate retry with the same provider, subject to retry conditions.

### Provider Failover

If retries with the primary provider are exhausted, the engine selects an alternative provider from the fallback chain.

### Fallback Chain

The fallback chain follows provider priority ordering:

```
Primary Provider (selected by Routing Engine)
    |
    v (failure + retries exhausted)
Fallback Provider 1 (next available healthy provider)
    |
    v (failure + retries exhausted)
Fallback Provider 2 (next available healthy provider)
    |
    v (all providers exhausted)
Error Response
```

---

## Retry Logic

### Retry Conditions

Requests are retried when the provider returns:

| Condition | HTTP Status | Description |
|-----------|-------------|-------------|
| Rate Limited | 429 | Too many requests |
| Server Error | 500 | Internal server error |
| Bad Gateway | 502 | Upstream server error |
| Service Unavailable | 503 | Provider temporarily unavailable |
| Gateway Timeout | 504 | Request timeout |
| Network Error | N/A | Connection failure, DNS resolution failure |
| Timeout | N/A | Request exceeded timeout threshold |

### Non-Retryable Errors

The following errors are NOT retried:

| Condition | HTTP Status | Description |
|-----------|-------------|-------------|
| Bad Request | 400 | Invalid request format |
| Unauthorized | 401 | Invalid API key |
| Forbidden | 403 | Insufficient permissions |
| Not Found | 404 | Model not found |
| Unprocessable | 422 | Invalid parameters |

---

## Exponential Backoff

Retry delays follow an exponential backoff pattern with jitter:

```
delay = min(baseDelay * 2^attempt + randomJitter, maxDelay)
```

### Configuration

| Parameter | Default Value | Description |
|-----------|--------------|-------------|
| `baseDelay` | 1000ms | Initial retry delay |
| `maxDelay` | 30000ms | Maximum retry delay |
| `jitterRange` | 500ms | Random jitter range |

### Backoff Sequence

| Attempt | Base Delay | Max with Jitter |
|---------|-----------|----------------|
| 1 | 1,000ms | 1,500ms |
| 2 | 2,000ms | 2,500ms |
| 3 | 4,000ms | 4,500ms |
| 4 | 8,000ms | 8,500ms |
| 5 | 16,000ms | 16,500ms |
| 6+ | 30,000ms (capped) | 30,500ms |

---

## Maximum Retry Count

| Parameter | Default Value | Description |
|-----------|--------------|-------------|
| `maxRetries` | 3 | Maximum retry attempts per provider |

After `maxRetries` attempts with the primary provider, the engine:

1. Records the failure in the health monitor
2. Updates the circuit breaker state
3. Selects the next available fallback provider
4. Resets the retry counter for the new provider

---

## Fallback Execution Flow

```
1. Primary provider selected by Routing Engine
2. Execute request
3. On failure:
   a. Check if error is retryable
   b. If yes, apply exponential backoff delay
   c. Retry request with same provider
   d. If retry succeeds, record success and return
   e. If retry fails, increment retry counter
4. If maxRetries exceeded:
   a. Record failure in health monitor
   b. Update circuit breaker state
   c. Select next healthy provider from fallback chain
   d. Reset retry counter
   e. Return to step 2 with new provider
5. If all providers exhausted:
   a. Record final failure
   b. Return error to caller
```

---

## Credit Handling During Fallback

- **Primary failure**: Credit reservation is released
- **Fallback success**: Credit reservation is made for the fallback provider, then adjusted based on actual usage
- **All fallbacks fail**: All reservations are released

---

## Request Queue Integration

Failed requests that are eligible for retry can be placed in the `ai_queue_item` table with status `waiting` for deferred processing. The queue manager processes these items according to their priority and scheduled time.

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/queue` | GET | List queued requests |
| `/api/ai-gateway/queue/[id]` | GET | Get queue item details |
| `/api/ai-gateway/queue/[id]/retry` | POST | Manually retry a queued request |
| `/api/ai-gateway/queue/[id]/cancel` | POST | Cancel a queued request |
| `/api/ai-gateway/queue/status` | GET | Queue status overview |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/ai-runtime.ts` | Main execution with fallback logic |
| `src/core/ai/provider-router.ts` | Provider selection for fallback |
| `src/lib/db/schema/ai-gateway.ts` | aiQueueItem table |
| `src/app/api/ai-gateway/queue/route.ts` | Queue API endpoint |
