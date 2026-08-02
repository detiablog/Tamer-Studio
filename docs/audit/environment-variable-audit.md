# Environment Variable Audit — Tamer Studio

> Generated: 2026-08-02 | Scope: Full codebase scan

---

## Summary

| Metric | Count |
|--------|-------|
| Total unique env vars referenced | 76 |
| Required (hard requirement) | 2 |
| Recommended (warn if missing) | 8 |
| Optional (feature-gated) | 66 |
| Duplicate env files | 3 (.env, .env.local, production.env.example) |
| Duplicate validators | 2 (env.ts, env-validator.ts) |

---

## 1. Core Infrastructure Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | — | `config.ts`, `env.ts`, `drizzle.config.ts`, `env-validator.ts` | Database | Must be set. No fallback. |
| `BETTER_AUTH_SECRET` | Auth token signing secret | **Yes** | — | `config.ts`, `env.ts`, `env-validator.ts` | Auth | Must be set. No fallback. |
| `NODE_ENV` | Environment mode | Implicit | `"development"` | 20+ files (secure cookies, logging, CSRF, robots, health) | System | Always set in deployment. |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Recommended | `"http://localhost:3000"` | 14 files (auth, payments, emails, websocket, CORS) | System | **CRITICAL:** Remove localhost default. Must be set. |
| `NEXT_PUBLIC_APP_NAME` | Display name | Optional | `"Tamer Studio"` | `.env.local` only; not referenced in code | System | Consider removing or using in code. |

---

## 2. Authentication Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `AUTH_SECRET` | Legacy auth secret | Recommended | — | `.env`, `.env.local` only | Auth | Consolidate with BETTER_AUTH_SECRET |
| `BETTER_AUTH_URL` | Better Auth service URL | Optional | — | `.env`, `.env.local` only | Auth | Should default to NEXT_PUBLIC_APP_URL |
| `AUTH_URL` | Auth URL (legacy) | Optional | — | `.env.local` only | Auth | Consolidate with BETTER_AUTH_URL |
| `SESSION_SECRET` | Session signing key | Optional | — | `env-validator.ts` required, but not in `env.ts` | Auth | Unify validation across both validators |
| `JWT_SECRET` | JWT signing key | Optional | — | `env-validator.ts` recommended, not used in code | Auth | Remove if not used, or implement JWT |
| `ADMIN_MASTER_KEY` | Plain-text admin key | Optional | — | `verify.ts` (line 11) | Admin | **Security risk.** Deprecate in favor of hash-only. |
| `ADMIN_MASTER_KEY_HASH` | SHA-256/scrypt admin key hash | Recommended | `""` | `config.ts`, `verify.ts` | Admin | Primary admin verification method. |
| `ADMIN_EMAIL` | Admin bootstrap email | Optional | — | `.env` only | Admin | Dev-only. Remove from production config. |
| `ADMIN_PASSWORD` | Admin bootstrap password | Optional | — | `.env` only | Admin | **Security risk if committed.** Dev-only. |
| `ADMIN_SECRET` | Admin secret (legacy) | Optional | — | `env-validator.ts` recommended, not used in code | Admin | Remove if not used. |

---

## 3. Redis / Rate Limiting Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `UPSTASH_REDIS_REST_URL` | Upstash REST API URL | Optional | `""` | `ratelimit.ts`, `redis-cache.ts`, `shared-cache.ts` | Cache/RateLimit | Feature detection: if set, uses Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST API token | Optional | `""` | `ratelimit.ts`, `redis-cache.ts`, `shared-cache.ts` | Cache/RateLimit | Paired with URL |
| `REDIS_URL` | Self-hosted Redis URL | Optional | `"redis://localhost:6379"` | `websocket/server.ts`, `health/route.ts` | WebSocket | **Warning:** localhost default unsafe for prod |

---

## 4. AI Provider Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `OPENAI_API_KEY` | OpenAI API authentication | Optional | — | `openai-adapter.ts`, `provider-registry.ts` | AI | Throws if used without key |
| `ANTHROPIC_API_KEY` | Anthropic API authentication | Optional | — | `anthropic-adapter.ts`, `provider-registry.ts` | AI | Throws if used without key |
| `GOOGLE_AI_API_KEY` | Google Gemini API authentication | Optional | — | `google-adapter.ts`, `provider-registry.ts` | AI | Throws if used without key |
| `GOOGLE_API_KEY` | Google API key (alternate) | Optional | — | `.env.example`, `.env.local` only | AI | Duplicate of GOOGLE_AI_API_KEY? Clarify. |
| `KILO_API_KEY` | Kilo AI gateway key | Optional | — | `.env.example` only | AI | Not used in code. Remove or implement. |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional | — | `.env.example` only | AI | Not used in code. Remove or implement. |

