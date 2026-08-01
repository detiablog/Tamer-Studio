# AI-RUNTIME-02 — API Endpoints

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The AI Gateway Intelligence exposes 26 REST endpoints organized under `/api/ai-gateway/` and `/api/ai/`. All endpoints use JSON request/response format.

---

## Authentication

| Endpoint Group | Auth Required | Description |
|---------------|--------------|-------------|
| `/api/ai-gateway/*` | Yes (User/Admin) | Gateway operations |
| `/api/ai/*` | Yes (User/Admin) | AI service operations |
| `/api/ai-providers` | Public | Provider listing (read-only) |

---

## Gateway Endpoints (/api/ai-gateway/)

### Models

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/api/ai-gateway/models` | GET | List all registered models |
| 2 | `/api/ai-gateway/models/[id]` | GET | Get model details |
| 3 | `/api/ai-gateway/models/[id]` | PUT | Update model metadata |
| 4 | `/api/ai-gateway/models/[id]/scores` | GET | Get model quality scores |

### Capabilities

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 5 | `/api/ai-gateway/capabilities` | GET | List all capabilities |
| 6 | `/api/ai-gateway/capabilities/[id]` | GET | Get capability details |

### Routing

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 7 | `/api/ai-gateway/routing` | GET | Get routing decisions |
| 8 | `/api/ai-gateway/routing/stats` | GET | Get routing statistics |
| 9 | `/api/ai-gateway/routing/preferences` | GET | Get user routing preferences |
| 10 | `/api/ai-gateway/routing/preferences` | PUT | Update user routing preferences |

### Requests

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 11 | `/api/ai-gateway/requests` | GET | List request logs |
| 12 | `/api/ai-gateway/requests/[id]` | GET | Get request details |
| 13 | `/api/ai-gateway/requests/stats` | GET | Get request statistics |

### Queue

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 14 | `/api/ai-gateway/queue` | GET | List queued requests |
| 15 | `/api/ai-gateway/queue/status` | GET | Get queue status |
| 16 | `/api/ai-gateway/queue/[id]` | GET | Get queue item details |
| 17 | `/api/ai-gateway/queue/[id]/retry` | POST | Retry queued request |
| 18 | `/api/ai-gateway/queue/[id]/cancel` | POST | Cancel queued request |

### Health

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 19 | `/api/ai-gateway/health` | GET | List provider health statuses |
| 20 | `/api/ai-gateway/health/[providerId]` | GET | Get provider health |
| 21 | `/api/ai-gateway/health/[providerId]/check` | POST | Trigger health check |

### Circuit Breakers

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 22 | `/api/ai-gateway/circuit-breakers` | GET | List circuit breaker states |
| 23 | `/api/ai-gateway/circuit-breakers/[providerId]` | GET | Get provider circuit breaker |
| 24 | `/api/ai-gateway/circuit-breakers/[providerId]/reset` | POST | Reset circuit breaker |

### Metrics & Analytics

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 25 | `/api/ai-gateway/metrics` | GET | Get runtime metrics |
| 26 | `/api/ai-gateway/metrics/summary` | GET | Get aggregated metrics |
| 27 | `/api/ai-gateway/analytics` | GET | Get analytics data |
| 28 | `/api/ai-gateway/estimate` | POST | Estimate request cost |

---

## AI Service Endpoints (/api/ai/)

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 29 | `/api/ai/providers` | GET | List providers with health |
| 30 | `/api/ai/providers/health` | GET | Provider health details |
| 31 | `/api/ai/models` | GET | List AI models |
| 32 | `/api/ai/prompts` | GET | List prompt templates |
| 33 | `/api/ai/prompts` | POST | Create prompt template |
| 34 | `/api/ai/prompts/[id]` | GET | Get prompt template |
| 35 | `/api/ai/prompts/[id]` | PUT | Update prompt template |
| 36 | `/api/ai/jobs` | GET | List AI jobs |
| 37 | `/api/ai/jobs` | POST | Create AI job |
| 38 | `/api/ai/jobs/[id]` | GET | Get job details |
| 39 | `/api/ai/jobs/[id]/cancel` | POST | Cancel job |
| 40 | `/api/ai/queue` | GET | List AI queue |
| 41 | `/api/ai/stats` | GET | AI statistics |

### Public Provider Endpoint

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 42 | `/api/ai-providers` | GET | List available providers (public) |

---

## Request/Response Formats

### GET /api/ai-gateway/models

**Response:**
```json
{
  "models": [
    {
      "id": "mdl_abc123",
      "providerId": "openai",
      "modelId": "gpt-4o",
      "displayName": "GPT-4o",
      "capability": "chat",
      "status": "active",
      "costPer1kInput": 0.0025,
      "costPer1kOutput": 0.01,
      "contextWindow": 128000,
      "maxOutput": 4096,
      "qualityScore": 85,
      "speedScore": 70,
      "reliabilityScore": 90,
      "supportsStreaming": true,
      "supportsVision": true
    }
  ]
}
```

### POST /api/ai-gateway/estimate

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "capability": "chat",
  "prompt": "Hello, world!",
  "maxTokens": 1024
}
```

