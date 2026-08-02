# OPS-01: Performance

## Scope

This document describes the performance characteristics of the Operations Center, including load times, query optimization, caching strategies, and scalability considerations.

## Architecture

### Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Dashboard Load Time | < 2s | Time to interactive |
| API Response Time | < 200ms | p95 latency |
| Health Check Execution | < 5s | Per-service check |
| Alert Evaluation | < 10s | Full rule evaluation cycle |
| Report Generation | < 30s | Standard report |
| Audit Log Query | < 500ms | p95 latency |

### Caching Strategy

- **Health Status**: Redis cache with 60s TTL for latest health check results.
- **System Overview**: Redis cache with 10s TTL for overview dashboard data.
- **Metrics**: Redis cache with 30s TTL for metric aggregation results.
- **Settings**: In-memory cache with 5-minute refresh for operations settings.

### Query Optimization

- Audit log queries use composite indexes on (action, created_at) and (entity_type, created_at).
- Alert queries use indexes on (status, severity) and (created_at).
- Health check queries use indexes on (service, checked_at).
- Report queries use indexes on (type, period, generated_at).

### Database Optimization

- Connection pooling with configurable pool size (default: 20).
- Read replicas for dashboard queries (when configured).
- Partitioning for audit logs by month (when data volume warrants).
- Regular VACUUM and ANALYZE for query planner statistics.

### Frontend Optimization

- React Server Components for initial data loading.
- SWR for client-side data fetching with optimistic updates.
- Lazy loading for chart components and heavy visualizations.
- Debounced search and filter inputs.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `CACHE_TTL_HEALTH` | `60000` | Health status cache TTL (ms) |
| `CACHE_TTL_OVERVIEW` | `10000` | Overview cache TTL (ms) |
| `CACHE_TTL_METRICS` | `30000` | Metrics cache TTL (ms) |
| `CACHE_TTL_SETTINGS` | `300000` | Settings cache TTL (ms) |
| `DB_POOL_SIZE` | `20` | Database connection pool size |
| `API_TIMEOUT` | `30000` | API response timeout (ms) |

## Commands

```bash
# Run performance benchmark
pnpm ops:bench

# Clear all caches
pnpm ops:cache-clear

# View cache hit rates
pnpm ops:cache-stats

# Analyze slow queries
pnpm ops:db-slow-queries --threshold 100ms

# View connection pool stats
pnpm ops:db-pool-stats
```

## Verification

- Dashboard loads within 2 seconds under normal load.
- API responses are within 200ms p95 latency.
- Cache hit rates exceed 80% for frequently accessed data.
- Health checks complete within 5 seconds per service.
- Audit log queries with pagination complete within 500ms.
- No memory leaks detected in long-running processes.
- Connection pool utilization remains below 80% under normal load.