---

## 5. Payment Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `STRIPE_SECRET_KEY` | Stripe API key | Optional | — | `stripe-gateway.ts` | Payment | Throws if used without key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature | Optional | — | `stripe-gateway.ts` (non-null assertion `!`) | Payment | **Warning:** Will throw at runtime if missing |
| `IPAYMU_API_KEY` | iPaymu API key | Optional | — | `payment.engine.ts` | Payment | Indonesian payment gateway |
| `IPAYMU_SECRET_KEY` | iPaymu signing key | Optional | — | `payment.engine.ts` | Payment | — |
| `IPAYMU_MERCHANT_ID` | iPaymu merchant ID | Optional | — | `payment.engine.ts` | Payment | — |
| `IPAYMU_SANDBOX` | iPaymu sandbox toggle | Optional | — | `payment.engine.ts` (compared to `"true"`) | Payment | — |
| `IPAYMU_VA` | iPaymu virtual account | Optional | — | `.env.example` only | Payment | Not used in code |
| `IPAYMU_ENVIRONMENT` | iPaymu environment | Optional | `"sandbox"` | `.env.example` only | Payment | Not used in code |
| `TRANSFER_BANK_NAME` | Manual transfer bank | Optional | — | `payment.engine.ts` | Payment | — |
| `TRANSFER_ACCOUNT_NUMBER` | Manual transfer account | Optional | — | `payment.engine.ts` | Payment | — |
| `TRANSFER_ACCOUNT_HOLDER` | Manual transfer holder | Optional | — | `payment.engine.ts` | Payment | — |
| `TRANSFER_INSTRUCTIONS` | Manual transfer instructions | Optional | — | `payment.engine.ts` | Payment | — |

---

## 6. Storage Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `R2_ACCOUNT_ID` | Cloudflare R2 account | Optional | — | `.env.local` only | Storage | Not referenced in code directly |
| `R2_ACCESS_KEY_ID` | R2 access key | Optional | — | `.env.local` only | Storage | Not referenced in code directly |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | Optional | — | `.env.local` only | Storage | Not referenced in code directly |
| `R2_BUCKET` | R2 bucket name | Optional | — | `.env.local` only | Storage | Not referenced in code directly |
| `R2_PUBLIC_URL` | R2 public URL | Optional | — | `.env.local` only | Storage | Not referenced in code directly |
| `ASSET_STORAGE_DIR` | Local storage path | Optional | `"/tmp/tamer-assets"` | `local-storage.ts` | Storage | — |
| `STORAGE_PROVIDER` | Storage backend | Optional | `"local"` | `env-validator.ts` recommended | Storage | Currently unused in code logic |

---

## 7. Email / Notification Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `SMTP_HOST` | SMTP server host | Optional | — | `env-validator.ts` recommended, `smtp.ts` | Email | — |
| `SMTP_PORT` | SMTP server port | Optional | — | `.env.example` only | Email | — |
| `SMTP_USER` / `SMTP_USERNAME` | SMTP username | Optional | — | `.env.example` (both names used) | Email | **Inconsistent naming.** Unify. |
| `SMTP_PASSWORD` | SMTP password | Optional | — | `.env.example` only | Email | — |
| `SMTP_FROM` | SMTP sender address | Optional | — | `.env.example` only | Email | — |
| `NOTIFICATION_DEFAULT_FROM_EMAIL` | Default sender email | Optional | `"noreply@tamerstudio.com"` | `config.ts`, `email.service.ts` | Email | — |
| `NOTIFICATION_DEFAULT_FROM_NAME` | Default sender name | Optional | `"Tamer Studio"` | `config.ts` | Email | — |
| `NOTIFICATION_EMAIL_PROVIDER` | Email provider selection | Optional | `""` | `config.ts` | Email | — |
| `NOTIFICATION_SMS_PROVIDER` | SMS provider selection | Optional | `""` | `config.ts` | Notification | Not implemented |
| `NOTIFICATION_PUSH_PROVIDER` | Push provider selection | Optional | `""` | `config.ts` | Notification | Not implemented |
| `EMAIL_ENCRYPTION_KEY` | Credential encryption key | Optional | — (falls back to AUTH_SECRET) | `email.encryption.ts` | Email | Fallback chain is reasonable |

---

