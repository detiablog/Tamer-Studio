# PROD-01: Verification Checklist

**Document ID:** PROD-01-Verification  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the verification procedures for Tamer Studio production deployment, including build verification, Docker verification, environment verification, database verification, and all service health checks.

---

## Verification Scripts

### Main Verification Script

```bash
# scripts/verify-deployment.sh
#!/bin/bash
set -e

APP_URL=${APP_URL:-http://localhost:3000}
ERRORS=0

echo "=== Deployment Verification ==="
echo ""

echo "1. Health Check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "2. API Health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "3. Database Health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health/database")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "4. Runtime Health..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health/runtime")
if [ "$STATUS" = "200" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo "5. Static Assets..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/favicon.ico")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then echo "   PASS"; else echo "   FAIL (HTTP $STATUS)"; ERRORS=$((ERRORS + 1)); fi

echo ""
echo "=== Results: $ERRORS failures ==="
if [ $ERRORS -gt 0 ]; then exit 1; fi
echo "All checks passed!"
```

---

## Build Verification

| Check | Command | Expected |
|-------|---------|----------|
| Dependencies installed | `pnpm install --frozen-lockfile` | Exit 0 |
| Lint passes | `pnpm lint` | No errors |
| TypeCheck passes | `pnpm typecheck` | No errors |
| Build succeeds | `pnpm build` | Exit 0 |
| Tests pass | `pnpm test` | All pass |

### Build Commands

```bash
# Full verification
pnpm lint && pnpm typecheck && pnpm build && pnpm test

# Quick check
pnpm check
```

---

## Docker Verification

| Check | Command | Expected |
|-------|---------|----------|
| Images built | `docker images \| grep tamer` | Images exist |
| Containers running | `docker compose ps` | All status "Up" |
| No restart loops | `docker compose ps` | No "Restarting" status |
| Volumes mounted | `docker volume ls \| grep tamer` | 4 volumes |

### Docker Commands

```bash
# Build all images
docker compose build

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs --tail=50
```

---

## Environment Verification

| Check | Command | Expected |
|-------|---------|----------|
| Required vars set | `node -e "require('./src/lib/env-validator').validateEnvironment()"` | `valid: true` |
| No warnings | Same command | `warnings: []` |
| Secrets not in code | `grep -r "password\|secret\|key" src/ --include="*.ts" -l` | No hardcoded values |

### Environment Commands

```bash
# Validate environment
node -e "require('./src/lib/env-validator').validateEnvironment()"

# Check specific variable
echo $DATABASE_URL
echo $REDIS_URL
```

---

## Database Verification

| Check | Command | Expected |
|-------|---------|----------|
| DB accepting connections | `docker compose exec db pg_isready` | accepting connections |
| Tables exist | `docker compose exec db psql -U tamer -d tamer_studio -c "\dt"` | Tables listed |
| Migrations current | `pnpm db:migrate` | No pending migrations |
| Connection pool working | `curl http://localhost/api/health/database` | HTTP 200 |

### Database Commands

```bash
# Connect to database
docker compose exec db psql -U tamer -d tamer_studio

# List tables
docker compose exec db psql -U tamer -d tamer_studio -c "\dt"

# Check connection count
docker compose exec db psql -U tamer -d tamer_studio -c "SELECT count(*) FROM pg_stat_activity"
```

---

## Redis Verification

| Check | Command | Expected |
|-------|---------|----------|
| Redis responding | `docker compose exec redis redis-cli ping` | PONG |
| Memory within limits | `docker compose exec redis redis-cli info memory` | used_memory < 256MB |
| AOF enabled | `docker compose exec redis redis-cli config get appendonly` | 1 |
| Connection from app | `curl http://localhost/health` | HTTP 200 |

### Redis Commands

```bash
# Ping
docker compose exec redis redis-cli ping

# Info
docker compose exec redis redis-cli info

# Key count
docker compose exec redis redis-cli dbsize
```

---

## Storage Verification

| Check | Command | Expected |
|-------|---------|----------|
| Storage health | `curl http://localhost/api/health/storage` | HTTP 200 |
| Upload works | Upload test file via API | File stored |
| Download works | Download test file via API | File retrieved |
| Quota enforced | Upload beyond quota | Error: quota exceeded |

### Storage Commands

```bash
# Check storage provider
curl http://localhost/api/health/storage

# Test upload
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.txt" \
  -F "kind=document"
```

---

## SMTP Verification

| Check | Command | Expected |
|-------|---------|----------|
| SMTP configured | Check SMTP_HOST env var | Set |
| SMTP connection | Send test email | Email delivered |
| Email templates | Check template files | Templates exist |

### SMTP Commands

```bash
# Test SMTP connection
docker compose exec app node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
});
transport.verify().then(console.log).catch(console.error);
"
```

---

## Worker Verification

| Check | Command | Expected |
|-------|---------|----------|
| Worker running | `docker compose ps worker` | Status "Up" |
| Worker processing | `docker compose logs worker` | Job processing logs |
| Queue functional | Enqueue test job | Job processed |
| Retry works | Fail job, check retry | Job retried |

### Worker Commands

```bash
# Check worker status
docker compose ps worker

# View worker logs
docker compose logs -f worker

# Monitor queue
docker compose exec redis redis-cli LLEN "job:queue"
```

---

## Health Endpoint Verification

| Endpoint | Command | Expected |
|----------|---------|----------|
| `/health` | `curl http://localhost/health` | HTTP 200 |
| `/api/health` | `curl http://localhost/api/health` | HTTP 200 |
| `/api/health/database` | `curl http://localhost/api/health/database` | HTTP 200 |
| `/api/health/runtime` | `curl http://localhost/api/health/runtime` | HTTP 200 |

---

## Security Verification

| Check | Command | Expected |
|-------|---------|----------|
| HTTPS active | `curl -I http://localhost` | 301 to HTTPS |
| Security headers | `curl -I https://localhost` | All headers present |
| Rate limiting | Send 100+ requests | 429 after limit |
| CORS working | Check Access-Control headers | Correct origin |

### Security Commands

```bash
# Check SSL
curl -I https://localhost

# Check headers
curl -I https://localhost | grep -i "x-frame-options\|x-content-type\|csp"

# Test rate limiting
for i in {1..100}; do curl -s -o /dev/null -w "%{http_code}\n" https://localhost/api/test; done
```

---

## Full Verification

```bash
# Run all checks
./scripts/verify-deployment.sh

# Or manually
curl http://localhost/health
curl http://localhost/api/health
curl http://localhost/api/health/database
curl http://localhost/api/health/runtime
docker compose ps
docker compose logs --tail=10
```

---

## Verification Report

```bash
# Generate verification report
cat << EOF
=== Tamer Studio Verification Report ===
Date: $(date)
Version: $(node -p "require('./package.json').version")
Commit: $(git log --oneline -1)

Services:
$(docker compose ps)

Health:
$(curl -s http://localhost/health | jq .)

Database:
$(docker compose exec db pg_isready)

Redis:
$(docker compose exec redis redis-cli ping)

=== End Report ===
EOF
```

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Verification fails | Check each step individually | Identify failing check |
| Health check fails | `docker compose logs app` | Check env vars, DB connectivity |
| Database fails | `docker compose logs db` | Verify credentials, check disk |
| Redis fails | `docker compose logs redis` | Verify connection, check memory |
| Worker fails | `docker compose logs worker` | Check WORKER_MODE, Redis connection |
