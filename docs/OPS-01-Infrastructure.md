# OPS-01: Infrastructure Monitoring

## Scope

This document describes the infrastructure monitoring subsystem of the Operations Center, covering CPU, memory, disk, database, Redis, and storage health checks.

## Architecture

### Monitoring Targets

| Target | Check Method | Interval | Threshold |
|---|---|---|---|
| CPU Usage | OS-level metric collection | 30s | Warning: 80%, Critical: 95% |
| Memory Usage | OS-level metric collection | 30s | Warning: 85%, Critical: 95% |
| Disk Usage | Filesystem stat | 60s | Warning: 80%, Critical: 90% |
| PostgreSQL | TCP connection + query ping | 30s | Timeout: 5s |
| Redis | PING command | 15s | Timeout: 3s |
| Storage (S3) | HEAD request to bucket | 60s | Timeout: 10s |

### Health Check Pipeline

```
Metric Collector --> Metric Store (PostgreSQL) --> Threshold Evaluator --> Alert Engine
       |                                                    |
       v                                                    v
  Redis Cache (latest values)                      Alert Notifications
```

### Data Schema

Health check results are stored with the following fields:

- `service`: Service identifier (e.g., "postgres", "redis", "storage")
- `status`: Health status ("healthy", "warning", "critical", "offline")
- `latency_ms`: Response time in milliseconds
- `metadata`: Additional check-specific data (e.g., disk_free_gb, memory_used_mb)
- `checked_at`: Timestamp of the check

### Redis Caching

Latest health check results are cached in Redis with a short TTL (60s) to reduce database load during dashboard rendering. Cache key pattern: `ops:health:{service_id}`.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `DB_HEALTH_TIMEOUT_MS` | `5000` | PostgreSQL health check timeout |
| `REDIS_HEALTH_TIMEOUT_MS` | `3000` | Redis health check timeout |
| `STORAGE_HEALTH_TIMEOUT_MS` | `10000` | Storage health check timeout |
| `CPU_WARNING_THRESHOLD` | `80` | CPU warning threshold percentage |
| `CPU_CRITICAL_THRESHOLD` | `95` | CPU critical threshold percentage |
| `MEMORY_WARNING_THRESHOLD` | `85` | Memory warning threshold percentage |
| `DISK_WARNING_THRESHOLD` | `80` | Disk warning threshold percentage |
| `METRIC_RETENTION_DAYS` | `90` | Days to retain health check data |

## Commands

```bash
# Run single health check for all services
pnpm ops:health-check

# Run health check for a specific service
pnpm ops:health-check --service postgres

# View latest health status
pnpm ops:status

# Clean up old health check data
pnpm ops:cleanup-metrics --older-than 90d
```

## Verification

- All monitored services appear in the Infrastructure tab with real-time status.
- Health check intervals match configured values.
- Status transitions from healthy to warning/critical generate alerts.
- Redis cache is populated with latest health data.
- Historical health data is retained per retention policy.
- Manual health check trigger returns results within timeout.
