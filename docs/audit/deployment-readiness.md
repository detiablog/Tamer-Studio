# Deployment Readiness Report — Tamer Studio

> Generated: 2026-08-02 | Scope: Full deployment capability assessment

---

## Overall Readiness Score

| Deployment Target | Readiness | Score |
|-------------------|-----------|-------|
| Docker (local) | Ready with caveats | 75/100 |
| Docker (production) | Partially ready | 65/100 |
| Coolify | Needs config | 50/100 |
| Railway | Needs config | 45/100 |
| Google Cloud Run | Needs config | 40/100 |
| VPS (manual) | Partially ready | 60/100 |
| Kubernetes (future) | Not ready | 25/100 |

**Overall Score: 50/100**

---

## Phase 1-9 Findings Summary

### Phase 1: Environment Variables
- 76 unique env vars referenced across the codebase
- Only 2 are truly required (`DATABASE_URL`, `BETTER_AUTH_SECRET`)
- **2 duplicate validators** (`env.ts` and `env-validator.ts`) with different required lists
- **Inconsistent defaults** — most files default `NEXT_PUBLIC_APP_URL` to `http://localhost:3000`, but referral/affiliate routes default to `https://tamer.ai`

### Phase 2: Hardcoded Values
- **24 critical issues** (committed secrets, hardcoded localhost in auth flows)
- **80+ warnings** (localhost fallbacks, hardcoded domain, emails)
- **5 production-breaking issues:**
  1. `user.repository.ts` lines 25, 211 — hardcoded `http://localhost:3000` in auth request construction
  2. Domain inconsistency (`tamer.studio` vs `tamerstudio.com`)
  3. Email inconsistency (3 different default emails)
  4. Secrets committed to disk
  5. `ADMIN_MASTER_KEY` used as plain-text comparison

### Phase 3: Configuration Architecture
- Three-tier config: env vars → core config singleton → DB-backed settings
- **No centralized URL config** — URLs scattered across 20+ files
- **No centralized email config** — emails hardcoded in 8+ files
- **No centralized social links config** — social links in Footer.tsx + seed scripts

### Phase 4: Environment Consistency
- `.env`, `.env.local`, `production.env.example` all have different variable sets
- `production.env.example` uses `APP_URL` instead of `NEXT_PUBLIC_APP_URL`
- Docker Compose uses `${APP_PORT:-3000}` but Dockerfile hardcodes `PORT=3000`
- No environment-specific source code (good — no `if (process.env.NODE_ENV === 'production')` branching in business logic)

### Phase 5: External Services
- All 15+ external services use env vars for credentials (good)
- Email provider credentials are encrypted at rest (good)
- **Sentry DSN defined but not implemented** — monitoring gap
- **StorageProvider env var defined but not used in code** — local storage always used

### Phase 6: URL Standardization
- **No single source of truth for URLs**
- `NEXT_PUBLIC_APP_URL` used in 14 files but with inline defaults
- `https://tamer.studio` hardcoded in 24+ SEO/homepage files
- `https://tamerstudio.com` hardcoded in 10 marketing pages
- `https://tamer.ai` used as default in 4 referral/affiliate files
- Support email: `support@tamer.studio` in most files, `support@tamerstudio.com` in settings

### Phase 7: Secret Audit
- **Real credentials in `.env` and `.env.local`** on disk
- `scripts/create-admin.ts` contains hardcoded passwords
- `docker-compose.local.yml` has hardcoded DB password
- `.gitignore` correctly excludes `.env*` files but they exist on disk
- Email encryption key falls back to `AUTH_SECRET` (acceptable but should be explicit)

### Phase 8: Runtime Configuration
- All configuration can be overridden via env vars (good)
- DB-backed settings provide runtime mutability (good)
- **No environment-specific `.env` files** — no `.env.development`, `.env.staging`, `.env.production`
- Docker Compose reads `.env` file — production should use platform-injected env vars

### Phase 9: Build Audit
- `pnpm dev` → uses `.env.local` (correct)
- `pnpm build` → uses `.env` (correct)
- Docker Build → Dockerfile sets `NODE_ENV=production`, `PORT=3000` (correct)
- CI/CD → `.github/workflows/ci.yml` and `deploy.yml` don't set env vars (placeholder deploy)
- **All builds consume the same config system** (good — no build-specific config)

---

## Deployment Target Analysis

### Docker (Local)
**Status: Ready with caveats**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Dockerfile exists | ✅ | Multi-stage, standalone output |
| docker-compose.yml exists | ✅ | Full stack: app + db + redis + worker + nginx |
| docker-compose.local.yml exists | ✅ | Dev infrastructure: db + redis |
| .dockerignore exists | ✅ | Excludes node_modules, .next, .env |
| Health check defined | ✅ | `/health` endpoint |
| Volume persistence | ✅ | postgres-data, redis-data, app-data |
| Environment config | ⚠️ | Hardcoded DB password in docker-compose.local.yml |

### Docker (Production)
**Status: Partially ready**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Standalone output | ✅ | `next.config.ts` has `output: "standalone"` |
| Non-root user | ✅ | uid 1001 in Dockerfile |
| SSL/TLS | ✅ | Nginx with SSL termination |
| Horizontal scaling | ⚠️ | `docker-compose.scaling.yml` exists but untested |
| Secret management | ❌ | No Docker secrets or external vault integration |
| Logging | ⚠️ | Custom logger exists but no structured logging to stdout |
| Resource limits | ⚠️ | Only in scaling config, not in main compose |

