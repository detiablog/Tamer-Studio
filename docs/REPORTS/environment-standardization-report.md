# Environment Standardization Report — Tamer Studio

> Generated: 2026-08-02 | Sprint: ENV-01 Production Environment Audit

---

## Executive Summary

The Tamer Studio codebase has a **functional but inconsistent** configuration system. While environment variables are used for most external services, critical gaps exist in URL centralization, domain consistency, secret management, and deployment readiness. This report summarizes findings across all 10 audit phases and provides actionable recommendations.

**Overall Production Readiness: 50/100**

---

## Key Findings

### Finding 1: Committed Secrets (CRITICAL)

**Status:** 🔴 Critical

Real credentials exist in `.env` and `.env.local` on the developer's machine:
- Database password: `1234`
- Admin password: `Aoneshoper@2026Admin`
- Auth secrets: `326097fa87b8b74c4042e2f585abfee1...`
- Admin master key: `admin-master-key`

While `.gitignore` excludes `.env*` files, the secrets may already be in git history.

**Action:** Rotate all secrets immediately. Add pre-commit hooks for secret detection.

---

### Finding 2: Production-Breaking Hardcoded localhost (CRITICAL)

**Status:** 🔴 Critical

`src/core/users/user.repository.ts` lines 25 and 211 construct auth request URLs with hardcoded `http://localhost:3000`:

```typescript
const url = new URL("/api/auth/sign-up/email", "http://localhost:3000");
```

This does NOT use `process.env` at all. User creation will fail in any non-local environment.

**Action:** Replace with `config.app.url` or `process.env.NEXT_PUBLIC_APP_URL`.

---

### Finding 3: Domain Inconsistency (WARNING)

**Status:** 🟡 Warning

Three different domains are used across the codebase:

| Domain | Where Used | Count |
|--------|-----------|-------|
| `tamer.studio` | SEO, homepage, schema, emails | 24+ files |
| `tamerstudio.com` | Marketing pages (about, blog, etc.) | 10 files |
| `tamer.ai` | Referral/affiliate default URLs | 4 files |

**Action:** Choose one canonical domain. Extract to a single config constant.

---

### Finding 4: Email Inconsistency (WARNING)

**Status:** 🟡 Warning

Three different default email addresses:

| Email | Where Used |
|-------|-----------|
| `support@tamer.studio` | Templates, schema, layout, footer |
| `support@tamerstudio.com` | Admin settings service |
| `noreply@tamerstudio.com` | Config default, production.env.example |
| `noreply@tamer.studio` | SMTP test route |

**Action:** Extract `SUPPORT_EMAIL` and `DEFAULT_FROM_EMAIL` to config.

---

### Finding 5: Duplicate Validators (WARNING)

**Status:** 🟡 Warning

Two parallel environment validators:

| Validator | Required Vars | Recommended Vars |
|-----------|---------------|------------------|
| `src/core/config/env.ts` | `DATABASE_URL`, `BETTER_AUTH_SECRET` | None |
| `src/lib/env-validator.ts` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `SESSION_SECRET` | 8 vars |

**Action:** Consolidate into `src/core/config/env.ts` only.

---

### Finding 6: Unimplemented Features (WARNING)

**Status:** 🟡 Warning

Several environment variables are defined but not used in code:

| Variable | Defined In | Status |
|----------|-----------|--------|
| `SENTRY_DSN` | `.env.example` | No SDK imported |
| `LOG_LEVEL` | `.env.example` | Logger doesn't read it |
| `ENABLE_MONITORING` | `.env.example` | Not checked in code |
| `STORAGE_PROVIDER` | `.env.example` | Storage engine always uses local |
| `KILO_API_KEY` | `.env.example` | Not referenced in code |
| `OPENROUTER_API_KEY` | `.env.example` | Not referenced in code |
| `IPAYMU_VA` | `.env.example` | Not referenced in code |
| `IPAYMU_ENVIRONMENT` | `.env.example` | Not referenced in code |
| `NEXT_PUBLIC_APP_NAME` | `.env.local` | Not used in code |

**Action:** Either implement these features or remove the env vars from templates.

---

### Finding 7: Dual Feature Flag Systems (WARNING)

**Status:** 🟡 Warning

Two separate feature flag mechanisms:

| System | Flags | Mechanism |
|--------|-------|-----------|
| `src/core/config/features.ts` | KNOWLEDGE_GRAPH, WORKFLOW_AUTOMATION, ADVANCED_ANALYTICS, MULTI_PROVIDER_AI | `isFeatureEnabled()` + runtime `Map` |
| Direct `process.env.FEATURE_*` | AFFILIATE, DRAMA, STORY, TALENT, ADMIN | Direct `process.env` reads |

**Action:** Unify into a single feature flag system.

---

### Finding 8: Deployment Gaps (WARNING)

**Status:** 🟡 Warning

| Deployment Target | Status | Missing |
|-------------------|--------|---------|
| Docker (local) | 75% | Hardcoded DB password |
| Docker (production) | 65% | Secret management, logging |
| Coolify | 50% | Env var docs, compose override |
| Railway | 45% | railway.json/toml |
| Google Cloud Run | 40% | Deploy config, Cloud SQL setup |
| VPS | 60% | Systemd service, log rotation |
| Kubernetes | 25% | All K8s manifests |

