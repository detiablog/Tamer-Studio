# AI-RUNTIME-02 — Database Design

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The AI Gateway Intelligence uses 8 dedicated tables defined in `src/lib/db/schema/ai-gateway.ts`, plus supporting tables from `ai-runtime.ts`, `ai-providers.ts`, and `ai-admin.ts`. The schema is managed by Drizzle ORM with PostgreSQL.

---

## Core Gateway Tables (ai-gateway.ts)

### 1. ai_model_registry

Stores metadata for all known AI models across providers.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `providerId` | text | NOT NULL | Provider identifier |
| `modelId` | varchar(200) | NOT NULL | Provider-specific model ID |
| `displayName` | varchar(200) | NOT NULL | Human-readable name |
| `capability` | varchar(100) | NOT NULL | Primary capability |
| `status` | varchar(50) | DEFAULT 'active' | Model status |
| `costPer1kInput` | real | DEFAULT 0 | Input cost per 1K tokens |
| `costPer1kOutput` | real | DEFAULT 0 | Output cost per 1K tokens |
| `avgLatencyMs` | integer | DEFAULT 0 | Average latency |
| `contextWindow` | integer | DEFAULT 0 | Max context tokens |
| `maxOutput` | integer | DEFAULT 0 | Max output tokens |
| `supportsStreaming` | boolean | DEFAULT false | Streaming support |
| `supportsVision` | boolean | DEFAULT false | Vision support |
| `supportsJson` | boolean | DEFAULT false | JSON mode support |
| `supportsToolCalling` | boolean | DEFAULT false | Tool calling support |
| `supportsImageInput` | boolean | DEFAULT false | Image input support |
| `supportsVideo` | boolean | DEFAULT false | Video support |
| `supportsAudio` | boolean | DEFAULT false | Audio support |
| `supportsBatch` | boolean | DEFAULT false | Batch support |
| `supportsStructuredOutput` | boolean | DEFAULT false | Structured output support |
| `qualityScore` | integer | DEFAULT 50 | Quality rating (0-100) |
| `speedScore` | integer | DEFAULT 50 | Speed rating (0-100) |
| `reliabilityScore` | integer | DEFAULT 50 | Reliability rating (0-100) |
| `version` | varchar(50) | nullable | Model version |
| `deprecationStatus` | varchar(50) | nullable | Deprecation status |
| `replacementModel` | varchar(200) | nullable | Recommended replacement |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Creation time |
| `updatedAt` | timestamp | DEFAULT NOW() | Last update time |

**Indexes:**
- `ai_model_registry_provider_model_unique` UNIQUE on (providerId, modelId)
- `ai_model_registry_provider_idx` on (providerId)
- `ai_model_registry_capability_idx` on (capability)
- `ai_model_registry_status_idx` on (status)

---

### 2. ai_capability_registry

Defines supported AI capabilities.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `name` | varchar(100) | NOT NULL, UNIQUE | Capability identifier |
| `displayName` | varchar(200) | NOT NULL | Human-readable name |
| `description` | text | nullable | Capability description |
| `category` | varchar(100) | nullable | Capability category |
| `isEnabled` | boolean | DEFAULT true | Whether enabled |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Creation time |
| `updatedAt` | timestamp | DEFAULT NOW() | Last update time |

---

### 3. ai_routing_decision

Records every routing decision for audit and analytics.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `requestId` | varchar(100) | NOT NULL | Request identifier |
| `userId` | text | nullable | Requesting user |
| `capability` | varchar(100) | nullable | Requested capability |
| `selectedProvider` | varchar(100) | NOT NULL | Chosen provider |
| `selectedModel` | varchar(200) | NOT NULL | Chosen model |
| `fallbackProvider` | varchar(100) | nullable | Fallback provider |
| `fallbackModel` | varchar(200) | nullable | Fallback model |
| `reason` | text | nullable | Decision rationale |
| `estimatedCost` | real | DEFAULT 0 | Pre-execution cost estimate |
| `actualCost` | real | DEFAULT 0 | Post-execution actual cost |
| `estimatedLatencyMs` | integer | DEFAULT 0 | Expected latency |
| `actualLatencyMs` | integer | DEFAULT 0 | Measured latency |
| `qualityScore` | integer | DEFAULT 0 | Model quality score |
| `wasFallback` | boolean | DEFAULT false | Fallback used |
| `retryCount` | integer | DEFAULT 0 | Retry count |
| `routingStrategy` | varchar(100) | nullable | Strategy used |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Decision timestamp |