## 8. Feature Flag Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `FEATURE_AFFILIATE` | Enable affiliate module | Optional | — | `.env.local` | FeatureFlags | — |
| `FEATURE_DRAMA` | Enable drama module | Optional | — | `.env.local` | FeatureFlags | — |
| `FEATURE_STORY` | Enable story module | Optional | — | `.env.local` | FeatureFlags | — |
| `FEATURE_TALENT` | Enable talent module | Optional | — | `.env.local` | FeatureFlags | — |
| `FEATURE_ADMIN` | Enable admin panel | Optional | — | `.env.local` | FeatureFlags | — |
| `FEATURE_KNOWLEDGE_GRAPH` | Enable knowledge graph | Optional | — | `features.ts` | FeatureFlags | Dual flag system. Unify. |
| `FEATURE_WORKFLOW_AUTOMATION` | Enable workflows | Optional | — | `features.ts` | FeatureFlags | — |
| `FEATURE_ADVANCED_ANALYTICS` | Enable analytics | Optional | — | `features.ts` | FeatureFlags | — |
| `FEATURE_MULTI_PROVIDER_AI` | Enable multi-AI | Optional | — | `features.ts` | FeatureFlags | — |

---

## 9. Monitoring / Observability Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `SENTRY_DSN` | Sentry error tracking | Optional | — | `.env.example` only | Monitoring | **Not implemented.** No Sentry SDK in codebase. |
| `METRICS_BACKEND_URL` | External metrics endpoint | Optional | — | `metrics/public/route.ts` | Monitoring | — |
| `LOG_LEVEL` | Log verbosity | Optional | `"info"` | `.env.example` only | Logging | Not referenced in logger code |
| `ENABLE_MONITORING` | Monitoring toggle | Optional | `"true"` | `.env.example` only | Monitoring | Not referenced in code |
| `APP_VERSION` | App version display | Optional | `"1.0.0"` | `system.service.ts` | System | — |
| `APP_REGION` | Deployment region | Optional | `"default"` | `system.service.ts` | System | — |
| `BUILD_TIME` | Build timestamp | Optional | `new Date().toISOString()` | `admin/deployment/route.ts` | System | — |
| `npm_package_version` | Package version | Implicit | `"1.0.0"` | `health/route.ts`, `deployment/route.ts` | System | Standard Node.js variable |

---

## 10. Security Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `TRUSTED_PROXIES` | Comma-separated proxy IPs | Optional | `""` | `ratelimit.ts` | Security | — |
| `NEXT_PUBLIC_DEV_CSRF_BYPASS` | Dev CSRF bypass token | Optional | — | `csrf.middleware.ts` | Security | **Security risk if set in prod.** Ensure NODE_ENV check. |

---

## 11. Test Variables

| Variable | Purpose | Required | Default | Current Usage | Module | Recommendation |
|----------|---------|----------|---------|---------------|--------|----------------|
| `VITEST_VERBOSE` | Test verbosity | Test only | — | `test/setup.ts` | Testing | — |

---

## Critical Issues

### 1. Duplicate Environment Validators
- `src/core/config/env.ts` requires: `DATABASE_URL`, `BETTER_AUTH_SECRET`
- `src/lib/env-validator.ts` requires: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `SESSION_SECRET`
- **Impact:** Inconsistent validation depending on which module is called first
- **Fix:** Consolidate into single validator in `src/core/config/env.ts`

### 2. Inconsistent NEXT_PUBLIC_APP_URL Defaults
- Most files: `"http://localhost:3000"`
- `user/referral/route.ts` and `user/affiliate/route.ts`: `"https://tamer.ai"`
- **Impact:** In production without env var, different modules will use different base URLs
- **Fix:** Centralize URL resolution in config.ts; remove all inline defaults

### 3. Unimplemented Environment Variables
- `SENTRY_DSN` — defined but no SDK imported
- `LOG_LEVEL` — defined but logger doesn't read it
- `ENABLE_MONITORING` — defined but not checked in code
- `STORAGE_PROVIDER` — defined but storage engine always uses local
- `KILO_API_KEY`, `OPENROUTER_API_KEY` — defined in .env.example but not in code
- `IPAYMU_VA`, `IPAYMU_ENVIRONMENT` — defined in .env.example but not in code

### 4. Dual Feature Flag Systems
- `features.ts`: `FEATURE_KNOWLEDGE_GRAPH`, `FEATURE_WORKFLOW_AUTOMATION`, etc.
- `.env.local`: `FEATURE_AFFILIATE`, `FEATURE_DRAMA`, etc.
- **Impact:** No unified feature flag system; some flags use `features.ts`, others read `process.env` directly

### 5. Security: Admin Credentials in .env
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_MASTER_KEY` are plaintext in `.env`
- `.env` is in `.gitignore` but exists on disk with real values
- `ADMIN_MASTER_KEY` is used as plain-text comparison (not just hash)
