# PROD-01: Deployment Pipeline

**Document ID:** PROD-01-Deployment  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the CI/CD deployment pipeline for Tamer Studio, including build validation, testing, deployment execution, and rollback procedures.

---

## Pipeline Architecture

```
Push to main --> GitHub Actions --> Validate --> Test --> Deploy --> Verify
                                    |            |        |          |
                                    v            v        v          v
                                  Lint       Vitest    Docker    Health
                                  TypeCheck  Unit      Compose   Checks
                                  Build                Pull      Smoke
```

---

## GitHub Actions Workflows

### CI Pipeline (`ci.yml`)

Triggers on push to `main`/`develop` and PRs to `main`.

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm build
```

### Deploy Pipeline (`deploy.yml`)

Triggers on push to `main` and manual dispatch.

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  validate:
    steps:
      - pnpm install --frozen-lockfile
      - pnpm lint
      - pnpm build

  test:
    needs: validate
    steps:
      - pnpm test

  deploy:
    needs: [validate, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - Deploy to production
```

---

## Pipeline Stages

### Stage 1: Validate

| Step | Command | Purpose |
|------|---------|---------|
| Install | `pnpm install --frozen-lockfile` | Reproducible dependencies |
| Lint | `pnpm lint` | Code quality |
| TypeCheck | `pnpm typecheck` | TypeScript validation |
| Build | `pnpm build` | Production build |

### Stage 2: Test

| Step | Command | Purpose |
|------|---------|---------|
| Unit Tests | `vitest run` | Business logic validation |
| Coverage | Configured in `vitest.config.ts` | Coverage thresholds |

### Stage 3: Build Docker Image

```bash
# Multi-stage build
docker compose build app
docker compose build worker
```

### Stage 4: Database Migration

```bash
# Run pending migrations
docker compose exec app node -e "require('./src/scripts/migrate.ts')"
# Or via pnpm
pnpm db:migrate
```

### Stage 5: Deploy

```bash
# Pull and restart
docker compose pull
docker compose up -d

# Or rebuild from source
docker compose up -d --build
```

### Stage 6: Verify

```bash
# Run deployment verification script
./scripts/verify-deployment.sh
```

---

## Deployment Commands

### Full Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build images
docker compose build --no-cache

# 3. Run migrations
docker compose exec app pnpm db:migrate

# 4. Deploy
docker compose up -d

# 5. Verify
./scripts/verify-deployment.sh
```

### Quick Deploy (No Schema Changes)

```bash
docker compose up -d --build app worker
```

### Database-Only Migration

```bash
docker compose exec app pnpm db:migrate
```

---

## Rollback Procedure

### Application Rollback

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

### Database Rollback

```bash
# 1. Stop the application
docker compose stop app worker

# 2. Restore database from backup
./scripts/restore-db.sh /app/data/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Restart application
docker compose start app worker

# 4. Verify
./scripts/health-check.sh
```

### Full Rollback (Application + Database)

```bash
# 1. Stop all services
docker compose stop

# 2. Restore database
./scripts/restore-db.sh <backup-file>

# 3. Checkout previous code
git checkout <previous-commit-hash>

# 4. Rebuild and start
docker compose up -d --build

# 5. Verify
./scripts/verify-deployment.sh
```

---

## Configuration

### Environment Files

| File | Purpose | Location |
|------|---------|----------|
| `.env` | Active configuration | Project root |
| `.env.example` | Template | Project root |
| `production.env.example` | Production template | Project root |

### Deployment Metadata

| Property | Value |
|----------|-------|
| App Version | `0.1.0` (from package.json) |
| Node Version | 20 |
| pnpm Version | 11.15.0 |
| Docker Compose | 3.8 |

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Build succeeds | `pnpm build` | Exit 0 |
| Tests pass | `pnpm test` | All pass |
| Lint passes | `pnpm lint` | No errors |
| Health check | `curl http://localhost/health` | HTTP 200 |
| DB health | `curl http://localhost/api/health/database` | HTTP 200 |
| Runtime health | `curl http://localhost/api/health/runtime` | HTTP 200 |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Build fails | Check `pnpm build` output | Fix TypeScript/lint errors |
| Migration fails | Check `pnpm db:migrate` output | Verify DATABASE_URL, check schema |
| Health check fails after deploy | `docker compose logs app` | Check env vars, DB connectivity |
| Rollback needed | Check `git log` for last good commit | Follow rollback procedure above |
| Container won't start | `docker compose logs <service>` | Check resource limits, env vars |