**Indexes:**
- `ai_routing_decision_request_idx` on (requestId)
- `ai_routing_decision_user_idx` on (userId)
- `ai_routing_decision_provider_idx` on (selectedProvider)
- `ai_routing_decision_created_idx` on (createdAt)

---

### 4. ai_request_log

Full telemetry log for every AI request.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `requestId` | varchar(100) | NOT NULL | Request identifier |
| `userId` | text | nullable | Requesting user |
| `workspaceId` | text | nullable | Associated workspace |
| `provider` | varchar(100) | NOT NULL | Provider used |
| `model` | varchar(200) | NOT NULL | Model used |
| `capability` | varchar(100) | nullable | Requested capability |
| `status` | varchar(50) | DEFAULT 'pending' | Request status |
| `promptTokens` | integer | DEFAULT 0 | Input tokens |
| `completionTokens` | integer | DEFAULT 0 | Output tokens |
| `totalTokens` | integer | DEFAULT 0 | Total tokens |
| `creditsUsed` | integer | DEFAULT 0 | Credits consumed |
| `costUsd` | real | DEFAULT 0 | Cost in USD |
| `latencyMs` | integer | DEFAULT 0 | Response latency |
| `queueTimeMs` | integer | DEFAULT 0 | Queue wait time |
| `wasFallback` | boolean | DEFAULT false | Fallback used |
| `retryCount` | integer | DEFAULT 0 | Retry count |
| `error` | text | nullable | Error message |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Request timestamp |

**Indexes:**
- `ai_request_log_request_idx` on (requestId)
- `ai_request_log_user_idx` on (userId)
- `ai_request_log_provider_idx` on (provider)
- `ai_request_log_status_idx` on (status)
- `ai_request_log_created_idx` on (createdAt)

---

### 5. ai_circuit_breaker

Circuit breaker state per provider.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `providerId` | varchar(100) | NOT NULL, UNIQUE | Provider identifier |
| `state` | varchar(50) | DEFAULT 'closed' | Circuit state |
| `failureCount` | integer | DEFAULT 0 | Consecutive failures |
| `successCount` | integer | DEFAULT 0 | Success count (half-open) |
| `lastFailureAt` | timestamp | nullable | Last failure time |
| `lastSuccessAt` | timestamp | nullable | Last success time |
| `lastStateChangeAt` | timestamp | DEFAULT NOW() | Last state transition |
| `failureThreshold` | integer | DEFAULT 5 | Failures to open |
| `recoveryTimeoutMs` | integer | DEFAULT 30000 | Recovery timeout (ms) |
| `halfOpenMaxAttempts` | integer | DEFAULT 3 | Probe attempts |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Creation time |
| `updatedAt` | timestamp | DEFAULT NOW() | Last update time |

**Indexes:**
- `ai_circuit_breaker_provider_idx` on (providerId)
- `ai_circuit_breaker_state_idx` on (state)

---

### 6. ai_queue_item

Request queue with priority scheduling.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `userId` | text | nullable | Requesting user |
| `requestId` | varchar(100) | NOT NULL | Request identifier |
| `status` | varchar(50) | DEFAULT 'waiting' | Queue status |
| `priority` | varchar(50) | DEFAULT 'normal' | Priority level |
| `capability` | varchar(100) | nullable | Requested capability |
| `provider` | varchar(100) | nullable | Assigned provider |
| `model` | varchar(200) | nullable | Assigned model |
| `estimatedCredits` | integer | DEFAULT 0 | Estimated credit cost |
| `position` | integer | NOT NULL | Queue position |
| `scheduledAt` | timestamp | nullable | Scheduled execution time |
| `startedAt` | timestamp | nullable | Execution start time |
| `completedAt` | timestamp | nullable | Execution completion time |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Creation time |
| `updatedAt` | timestamp | DEFAULT NOW() | Last update time |

