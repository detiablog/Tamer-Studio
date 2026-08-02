# PROD-01: Rollback Procedures

**Document ID:** PROD-01-Rollback  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines rollback procedures for Tamer Studio, including application rollback, database rollback, migration rollback, and configuration rollback with testing.

---

## Rollback Types

| Type | Impact | Risk | Time |
|------|--------|------|------|
| Application | Code revert | Low | 5-10 min |
| Database | Data revert | High | 15-30 min |
| Migration | Schema revert | High | 10-20 min |
| Configuration | Config revert | Low | 2-5 min |

---

## Application Rollback

### Quick Rollback (Previous Version)

```bash
# 1. Identify last known good version
git log --oneline -10

# 2. Checkout previous version
git checkout <previous-commit-hash>

# 3. Rebuild and deploy
docker compose up -d --build

# 4. Verify
./scripts/verify-deployment.sh
```

### Rollback to Specific Version

```bash
# 1. List tags
git tag -l

# 2. Checkout specific tag
git checkout v0.1.0

# 3. Rebuild and deploy
docker compose up -d --build

# 4. Verify
./scripts/verify-deployment.sh
```

### Docker Image Rollback

```bash
# 1. List available images
docker images | grep tamer-studio

# 2. Stop current container
docker compose stop app

# 3. Run previous image
docker run -d --name tamer-studio \
  --env-file .env \
  -p 3000:3000 \
  tamer-studio:<previous-tag>

# 4. Verify
curl http://localhost/health
```

---

## Database Rollback

### Backup-Based Rollback

```bash
# 1. Stop application
docker compose stop app worker

# 2. List available backups
ls -la /app/data/backups/

# 3. Restore from backup
./scripts/restore-db.sh /app/data/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz

# 4. Restart application
docker compose start app worker

# 5. Verify
./scripts/health-check.sh
```

### Point-in-Time Recovery

```bash
# 1. Stop application
docker compose stop app worker

# 2. Restore to specific point
# (Requires WAL archiving setup)
pg_restore -U tamer -d tamer_studio --target-time="2026-08-02 14:00:00" backup_file

# 3. Restart application
docker compose start app worker
```

---

## Migration Rollback

### Revert Last Migration

```bash
# 1. Check current migration status
docker compose exec app pnpm db:migrate:status

# 2. Revert last migration
docker compose exec app pnpm db:migrate:down

# 3. Verify schema
docker compose exec db psql -U tamer -d tamer_studio -c "\dt"
```

### Revert Multiple Migrations

```bash
# 1. List migrations
docker compose exec app pnpm db:migrate:list

# 2. Revert to specific migration
docker compose exec app pnpm db:migrate:down --to=<migration-id>

# 3. Verify schema
docker compose exec db psql -U tamer -d tamer_studio -c "\dt"
```

### Emergency Schema Rollback

```bash
# 1. Stop application
docker compose stop app worker

# 2. Restore database from pre-migration backup
./scripts/restore-db.sh /app/data/backups/db_backup_pre_migration.sql.gz

# 3. Restart application
docker compose start app worker
```

---

## Configuration Rollback

### Environment File Rollback

```bash
# 1. Restore previous .env
git checkout HEAD~1 -- .env

# 2. Restart application
docker compose restart app worker

# 3. Verify
curl http://localhost/health
```

### Nginx Configuration Rollback

```bash
# 1. Restore previous nginx.conf
git checkout HEAD~1 -- config/nginx/nginx.conf

# 2. Validate configuration
docker compose exec nginx nginx -t

# 3. Reload Nginx
docker compose exec nginx nginx -s reload
```

### Docker Compose Rollback

```bash
# 1. Restore previous docker-compose.yml
git checkout HEAD~1 -- docker-compose.yml

# 2. Rebuild and restart
docker compose up -d --build

# 3. Verify
docker compose ps
```

---

## Rollback Testing

### Pre-Rollback Checklist

- [ ] Identify rollback target (commit, tag, backup)
- [ ] Verify backup integrity
- [ ] Notify team of rollback
- [ ] Schedule maintenance window (if needed)
- [ ] Document rollback reason

### Post-Rollback Checklist

- [ ] Application starts successfully
- [ ] All health checks pass
- [ ] Critical features functional
- [ ] No data loss (or acceptable loss documented)
- [ ] Monitoring alerts cleared
- [ ] Team notified of completion

### Rollback Test Commands

```bash
# 1. Create test backup
./scripts/backup-db.sh

# 2. Perform rollback
# (follow rollback procedure)

# 3. Verify rollback
./scripts/verify-deployment.sh

# 4. Restore to original state
./scripts/restore-db.sh test_backup.sql.gz
docker compose up -d --build
```

---

## Commands

### Quick Commands

```bash
# Application rollback
git checkout <previous-commit> && docker compose up -d --build

# Database rollback
./scripts/restore-db.sh <backup-file>

# Configuration rollback
git checkout HEAD~1 -- .env && docker compose restart

# Full rollback
git checkout <previous-commit> && \
./scripts/restore-db.sh <backup-file> && \
docker compose up -d --build
```

### Rollback Status

```bash
# Check current version
node -p "require('./package.json').version"

# Check git status
git log --oneline -5

# Check backup availability
ls -la /app/data/backups/
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Application running | `docker compose ps` | Status "Up" |
| Health check | `curl http://localhost/health` | HTTP 200 |
| Database connected | `curl http://localhost/api/health/database` | HTTP 200 |
| Previous version | `node -p "require('./package.json').version"` | Expected version |
| No errors | `docker compose logs --tail=50 app` | No error logs |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Rollback fails | Check git history, backup integrity | Use verified backup/commit |
| Application won't start | Check env vars, dependencies | Verify configuration |
| Database mismatch | Check schema version | Restore matching backup |
| Data loss | Check RPO, backup frequency | Accept loss or restore from backup |
| Performance issues | Check resource usage | Optimize or scale |
