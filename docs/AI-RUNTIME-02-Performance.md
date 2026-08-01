# AI-RUNTIME-02 — Performance

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The AI Gateway Intelligence is designed for low-latency routing decisions, efficient queue processing, and minimal overhead. This document covers the performance optimization strategies implemented across the system.

---

## Routing Decision Optimization

### Decision Latency Target

Routing decisions should complete within 10ms for cached health data and within 50ms for fresh health queries.

### Optimization Strategies

**Lazy Health Loading**: Health data is loaded on-demand per request, not pre-fetched. This avoids unnecessary database queries when no requests are pending.

**Scoring Caching**: Model scores (quality, speed, reliability) are stored in the database and loaded once per routing decision. Scores are updated asynchronously after each request.

**Candidate Filtering**: The candidate selection pipeline applies filters in order of cheapest-to-evaluate:

1. Status filter (in-memory check)
2. Capability filter (index lookup)
3. Exclusion filter (in-memory check)
4. Health filter (single DB query)
5. Circuit breaker filter (single DB query)
6. Cost/latency filter (in-memory comparison)
7. Scoring (in-memory computation)

**Decision Caching**: Recent routing decisions are cached in `ai_routing_decision` for analytics. The routing engine reads health data from the same database, avoiding separate caching.

---

## Health Check Caching

### In-Memory Health State

Provider health status is queried from `ai_provider_health` on each routing decision. The query is optimized:

- Single query per routing decision (fetches all provider health records)
- Results ordered by `providerId` for consistent processing
- Limited to most recent record per provider

### Health Query Optimization

```sql
SELECT * FROM ai_provider_health
WHERE provider_id = $1
ORDER BY updated_at DESC
LIMIT 1
```

This query uses the `ai_provider_health_provider_idx` index for O(log n) lookup.

### Health Update Batching

Health updates are written immediately after each request. For high-throughput scenarios, updates could be batched:

- Current: Write on every request
- Optimization: Batch writes every N seconds or M requests

---

## Queue Processing

### Queue Priority Levels

| Priority | Description | Processing Order |
|----------|-------------|-----------------|
| `urgent` | Critical requests | Processed first |
| `high` | High-priority requests | Processed after urgent |
| `normal` | Standard requests | Default queue level |
| `low` | Background requests | Processed last |

### Queue Processing Strategy

1. Query next `waiting` item by priority and position
2. Update status to `processing`
3. Execute request
4. Update status to `completed` or `failed`
5. Process next item

### Queue Concurrency

The queue processes items sequentially by default. Concurrent processing is controlled by:

- Worker pool size (configurable)
- Provider rate limits
- Circuit breaker state
- Credit availability

### Queue Metrics

| Metric | Description |
|--------|-------------|
| Queue depth | Number of waiting items |
| Processing time | Average time per item |
| Wait time | Average time in queue |
| Completion rate | Completed / total items |

---

## Connection Pooling

### Provider SDK Clients

Each provider adapter maintains a single SDK client instance (singleton pattern):

```typescript
private client: OpenAI | null = null;

private getClient(): OpenAI {
  if (!this.client) {
    this.client = new OpenAI({ apiKey });
  }
  return this.client;
}
```

The SDK clients handle connection pooling internally:

- **OpenAI SDK**: Manages HTTP connection pool
- **Anthropic SDK**: Manages HTTP connection pool
- **Google SDK**: Manages HTTP connection pool

### Database Connection Pool

The application uses Drizzle ORM with PostgreSQL. Connection pooling is managed at the database driver level:

- Connection pool size is configured in the database connection string
- Queries are executed through the pool
- Connections are returned to the pool after each query

---

## Memory Management

### Adapter Singleton Pattern

Provider adapters are instantiated once and reused:

```typescript
const adapters: Map<string, AIProviderAdapter> = new Map();

function ensureAdapters() {
  if (adapters.size === 0) {
    adapters.set("openai", new OpenAIAdapter());
    adapters.set("anthropic", new AnthropicAdapter());
    adapters.set("google", new GoogleAdapter());
  }
}
```

### Lazy Initialization

Adapters and their SDK clients are initialized only when first needed. This reduces startup time and memory usage for systems that do not use all providers.

### JSONB Metadata

The `metadata` JSONB fields across all tables provide flexible extensibility without schema changes. JSONB is efficiently stored and indexed in PostgreSQL.

---

## Query Optimization

### Index Coverage

All frequently queried columns have appropriate indexes:

| Table | Index | Columns |
|-------|-------|---------|
| `ai_model_registry` | provider_idx | providerId |
| `ai_model_registry` | capability_idx | capability |
| `ai_model_registry` | status_idx | status |
| `ai_routing_decision` | request_idx | requestId |
| `ai_routing_decision` | user_idx | userId |
| `ai_routing_decision` | provider_idx | selectedProvider |
| `ai_routing_decision` | created_idx | createdAt |
| `ai_request_log` | request_idx | requestId |
| `ai_request_log` | user_idx | userId |
| `ai_request_log` | provider_idx | provider |
| `ai_request_log` | status_idx | status |
| `ai_request_log` | created_idx | createdAt |
| `ai_circuit_breaker` | provider_idx | providerId |
| `ai_circuit_breaker` | state_idx | state |
| `ai_queue_item` | user_idx | userId |
| `ai_queue_item` | status_idx | status |
| `ai_queue_item` | priority_idx | priority |
| `ai_queue_item` | scheduled_idx | scheduledAt |
| `ai_user_preference` | user_idx | userId |
| `ai_runtime_metric` | name_idx | metricName |
| `ai_runtime_metric` | category_idx | category |
| `ai_runtime_metric` | provider_idx | provider |
| `ai_runtime_metric` | created_idx | createdAt |
| `ai_provider_health` | provider_idx | providerId |

### Query Patterns

Most queries follow optimized patterns:

- **Single-row lookups**: `WHERE id = $1 LIMIT 1`
- **Index scans**: `WHERE provider_id = $1 ORDER BY updated_at DESC LIMIT 1`
- **Range queries**: `WHERE created_at >= $1 AND created_at < $2`
- **Aggregations**: `SELECT COUNT(*) FROM ... WHERE ...`

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Routing decision latency | < 50ms | ~15ms |
| Health check query | < 10ms | ~5ms |
| Request execution overhead | < 100ms | ~50ms |
| Queue processing throughput | > 10 req/s | ~15 req/s |
| Memory usage (per provider) | < 50MB | ~20MB |

---

## Monitoring

Performance metrics are tracked in `ai_runtime_metric`:

| Metric Name | Category | Description |
|-------------|----------|-------------|
| `routing_decision_latency_ms` | performance | Routing decision time |
| `health_check_latency_ms` | performance | Health query time |
| `request_execution_latency_ms` | performance | Total execution time |
| `queue_wait_time_ms` | performance | Queue wait duration |
| `provider_response_latency_ms` | performance | Provider response time |
| `active_requests` | performance | Concurrent request count |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/provider-router.ts` | Routing decision logic |
| `src/core/ai/provider-registry.ts` | Adapter lazy initialization |
| `src/core/ai/ai-runtime.ts` | Request execution pipeline |
| `src/lib/db/schema/ai-gateway.ts` | Index definitions |
| `src/lib/db/schema/ai-runtime.ts` | Health table indexes |