**Response:**
```json
{
  "estimatedCostUsd": 0.0126,
  "estimatedCredits": 126,
  "estimatedLatencyMs": 2000,
  "provider": "openai",
  "model": "gpt-4o"
}
```

### GET /api/ai-gateway/health

**Response:**
```json
{
  "health": [
    {
      "providerId": "openai",
      "status": "online",
      "latencyMs": 1500,
      "successRate": "98.5",
      "failureRate": "1.5",
      "totalRequests": 1250,
      "totalFailures": 19,
      "lastCheckedAt": "2026-08-01T15:00:00Z",
      "lastSuccessAt": "2026-08-01T15:00:00Z"
    }
  ]
}
```

### GET /api/ai-gateway/circuit-breakers

**Response:**
```json
{
  "breakers": [
    {
      "providerId": "openai",
      "state": "closed",
      "failureCount": 0,
      "successCount": 45,
      "failureThreshold": 5,
      "recoveryTimeoutMs": 30000,
      "lastStateChangeAt": "2026-08-01T10:00:00Z"
    }
  ]
}
```

### GET /api/ai-gateway/routing/preferences

**Response:**
```json
{
  "preferences": {
    "userId": "user_abc123",
    "mode": "balanced",
    "maxCostPerRequest": 0.05,
    "maxLatencyMs": 5000,
    "preferredProviders": ["openai", "anthropic"],
    "preferredModels": ["gpt-4o", "claude-sonnet-4-20250514"],
    "excludedProviders": [],
    "excludedModels": []
  }
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `PROVIDER_UNAVAILABLE` | 503 | Provider is offline |
| `INSUFFICIENT_CREDITS` | 402 | Insufficient credits |
| `RATE_LIMITED` | 429 | Rate limit exceeded |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/app/api/ai-gateway/models/route.ts` | Models endpoint |
| `src/app/api/ai-gateway/capabilities/route.ts` | Capabilities endpoint |
| `src/app/api/ai-gateway/routing/route.ts` | Routing endpoint |
| `src/app/api/ai-gateway/requests/route.ts` | Requests endpoint |
| `src/app/api/ai-gateway/queue/route.ts` | Queue endpoint |
| `src/app/api/ai-gateway/health/route.ts` | Health endpoint |
| `src/app/api/ai-gateway/circuit-breakers/route.ts` | Circuit breakers endpoint |
| `src/app/api/ai-gateway/metrics/route.ts` | Metrics endpoint |
| `src/app/api/ai-gateway/analytics/route.ts` | Analytics endpoint |
| `src/app/api/ai-gateway/estimate/route.ts` | Estimate endpoint |
| `src/app/api/ai-providers/route.ts` | Public providers endpoint |
