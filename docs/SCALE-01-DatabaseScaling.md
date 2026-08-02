# SCALE-01: Database Scaling

## Scope

This document covers the database scaling strategy for Tamer Studio, including connection pooling, read replicas, query optimization, sharding considerations, and migration management at scale.

## Architecture

Tamer Studio uses PostgreSQL as the primary database:

- **Connection Pooling**: PgBouncer manages connection pools to prevent connection exhaustion. Each application instance gets a pool of 10-20 connections.
- **Read Replicas**: Read-heavy queries (analytics, search, listing) route to read replicas. Writes route to the primary.
- **Query Optimization**: All frequently queried fields are indexed. Slow query logging identifies queries exceeding 500ms.
- **Partitioning**: Large tables (audit logs, analytics events) are partitioned by date for query performance.

Scaling tiers:
- **Tier 1** (1-10K users): Single PostgreSQL instance with connection pooling.
- **Tier 2** (10K-100K users): Primary + 1 read replica with PgBouncer.
- **Tier 3** (100K+ users): Primary + 3 read replicas with connection pooling and table partitioning.

## Configuration

```env
# Database
DATABASE_URL=postgresql://user:pass@primary:5432/tamer
DATABASE_REPLICA_URL=postgresql://user:pass@replica:5432/tamer
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=5000

# PgBouncer
PGBOUNCER_POOL_MODE=transaction
PGBOUNCER_MAX_CLIENT_CONN=1000
PGBOUNCER_DEFAULT_POOL_SIZE=20

# Monitoring
SLOW_QUERY_THRESHOLD=500
SLOW_QUERY_LOG=true
EXPLAIN_ANALYZE_ENABLED=false
```

## Commands

```bash
# Check connection pool status
pnpm db:pool-status

# View slow queries
pnpm db:slow-queries --threshold 500

# Run database migrations
pnpm db:migrate

# Create read replica
pnpm db:create-replica --region us-east-1

# View replication lag
pnpm db:replication-lag
```

## Verification

- Connection pool utilization stays below 80% under peak load.
- Read replica lag is under 1 second for 99th percentile.
- No query exceeds 2 seconds under normal operating conditions.
- Connection pool recovers within 30 seconds after a database restart.
