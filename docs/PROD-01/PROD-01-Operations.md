# PROD-01: Operations

**Document ID:** PROD-01-Operations  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the operational procedures for Tamer Studio, including admin dashboard, system status, deployment metadata, and version management.

---

## Admin Dashboard

### Access

| Environment | URL | Auth |
|-------------|-----|------|
| Development | `http://localhost:3000/admin` | Admin credentials |
| Production | `https://yourdomain.com/admin` | Admin credentials |

### Admin Features

| Feature | Description |
|---------|-------------|
| User Management | View, create, edit users |
| Content Management | Manage articles, pages, media |
| System Monitoring | View health, metrics, alerts |
| Audit Logs | View system activity |
| Configuration | Manage settings, feature flags |

### Admin Authentication

```bash
# Create admin user
pnpm db:seed

# Or manually
docker compose exec app node -e "
const { createAdmin } = require('./src/scripts/create-admin');
createAdmin('admin@example.com', 'secure-password');
"
```

---

## System Status

### Health Dashboard

```bash
# Application health
curl http://localhost/health

# Detailed health
curl http://localhost/api/health

# Database health
curl http://localhost/api/health/database

# Runtime metrics
curl http://localhost/api/health/runtime
```

### Service Status

```bash
# All services
docker compose ps

# Specific service
docker compose ps app
docker compose ps worker
docker compose ps db
docker compose ps redis
docker compose ps nginx
```

### Resource Usage

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -m
```

---

## Deployment Metadata

### Version Information

```bash
# Application version
node -p "require('./package.json').version"

# Node.js version
node --version

# pnpm version
pnpm --version

# Docker version
docker --version
docker compose version
```

### Deployment Info

```bash
# Current git commit
git log --oneline -1

# Current branch
git branch --show-current

# Last deployment time
docker inspect tamer-studio --format='{{.Created}}'
```

### Environment Info

```bash
# Environment
echo $NODE_ENV

# App URL
echo $APP_URL

# Database URL (masked)
echo $DATABASE_URL | sed 's/:.*@/:***@/'
```

---

## Version Management

### Semantic Versioning

| Component | Version | Location |
|-----------|---------|----------|
| Application | 0.1.0 | `package.json` |
| Database Schema | Managed by Drizzle | `drizzle/` |
| Docker Images | Git commit hash | Docker tags |

### Release Process

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Create release branch
git checkout -b release/v0.1.1

# 3. Run tests
pnpm test

# 4. Build
pnpm build

# 5. Merge to main
git checkout main
git merge release/v0.1.1

# 6. Tag release
git tag v0.1.1

# 7. Deploy
docker compose up -d --build
```

### Rollback Version

```bash
# Check available versions
git tag -l

# Rollback to version
git checkout v0.1.0
docker compose up -d --build
```

---

## Operational Procedures

### Daily Operations

| Task | Command | Frequency |
|------|---------|-----------|
| Check health | `curl http://localhost/health` | Daily |
| Review logs | `docker compose logs --tail=100 app` | Daily |
| Check disk space | `df -h` | Daily |
| Verify backups | `ls -la /app/data/backups/` | Daily |

### Weekly Operations

| Task | Command | Frequency |
|------|---------|-----------|
| Review metrics | Check monitoring dashboard | Weekly |
| Clean old backups | `find /app/data/backups -mtime +7 -delete` | Weekly |
| Security audit | `pnpm audit` | Weekly |
| Performance review | Check latency, error rates | Weekly |

### Monthly Operations

| Task | Command | Frequency |
|------|---------|-----------|
| Rotate secrets | Update passwords, API keys | Monthly |
| DR test | Restore backup to test environment | Monthly |
| Capacity planning | Review resource usage | Monthly |
| Dependency updates | `pnpm update` | Monthly |

---

## Troubleshooting Operations

### Common Issues

| Issue | Command | Resolution |
|-------|---------|------------|
| App not responding | `docker compose logs app` | Check env vars, restart |
| Database slow | `docker compose exec db psql -U tamer -c "SELECT * FROM pg_stat_activity"` | Kill slow queries, optimize |
| Redis full | `docker compose exec redis redis-cli info memory` | Increase maxmemory, clean keys |
| Disk full | `df -h` | Clean old files, increase storage |
| High CPU | `docker stats` | Scale vertically, optimize code |
| High memory | `docker stats` | Check for leaks, increase limits |

### Emergency Procedures

```bash
# Emergency stop
docker compose stop

# Emergency restart
docker compose restart

# Emergency rollback
git checkout <previous-commit> && docker compose up -d --build

# Emergency database restore
./scripts/restore-db.sh <backup-file>
```

---

## Commands

### Status Commands

```bash
# Service status
docker compose ps

# Health check
curl http://localhost/health

# Resource usage
docker stats

# Disk usage
df -h
```

### Management Commands

```bash
# Restart service
docker compose restart app

# View logs
docker compose logs -f app

# Execute command
docker compose exec app sh

# Scale service
docker compose up -d --scale app=2
```

### Maintenance Commands

```bash
# Backup database
./scripts/backup-db.sh

# Restore database
./scripts/restore-db.sh <backup-file>

# Clean old files
find /app/data/backups -mtime +7 -delete

# Update dependencies
pnpm update
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Services running | `docker compose ps` | All status "Up" |
| Health check | `curl http://localhost/health` | HTTP 200 |
| Logs flowing | `docker compose logs --tail=10 app` | Logs present |
| Backups current | `ls -la /app/data/backups/` | Recent backup |
| Disk space | `df -h` | > 20% free |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Service won't start | `docker compose logs <service>` | Check env vars, dependencies |
| Health check fails | Check service dependencies | Verify DB, Redis, storage |
| Logs missing | Check log level, output | Verify LOG_LEVEL, container logs |
| Backup fails | Check disk space, permissions | Free space, fix permissions |
| High resource usage | `docker stats` | Optimize, scale, or increase limits |
