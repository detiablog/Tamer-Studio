# PROD-01: PostgreSQL Database Setup

**Document ID:** PROD-01-Database  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the PostgreSQL database setup for Tamer Studio, including connection pooling, indexing, migrations, backup/restore, replication, and monitoring.

---

## Architecture

```
App/Worker --> Connection Pool --> PostgreSQL 16
                                      |
                              +-------+-------+
                              |               |
                         Primary DB      Read Replica
                         (Read/Write)     (Read Only)
```

---

## Configuration

### Connection String

```bash
DATABASE_URL=postgresql://tamer:<password>@db:5432/tamer_studio
```

### Drizzle ORM Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
```

### Docker Compose

```yaml
db:
  image: postgres:16-alpine
  container_name: tamer-db
  restart: unless-stopped
  environment:
    POSTGRES_DB: ${POSTGRES_DB:-tamer_studio}
    POSTGRES_USER: ${POSTGRES_USER:-tamer}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  ports:
    - "${DB_PORT:-5432}:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-tamer}"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - tamer-network
```

---

## Connection Pooling

### Configuration

```typescript
// src/lib/db/client.ts
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  max: 20,           // Maximum connections
  idle_timeout: 20,  // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout
});
```

### Pool Settings

| Parameter | Value | Description |
|-----------|-------|-------------|
| `max` | 20 | Maximum pool connections |
| `idle_timeout` | 20s | Close idle connections |
| `connect_timeout` | 10s | Connection attempt timeout |

---

## Schema Management

### Schema Location

```
src/lib/db/schema/
  ├── monitoring.ts
  ├── storage.ts
  └── ...
```

### Generate Migrations

```bash
pnpm db:generate
```

### Run Migrations

```bash
pnpm db:migrate
```

### Seed Database

```bash
pnpm db:seed
```

---

## Indexes

### Recommended Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Storage Files
CREATE INDEX idx_storage_files_user_id ON storage_files(user_id);
CREATE INDEX idx_storage_files_kind ON storage_files(kind);
CREATE INDEX idx_storage_files_status ON storage_files(status);

-- Monitoring
CREATE INDEX idx_system_health_service ON system_health(service_name);
CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at);
CREATE INDEX idx_system_alerts_type ON system_alerts(type);
CREATE INDEX idx_system_incidents_status ON system_incidents(status);
```

---

## Backup and Restore

### Automated Backup

```bash
# scripts/backup-db.sh
#!/bin/bash
set -e

BACKUP_DIR="/app/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

pg_dump -U "${POSTGRES_USER:-tamer}" -d "${POSTGRES_DB:-tamer_studio}" | gzip > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

# Retention: 7 days
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
```

### Manual Backup

```bash
# From host
docker compose exec db pg_dump -U tamer tamer_studio | gzip > backup_$(date +%Y%m%d).sql.gz

# From inside container
pg_dump -U tamer tamer_studio | gzip > /app/data/backups/manual_$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# scripts/restore-db.sh
#!/bin/bash
set -e

BACKUP_FILE=$1
gunzip -c "$BACKUP_FILE" | psql -U "${POSTGRES_USER:-tamer}" -d "${POSTGRES_DB:-tamer_studio}"
```

### Restore Commands

```bash
# From host
gunzip -c backup_20260802.sql.gz | docker compose exec -T db psql -U tamer -d tamer_studio

# From backup file
./scripts/restore-db.sh /app/data/backups/db_backup_20260802_020000.sql.gz
```

---

## Replication

### Primary Configuration

```bash
# postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64
```

### Read Replica Setup

```yaml
# docker-compose.replica.yml
db-replica:
  image: postgres:16-alpine
  environment:
    POSTGRES_PRIMARY_HOST: db
    POSTGRES_PRIMARY_PORT: 5432
    POSTGRES_REPLICATION_USER: replicator
    POSTGRES_REPLICATION_PASSWORD: <password>
  command: >
    postgres
      -c hot_standby=on
      -c primary_conninfo='host=db port=5432 user=replicator password=<password>'
```

---

## Monitoring

### Health Check

```bash
# Check if PostgreSQL is accepting connections
pg_isready -U tamer

# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('tamer_studio'));

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Performance Metrics

```sql
-- Active connections
SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';

-- Slow queries (if pg_stat_statements enabled)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Cache hit ratio
SELECT sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;
```

---

## Commands

### Connect to Database

```bash
# Via Docker
docker compose exec db psql -U tamer -d tamer_studio

# Via psql (if installed locally)
psql postgresql://tamer:password@localhost:5432/tamer_studio
```

### Common Operations

```bash
# List databases
docker compose exec db psql -U tamer -l

# List tables
docker compose exec db psql -U tamer -d tamer_studio -c "\dt"

# Show table schema
docker compose exec db psql -U tamer -d tamer_studio -c "\d table_name"

# Run migration
pnpm db:migrate

# Generate migration
pnpm db:generate

# Reset database (WARNING: destructive)
docker compose exec db psql -U tamer -d tamer_studio -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm db:migrate
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| DB accepting connections | `pg_isready -U tamer` | accepting connections |
| Connection pool working | `curl http://localhost/api/health/database` | HTTP 200 |
| Migrations current | `pnpm db:migrate` | No pending migrations |
| Backup exists | `ls -la /app/data/backups/` | Recent backup file |
| Indexes created | `\di` in psql | All indexes listed |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Connection refused | `docker compose logs db` | Verify POSTGRES_PASSWORD matches DATABASE_URL |
| Too many connections | `SELECT count(*) FROM pg_stat_activity` | Increase max pool size, check for connection leaks |
| Slow queries | `EXPLAIN ANALYZE <query>` | Add indexes, optimize queries |
| Disk full | `SELECT pg_size_pretty(pg_database_size('tamer_studio'))` | Clean old data, increase disk |
| Migration fails | Check migration SQL | Fix schema conflicts, verify permissions |
| Replication lag | Check `pg_stat_replication` | Network issues, resource constraints |
