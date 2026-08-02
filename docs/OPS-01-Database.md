# OPS-01: Database Operations

## Scope

This document describes the database monitoring and operations subsystem, covering connection health, query performance, storage metrics, and maintenance operations.

## Architecture

### Database Health Checks

| Check | Method | Interval | Timeout |
|---|---|---|---|
| Connection | TCP connect + auth | 30s | 5s |
| Query Latency | SELECT 1 with timing | 30s | 3s |
| Replication Lag | Check replica lag | 60s | 5s |
| Connection Pool | Active/idle connections | 30s | 3s |

### Database Metrics

- **Connection Status**: Online/offline status of the primary database.
- **Query Latency**: Average query response time in milliseconds.
- **Active Connections**: Number of currently active database connections.
- **Idle Connections**: Number of idle connections in the pool.
- **Database Size**: Total size of the database.
- **Table Count**: Number of tables in the database.
- **Replication Lag**: Delay between primary and replica (if applicable).

### Maintenance Operations

- **Vacuum**: Reclaim storage from deleted rows.
- **Analyze**: Update query planner statistics.
- **Reindex**: Rebuild indexes for optimal performance.
- **Backup**: Create database backup.
- **Restore**: Restore database from backup.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `DB_CHECK_INTERVAL` | `30000` | Database health check interval (ms) |
| `DB_QUERY_TIMEOUT` | `3000` | Query timeout for health checks (ms) |
| `DB_CONNECTION_POOL_SIZE` | `20` | Maximum database connections |
| `DB_BACKUP_RETENTION_DAYS` | `30` | Days to retain database backups |
| `DB_REPLICA_LAG_THRESHOLD` | `1000` | Replication lag warning threshold (ms) |

## Commands

```bash
# Check database health
pnpm ops:db-health

# View database metrics
pnpm ops:db-metrics

# View active connections
pnpm ops:db-connections

# Run database vacuum
pnpm ops:db-vacuum

# Run database analyze
pnpm ops:db-analyze

# Create database backup
pnpm ops:db-backup --name "pre-deploy-$(date +%Y%m%d)"

# View backup history
pnpm ops:db-backups

# Restore from backup
pnpm ops:db-restore --backup <backup-id>
```

## Verification

- Database health check returns status within the configured interval.
- Query latency is measured and displayed in real-time.
- Active and idle connection counts are accurate.
- Database size and table count are reported correctly.
- Vacuum and analyze operations complete successfully.
- Backups are created and can be restored.
- Replication lag is monitored when replicas are configured.