### Coolify
**Status: Needs config**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Dockerfile | ✅ | Compatible |
| Environment variables | ⚠️ | Need to document all required vars for Coolify UI |
| Health check | ✅ | `/health` endpoint |
| Domain/SSL | ⚠️ | Coolify handles this — no config needed |
| Database | ⚠️ | Need to decide: external DB or Coolify-managed |
| Redis | ⚠️ | Need to decide: external Redis or Coolify-managed |

**Missing:**
- Coolify-specific environment variable documentation
- Docker Compose override for Coolify deployment
- Coolify service labels (optional)

### Railway
**Status: Needs config**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Dockerfile | ✅ | Compatible |
| railway.json | ❌ | Not present |
| railway.toml | ❌ | Not present |
| Health check | ✅ | `/health` endpoint |
| Database plugin | ⚠️ | Need to configure PostgreSQL plugin |
| Redis plugin | ⚠️ | Need to configure Redis plugin |

**Missing:**
- `railway.json` or `railway.toml` config
- Railway-specific env var documentation
- Start command configuration

### Google Cloud Run
**Status: Needs config**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Dockerfile | ✅ | Compatible (standalone output) |
| Procfile | ❌ | Not present (Cloud Run uses CMD) |
| Health check | ✅ | `/health` endpoint |
| PORT env var | ✅ | Dockerfile sets `PORT=3000` |
| Cloud SQL | ⚠️ | Need Cloud SQL proxy or direct connection |
| Cloud Memorystore | ⚠️ | Need Redis config for Cloud Memorystore |

**Missing:**
- Cloud Run service YAML or deploy script
- Cloud SQL connection configuration
- Cloud Run memory/CPU configuration
- Min/max instances configuration

### VPS (Manual)
**Status: Partially ready**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Dockerfile | ✅ | Can build and run |
| docker-compose.yml | ✅ | Full stack |
| Nginx config | ✅ | SSL + reverse proxy |
| Systemd service | ❌ | Not present |
| Log rotation | ❌ | Not configured |
| Backup scripts | ✅ | `backup-db.sh`, `restore-db.sh` exist |
| Health monitoring | ⚠️ | Scripts exist but no continuous monitoring |

**Missing:**
- Systemd service file
- Log rotation config
- Firewall configuration
- Automatic SSL renewal (Certbot)

### Kubernetes (Future)
**Status: Not ready**

| Requirement | Status | Notes |
|-------------|--------|-------|
| Kubernetes manifests | ❌ | No K8s YAML files |
| Helm chart | ❌ | No Helm chart |
| ConfigMaps | ❌ | No K8s ConfigMap templates |
| Secrets | ❌ | No K8s Secret templates |
| Ingress | ❌ | No Ingress resource |
| HPA | ❌ | No HorizontalPodAutoscaler |
| PodDisruptionBudget | ❌ | Not configured |
| NetworkPolicy | ❌ | Not configured |

---

## Critical Missing Requirements

### 1. Centralized Configuration (HIGH)
**Problem:** URLs, emails, social links, and support info are hardcoded in 30+ files.
**Fix:** Create `src/core/config/constants.ts` with all centralized values, driven by env vars.

### 2. Required Environment Variables (HIGH)
**Problem:** Only 2 vars are required, but production needs 15+ to function correctly.
**Fix:** Expand the required list in `env.ts` to include `NEXT_PUBLIC_APP_URL`, `NODE_ENV`, etc.

### 3. Single Env Validator (HIGH)
**Problem:** Two parallel validators (`env.ts` and `env-validator.ts`) with different requirements.
**Fix:** Consolidate into one validator in `src/core/config/env.ts`.

### 4. Secret Management (HIGH)
**Problem:** Real credentials on disk in `.env` and `.env.local`.
**Fix:** 
- Ensure `.env` is never committed to git history
- Add pre-commit hook to prevent secret commits
- Document platform-specific secret injection (Coolify, Railway, GCP)

### 5. Deployment Documentation (MEDIUM)
**Problem:** No deployment guides for any target platform.
**Fix:** Create `docs/deployment/` with guides for Docker, Coolify, Railway, GCP, VPS.

### 6. Environment-Specific Templates (MEDIUM)
**Problem:** Only `.env.example` and `production.env.example` exist.
**Fix:** Create `.env.staging.example` and document the difference between environments.

### 7. Health Check Standardization (LOW)
**Problem:** Health check exists but doesn't validate all dependencies.
**Fix:** Ensure `/health` checks DB, Redis, storage, and reports status accurately.

---

## Recommended Pre-Deployment Checklist

- [ ] Rotate all secrets (DB password, auth secrets, admin keys)
- [ ] Fix `user.repository.ts` hardcoded localhost
- [ ] Unify domain (choose `tamer.studio` or `tamerstudio.com`)
- [ ] Extract all hardcoded emails to config
- [ ] Consolidate env validators into one
- [ ] Make `NEXT_PUBLIC_APP_URL` required
- [ ] Remove hardcoded fallbacks from production code
- [ ] Create deployment documentation
- [ ] Add pre-commit secret detection hook
- [ ] Verify Docker build works end-to-end
- [ ] Test with production-like environment variables
- [ ] Validate all health check endpoints
- [ ] Set up monitoring (implement Sentry or alternative)
