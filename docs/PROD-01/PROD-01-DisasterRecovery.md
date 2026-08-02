# PROD-01: Disaster Recovery Plan

**Document ID:** PROD-01-DisasterRecovery  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the disaster recovery (DR) plan for Tamer Studio, including RTO/RPO targets, recovery procedures, database restore, storage restore, and queue recovery.

---

## RTO/RPO Targets

| Metric | Target | Description |
|--------|--------|-------------|
| RTO (Recovery Time Objective) | 4 hours | Maximum acceptable downtime |
| RPO (Recovery Point Objective) | 1 hour | Maximum acceptable data loss |
| MTTR (Mean Time To Recovery) | 2 hours | Average recovery time |

### Severity Levels

| Level | Description | Response Time | Recovery Target |
|-------|-------------|---------------|-----------------|
| P1 - Critical | Complete system outage | 15 minutes | 2 hours |
| P2 - Major | Core functionality affected | 30 minutes | 4 hours |
| P3 - Minor | Non-critical features affected | 2 hours | 8 hours |
| P4 - Low | Cosmetic or minor issues | 24 hours | 48 hours |

---

## Disaster Scenarios

### Scenario 1: Database Failure

**Impact:** Complete application outage  
**RTO:** 2 hours  
**RPO:** 1 hour

**Recovery Steps:**

```bash
# 1. Stop application
docker compose stop app worker

# 2. Assess damage
docker compose exec db pg_isready
docker compose logs --tail=100 db

# 3. If database is corrupted, restore from backup
./scripts/restore-db.sh /app/data/backups/db_backup_latest.sql.gz

# 4. If database is completely lost, recreate
docker compose down db
docker volume rm tamer-studio_postgres-data
docker compose up -d db
sleep 30
./scripts/restore-db.sh /app/data/backups/db_backup_latest.sql.gz

# 5. Restart application
docker compose up -d app worker

# 6. Verify
./scripts/verify-deployment.sh
```

### Scenario 2: Redis Failure

**Impact:** Caching and rate limiting unavailable  
**RTO:** 30 minutes  
**RPO:** 0 (cache is ephemeral)

**Recovery Steps:**

```bash
# 1. Stop Redis
docker compose stop redis

# 2. Clear corrupted data
docker volume rm tamer-studio_redis-data

# 3. Restart Redis
docker compose up -d redis

# 4. Verify
docker compose exec redis redis-cli ping
```

### Scenario 3: Application Server Failure

**Impact:** Web application unavailable  
**RTO:** 30 minutes  
**RPO:** 0

**Recovery Steps:**

```bash
# 1. Stop failed container
docker compose stop app

# 2. Rebuild and restart
docker compose up -d --build app

# 3. Verify
./scripts/health-check.sh
```

### Scenario 4: Storage Provider Failure

**Impact:** File uploads/downloads unavailable  
**RTO:** 4 hours  
**RPO:** Last successful backup

**Recovery Steps:**

```bash
# 1. Check storage provider status
curl -I https://your-storage-endpoint.com

# 2. If provider is down, switch to backup provider
# Update STORAGE_PROVIDER in .env
# Restart application
docker compose restart app worker

# 3. If data is lost, restore from backup
# Download backup from off-site storage
aws s3 sync s3://tamer-studio-backups/assets/ /app/data/uploads/

# 4. Verify
curl http://localhost/api/health/storage
```

### Scenario 5: Complete Server Failure

**Impact:** All services unavailable  
**RTO:** 4 hours  
**RPO:** 1 hour

**Recovery Steps:**

```bash
# 1. Provision new server
# Install Docker, Docker Compose

# 2. Clone repository
git clone <repository-url>
cd Tamer-Studio

# 3. Restore configuration
# Copy .env from secure backup
# Copy config/nginx/ from backup

# 4. Restore database
# Download latest backup from off-site
./scripts/restore-db.sh latest_backup.sql.gz

# 5. Restore assets
# Download asset backup from off-site
tar xzf assets_backup.tar.gz -C /app/data/

# 6. Start services
docker compose up -d

# 7. Verify
./scripts/verify-deployment.sh
```

---

## Recovery Procedures

### Database Restore

```bash
# List available backups
ls -la /app/data/backups/

# Restore specific backup
./scripts/restore-db.sh /app/data/backups/db_backup_20260802_020000.sql.gz

# Verify restore
docker compose exec db psql -U tamer -d tamer_studio -c "\dt"
```

### Storage Restore

```bash
# Download from off-site
aws s3 sync s3://tamer-studio-backups/assets/ /app/data/uploads/

# Or restore from local backup
tar xzf /app/data/backups/assets_20260802.tar.gz -C /app/data/
```

### Queue Recovery

```bash
# Check queue status
docker compose exec redis redis-cli LLEN "job:queue"
docker compose exec redis redis-cli LLEN "job:failed"

# Retry failed jobs
curl -X POST http://localhost/api/jobs/retry-all-failed

# Clear stuck jobs
docker compose exec redis redis-cli DEL "job:processing"
```

---

## Communication Plan

### Internal Notification

| Stage | Channel | Message |
|-------|---------|---------|
| Detection | Slack/Email | "P1 incident declared: [description]" |
| Investigation | Slack | "Investigating: [findings]" |
| Resolution | Slack/Email | "Resolved: [summary]" |

### External Notification

| Stage | Channel | Message |
|-------|---------|---------|
| Impact | Status page | "Service degraded: [details]" |
| Resolution | Status page | "Service restored: [summary]" |

---

## Testing DR Plan

### Quarterly DR Test

```bash
# 1. Create test backup
./scripts/backup-db.sh

# 2. Restore to test environment
docker compose -f docker-compose.test.yml up -d
./scripts/restore-db.sh test_backup.sql.gz

# 3. Verify application works
curl http://localhost:3001/health

# 4. Document results
# Update DR plan if issues found

# 5. Cleanup
docker compose -f docker-compose.test.yml down -v
```

### DR Test Checklist

- [ ] Backup creation successful
- [ ] Backup integrity verified
- [ ] Restore completed without errors
- [ ] Application starts correctly
- [ ] All health checks pass
- [ ] Critical features functional
- [ ] Recovery time within RTO
- [ ] Data loss within RPO

---

## Commands

### Check System Status

```bash
# All services
docker compose ps

# Database
docker compose exec db pg_isready

# Redis
docker compose exec redis redis-cli ping

# Application
curl http://localhost/health
```

### Emergency Stop

```bash
# Stop all services
docker compose stop

# Stop specific service
docker compose stop app
```

### Emergency Restore

```bash
# Restore database
./scripts/restore-db.sh <backup-file>

# Restart all services
docker compose up -d
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| DR plan documented | Review this document | Complete |
| Backups exist | `ls -la /app/data/backups/` | Recent backups |
| Restore tested | Quarterly DR test | All checks pass |
| RTO met | Time recovery | < 4 hours |
| RPO met | Data loss check | < 1 hour |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Restore fails | Check backup integrity | Use verified backup |
| Application won't start after restore | Check env vars, DB connectivity | Verify configuration |
| Data loss exceeds RPO | Check backup frequency | Increase backup frequency |
| Recovery exceeds RTO | Time each step | Optimize recovery procedures |
