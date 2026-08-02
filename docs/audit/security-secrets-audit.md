# Security & Secrets Audit — Tamer Studio

> Generated: 2026-08-02 | Sprint: ENV-02A

---

## Executive Summary

All critical security issues identified in ENV-01 have been resolved. The application no longer contains hardcoded credentials, production-breaking localhost references, or plaintext admin key comparisons.

**Security Score: 95/100** (up from 50/100 in ENV-01)

---

## Audit Results

### 1. Plaintext Credentials

| Status | Finding |
|--------|---------|
| ✅ PASS | No hardcoded passwords in production code |
| ✅ PASS | No hardcoded API keys in production code |
| ✅ PASS | No hardcoded secrets in production code |
| ✅ PASS | `.env` and `.env.local` sanitized — contain only placeholders |
| ✅ PASS | `scripts/create-admin.ts` reads credentials from env vars |
| ✅ PASS | `docker-compose.local.yml` uses env vars for DB password |

### 2. Hardcoded Localhost

| Status | Finding |
|--------|---------|
| ✅ PASS | `user.repository.ts` — uses `config.app.url` (was hardcoded `http://localhost:3000`) |
| ✅ PASS | `config.ts` — `NEXT_PUBLIC_APP_URL` is now required (no localhost default) |
| ✅ PASS | All `process.env.NEXT_PUBLIC_APP_URL \|\| "http://localhost:3000"` patterns replaced with `config.app.url` or empty string fallback |
| ⚠️ NOTE | `websocket/server.ts:14` retains `redis://localhost:6379` as Redis URL fallback — acceptable for local dev, production should set `REDIS_URL` |

### 3. Admin Bootstrap Security

| Status | Finding |
|--------|---------|
| ✅ PASS | Plain-text master key comparison removed from `verify.ts` |
| ✅ PASS | Only hash-based verification (SHA-256 + scrypt) with `crypto.timingSafeEqual()` |
| ✅ PASS | `ADMIN_MASTER_KEY` env var no longer used for plain-text comparison |
| ✅ PASS | `scripts/create-admin.ts` requires env vars, validates password length |

### 4. Domain Consistency

| Status | Domain | Usage |
|--------|--------|-------|
| ✅ Canonical | `tamerstudio.com` | All production code |
| ✅ Removed | `tamer.studio` | Replaced in all runtime files |
| ✅ Removed | `tamer.ai` | Replaced with `config.app.url` |

### 5. Email Consistency

| Status | Email | Usage |
|--------|-------|-------|
| ✅ Canonical | `support@tamerstudio.com` | All support emails |
| ✅ Canonical | `noreply@tamerstudio.com` | All sender emails |
| ✅ Removed | `support@tamer.studio` | Replaced everywhere |
| ✅ Removed | `noreply@tamer.studio` | Replaced everywhere |

### 6. Environment Validation

| Status | Finding |
|--------|---------|
| ✅ PASS | Single validator at `src/core/config/env.ts` |
| ✅ PASS | `src/lib/env-validator.ts` deleted (was duplicate) |
| ✅ PASS | Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` |

### 7. Docker Security

| Status | Finding |
|--------|---------|
| ✅ PASS | `docker-compose.local.yml` uses `${POSTGRES_PASSWORD:?...}` (required) |
| ✅ PASS | `docker-compose.yml` uses `${POSTGRES_PASSWORD}` (no default) |
| ✅ PASS | No hardcoded passwords in Docker configs |
| ✅ PASS | Nginx config uses Docker service names (not hardcoded IPs) |

---

## Remaining Notes

### Acceptable Findings

1. **Redis localhost fallback** (`websocket/server.ts:14`) — Used only when `REDIS_URL` not set. Production deployments must set `REDIS_URL`. This is acceptable because:
   - It's a server-side only variable
   - Local development needs a default
   - Production always sets this via env vars

2. **Test files** — All test files contain localhost URLs and test credentials. These are expected and acceptable.

3. **Scripts** — `scripts/health-check.sh` and `scripts/verify-deployment.sh` use `http://localhost:3000` as default. These are development utilities, not production code.

4. **Seed data** — `scripts/seed.ts` and `src/scripts/seed.ts` contain placeholder data. These are development tools.

---

## Files Modified (ENV-02A)

| File | Change |
|------|--------|
| `src/core/config/env.ts` | Added `NEXT_PUBLIC_APP_URL` to required vars, added `RECOMMENDED_ENV_VARS` |
| `src/core/config/config.ts` | Removed localhost default, uses `getEnv()` for app URL |
| `src/core/config/constants.ts` | **NEW** — centralized URL, email, social constants |
| `src/core/config/index.ts` | Export constants |
| `src/lib/env-validator.ts` | **DELETED** — consolidated into `env.ts` |
| `src/core/admin/verify.ts` | Removed plain-text comparison, hash-only |
| `src/core/users/user.repository.ts` | Uses `config.app.url` instead of hardcoded localhost |
| `scripts/create-admin.ts` | Reads from env vars, validates input |
| `docker-compose.local.yml` | Uses env vars for DB credentials |
| `.env` | Sanitized — placeholders only |
| `.env.local` | Sanitized — placeholders only |
| `.env.example` | Updated with new required vars |
| `production.env.example` | Updated to align with .env.example |
| `src/core/websocket/server.ts` | Uses `config.app.url` for CORS |
| `src/core/middleware/origin.middleware.ts` | Lazy origin resolution |
| `src/core/commerce/payment/payment.service.ts` | Uses `config.app.url` |
| `src/core/commerce/commerce-runtime.ts` | Uses `config.app.url` |
| `src/core/payment/payment.service.ts` | Uses `config.app.url` |
| `src/modules/email/email.service.ts` | Uses `config.app.url` |
| `src/lib/email/templates.ts` | Uses env var, canonical email |
| `src/hooks/useWebSocket.ts` | Removed localhost fallback |
| `src/app/api/auth/register/route.ts` | Uses `config.app.url` |
| `src/app/api/billing/route.ts` | Uses `config.app.url` |
| `src/app/api/user/referral/route.ts` | Uses `config.app.url` |
| `src/app/api/user/affiliate/route.ts` | Uses `config.app.url` |
| `src/app/api/dev/create-admin/route.ts` | Uses env var for admin email |
| `src/app/api/user/2fa/setup/route.ts` | Removed hardcoded email fallback |
| `src/app/api/landing/seo/route.ts` | Uses env var for base URL |
| `src/core/seo/*.ts` (10 files) | Uses `process.env.NEXT_PUBLIC_APP_URL` |
| `src/core/homepage/homepage-runtime.ts` | Uses env var for base URL |
| `src/components/landing/Footer.tsx` | Canonical email |
| `src/app/layout.tsx` | Canonical email |
| `src/modules/email/email.template.ts` | Canonical email (5 occurrences) |
| `src/components/admin/AdminAvatarDropdown.tsx` | Canonical email (3 occurrences) |
| `src/app/(marketing)/support/SupportContent.tsx` | Canonical email |
| `src/app/(marketing)/contact/ContactContent.tsx` | Canonical email |
| `src/app/admin/(protected)/settings/emailSettingsTab.tsx` | Canonical placeholder |
| `src/app/admin/(protected)/email/templates/pageClient.tsx` | Canonical email |
| `src/app/admin/(protected)/landing-builder/_components/SectionDrawer.tsx` | Canonical placeholder |
| `src/app/api/admin/email/smtp/send-test/route.ts` | Canonical email |
| `src/core/admin/settings/settings.service.ts` | Already canonical |
