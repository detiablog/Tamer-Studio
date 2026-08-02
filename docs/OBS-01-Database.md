# OBS-01 Database

## Scope

This document describes the database schema and storage architecture for the Observability Platform, including tables, indexes, and partitioning strategies.

## Architecture

The database layer uses a hybrid storage approach:

1. **PostgreSQL** - Alert rules, dashboard configurations, and user preferences
2. **TimescaleDB** - Time-series metrics with automatic partitioning
3. **ClickHouse** - High-volume log storage with columnar compression
4. **Redis** - Real-time alert state and metric caching

### Schema Overview

#### Observability Tables

```sql
-- Alert Rules
CREATE TABLE obs_alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    condition TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Instances
CREATE TABLE obs_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES obs_alert_rules(id),
    status VARCHAR(50) NOT NULL,
    message TEXT,
    service VARCHAR(255),
    fired_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

-- Dashboard Configurations
CREATE TABLE obs_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    owner_id UUID NOT NULL,
    shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Correlation Index
CREATE TABLE obs_correlation (
    correlation_id VARCHAR(255) PRIMARY KEY,
    trace_ids TEXT[],
    services TEXT[],
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_alerts_status ON obs_alerts(status);
CREATE INDEX idx_alerts_fired_at ON obs_alerts(fired_at DESC);
CREATE INDEX idx_alerts_service ON obs_alerts(service);
CREATE INDEX idx_correlation_services ON obs_correlation USING GIN(services);
CREATE INDEX idx_dashboards_owner ON obs_dashboards(owner_id);
```

## Configuration

```yaml
database:
  postgres:
    host: "${POSTGRES_HOST}"
    port: 5432
    database: "tamer_observability"
    pool:
      min: 5
      max: 20
  timescaledb:
    enabled: true
    chunkInterval: "1d"
    compressionAfter: "7d"
  clickhouse:
    host: "${CLICKHOUSE_HOST}"
    port: 8123
    database: "tamer_logs"
  redis:
    host: "${REDIS_HOST}"
    port: 6379
    db: 2
```

## Commands

```bash
# Run database migrations
pnpm obs:db:migrate

# Check database health
pnpm obs:db:health

# Backup database
pnpm obs:db:backup

# View storage statistics
pnpm obs:db:stats
```

## Verification

- All migrations run without errors
- Connection pool handles 100 concurrent connections
- TimescaleDB chunks are compressed after 7 days
- ClickHouse log queries complete within 2 seconds
- Redis cache hit rate exceeds 80%