**Action:** Create deployment documentation and platform-specific configs.

---

## Standardization Recommendations

### Priority 1: Critical Fixes (Before Any Deployment)

1. **Rotate all secrets** — DB password, auth secrets, admin keys
2. **Fix `user.repository.ts`** — Replace hardcoded `http://localhost:3000` with env var
3. **Add pre-commit hook** — Prevent secret commits (e.g., `gitleaks`, `husky`)
4. **Make `NEXT_PUBLIC_APP_URL` required** — Remove all `|| "http://localhost:3000"` fallbacks

### Priority 2: Configuration Centralization

5. **Create `src/core/config/constants.ts`** — Single source for URLs, emails, social links
6. **Consolidate env validators** — Remove `src/lib/env-validator.ts`, extend `env.ts`
7. **Unify feature flags** — Extend `features.ts` to cover all `FEATURE_*` flags
8. **Standardize domain** — Choose one, extract to config

### Priority 3: Deployment Preparation

9. **Create deployment docs** — Guides for Docker, Coolify, Railway, GCP, VPS
10. **Create `.env.staging.example`** — Document staging environment differences
11. **Implement monitoring** — Either Sentry or alternative
12. **Add health check validation** — Ensure `/health` checks all critical dependencies

---

## Configuration Hierarchy (Target State)

```
┌─────────────────────────────────────────────────────────┐
│  ENVIRONMENT VARIABLES                                  │
│  (Platform-injected or .env files)                      │
│                                                         │
│  Required:                                              │
│  - DATABASE_URL                                         │
│  - BETTER_AUTH_SECRET                                   │
│  - NEXT_PUBLIC_APP_URL                                  │
│  - NODE_ENV                                             │
│                                                         │
│  Optional:                                              │
│  - AI keys, payment keys, storage keys, etc.            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  SINGLE ENV VALIDATOR                                   │
│  src/core/config/env.ts                                 │
│  - Validates required vars                              │
│  - Provides typed access                                │
│  - Logs warnings for missing optional vars              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  CONFIG SINGLETON                                       │
│  src/core/config/config.ts                              │
│  - All app configuration                                │
│  - Lazy-loaded, cached                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  CONSTANTS                                              │
│  src/core/config/constants.ts  (NEW)                    │
│  - URLs (base, SEO, API)                                │
│  - Emails (support, from)                               │
│  - Social links (twitter, discord, github)              │
│  - All derived from env vars                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FEATURE FLAGS                                          │
│  src/core/config/features.ts                            │
│  - All FEATURE_* flags unified                          │
│  - Env-based + runtime-mutable                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  DB-BACKED SETTINGS                                     │
│  (Runtime-mutable, admin-configurable)                  │
│  - Platform settings                                    │
│  - Security settings                                    │
│  - Module-specific settings                             │
└─────────────────────────────────────────────────────────┘
```

---

## Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Env vars referenced | 76 | 76 (no change) |
| Required env vars | 2 | 4 (+ NEXT_PUBLIC_APP_URL, NODE_ENV) |
| Duplicate validators | 2 | 1 |
| Hardcoded URLs in code | 30+ files | 0 files |
| Hardcoded emails in code | 8+ files | 0 files |
| Inconsistent domains | 3 | 1 |
| Unimplemented env vars | 9 | 0 |
| Feature flag systems | 2 | 1 |
| Deployment targets documented | 0 | 6 |
| Production readiness score | 50/100 | 85/100 |

---

## Files to Modify (Recommended)

| File | Change | Priority |
|------|--------|----------|
| `src/core/config/env.ts` | Add required vars: NEXT_PUBLIC_APP_URL, NODE_ENV | P1 |
| `src/lib/env-validator.ts` | **DELETE** — consolidate into env.ts | P2 |
| `src/core/config/config.ts` | Add URL, email, social config sections | P2 |
| `src/core/config/constants.ts` | **CREATE** — centralized constants | P2 |
| `src/core/config/features.ts` | Add all FEATURE_* flags | P2 |
| `src/core/users/user.repository.ts` | Fix hardcoded localhost (lines 25, 211) | P1 |
| `src/core/seo/seo-runtime.ts` | Use config for baseUrl | P2 |
| `src/app/(marketing)/*/page.tsx` | Use config for URLs (10 files) | P2 |
| `src/lib/email/templates.ts` | Use config for email | P2 |
| `src/components/landing/Footer.tsx` | Use config for social links | P2 |
| `.env.example` | Add new required vars, remove unused | P2 |
| `production.env.example` | Align with .env.example | P2 |
| `scripts/create-admin.ts` | Read credentials from env vars | P1 |
| `docker-compose.local.yml` | Use env vars for DB password | P2 |

---

## Conclusion

The Tamer Studio codebase has a solid foundation with proper use of environment variables for external services. The main gaps are:

1. **Secret management** — Real credentials on disk
2. **URL/email centralization** — Hardcoded in 30+ files
3. **Domain consistency** — Three different domains used
4. **Validator consolidation** — Two parallel systems
5. **Deployment documentation** — No platform-specific guides

Addressing Priority 1 items (4 changes) will make the application deployable. Addressing all priorities will bring production readiness from 50/100 to 85/100.