**Indexes:**
- `ai_queue_item_user_idx` on (userId)
- `ai_queue_item_status_idx` on (status)
- `ai_queue_item_priority_idx` on (priority)
- `ai_queue_item_scheduled_idx` on (scheduledAt)

---

### 7. ai_user_preference

Per-user routing preferences.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `userId` | text | NOT NULL, UNIQUE | User identifier |
| `mode` | varchar(50) | DEFAULT 'balanced' | Routing strategy |
| `maxCostPerRequest` | real | nullable | Max cost threshold (USD) |
| `maxLatencyMs` | integer | nullable | Max latency threshold (ms) |
| `preferredProviders` | jsonb | DEFAULT [] | Preferred provider list |
| `preferredModels` | jsonb | DEFAULT [] | Preferred model list |
| `excludedProviders` | jsonb | DEFAULT [] | Excluded provider list |
| `excludedModels` | jsonb | DEFAULT [] | Excluded model list |
| `metadata` | jsonb | DEFAULT {} | Extensible metadata |
| `createdAt` | timestamp | DEFAULT NOW() | Creation time |
| `updatedAt` | timestamp | DEFAULT NOW() | Last update time |

**Indexes:**
- `ai_user_pref_user_idx` on (userId)

---

### 8. ai_runtime_metric

Dimensional runtime metrics for time-series analysis.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | text | PK | Record identifier |
| `metricName` | varchar(100) | NOT NULL | Metric name |
| `category` | varchar(100) | NOT NULL | Metric category |
| `value` | real | NOT NULL | Metric value |
| `unit` | varchar(50) | nullable | Unit of measurement |
| `provider` | varchar(100) | nullable | Provider dimension |
| `model` | varchar(200) | nullable | Model dimension |
| `dimensions` | jsonb | DEFAULT {} | Additional dimensions |
| `createdAt` | timestamp | DEFAULT NOW() | Measurement timestamp |

**Indexes:**
- `ai_metric_name_idx` on (metricName)
- `ai_metric_category_idx` on (category)
- `ai_metric_provider_idx` on (provider)
- `ai_metric_created_idx` on (createdAt)

---

## Relations

All gateway tables use standalone relation definitions (no foreign keys) for flexibility:

```typescript
export const aiModelRegistryRelations = relations(aiModelRegistry, ({ one }) => ({}));
export const aiCapabilityRegistryRelations = relations(aiCapabilityRegistry, ({ one }) => ({}));
export const aiRoutingDecisionRelations = relations(aiRoutingDecision, ({ one }) => ({}));
export const aiRequestLogRelations = relations(aiRequestLog, ({ one }) => ({}));
export const aiCircuitBreakerRelations = relations(aiCircuitBreaker, ({ one }) => ({}));
export const aiQueueItemRelations = relations(aiQueueItem, ({ one }) => ({}));
export const aiUserPreferenceRelations = relations(aiUserPreference, ({ one }) => ({}));
export const aiRuntimeMetricRelations = relations(aiRuntimeMetric, ({ one }) => ({}));
```

---

## Supporting Tables

### ai-runtime.ts

| Table | Purpose |
|-------|---------|
| `ai_provider_health` | Provider health tracking |
| `ai_prompt_template` | Prompt template management |
| `ai_generation_history` | Generation history tracking |

### ai-providers.ts

| Table | Purpose |
|-------|---------|
| `ai_provider` | Provider configuration |
| `ai_provider_model` | Provider-model associations |

### ai-admin.ts

| Table | Purpose |
|-------|---------|
| `ai_feature_flag` | Feature flags |
| `ai_routing_rule` | Configurable routing rules |
| `ai_runtime_setting` | Runtime key-value settings |
| `ai_safety_policy` | Safety policies |
| `ai_admin_action` | Admin action audit log |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/lib/db/schema/ai-gateway.ts` | 8 core gateway tables |
| `src/lib/db/schema/ai-runtime.ts` | Health, prompts, generation history |
| `src/lib/db/schema/ai-providers.ts` | Provider and model configuration |
| `src/lib/db/schema/ai-admin.ts` | Admin features, rules, settings |
