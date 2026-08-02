# SCALE-01: Database

## Scope

This document covers the database architecture and scaling considerations for Tamer Studio, including schema design, indexing strategies, connection management, and data growth projections.

## Architecture

Tamer Studio uses PostgreSQL with the following scaling approach:

- **Schema Design**: Normalized schema with strategic denormalization for read-heavy queries. JSONB columns for flexible metadata.
- **Indexing**: Composite indexes for frequently joined queries. Partial indexes for filtered queries. GIN indexes for JSONB columns.
- **Partitioning**: Time-based partitioning for audit logs, analytics events, and job history tables.
- **Connection Management**: PgBouncer in transaction mode. Connection pooling per application instance.

Data growth considerations:
- Audit logs: ~1GB per 100K events. Partition monthly.
- Analytics events: ~500MB per 1M events. Partition weekly.
- Job history: ~200MB per 1M jobs. Partition monthly.
- User data: ~10KB per user. Minimal growth.
- Generated media metadata: ~1KB per asset. Moderate growth.

## Configuration

```env
# Connection pooling
DATABASE_URL=postgresql://user:pass@host:5432/tamer
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30000

# Read replicas
DATABASE_READ_REPLICAS=1
DATABASE_READ_REPLICA_URL=postgresql://user:pass@replica:5432/tamer

# Partitioning
DB_PARTITION_ENABLED=true
DB_PARTITION_INTERVAL=monthly
DB_PARTITION_RETENTION=12

# Maintenance
DB_VACUUM_SCHEDULE=weekly
DB_ANALYZE_SCHEDULE=daily
DB_REINDEX_SCHEDULE=monthly
```

## Commands

```bash
# Analyze database size
pnpm db:analyze-size

# View slow queries
pnpm db:slow-queries --threshold 500

# Run vacuum
pnpm db:vacuum --analyze

# Check index usage
pnpm db:index-usage

# View table statistics
pnpm db:table-stats
```

## Verification

- Database size stays within storage budget projections.
- All frequently used queries have appropriate indexes (no sequential scans on large tables).
- Connection pool utilization stays below 80% under peak load.
- Read replica lag stays under 1 second for 99th percentile.
