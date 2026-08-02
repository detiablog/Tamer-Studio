# Security Standardization Report — Tamer Studio

> Generated: 2026-08-02 | Sprint: ENV-02A

---

## Changes Made

### Critical Fixes (ENV-01 → ENV-02A)

| # | Issue | Before | After | Status |
|---|-------|--------|-------|--------|
| 1 | Hardcoded `http://localhost:3000` in auth flow | `user.repository.ts:25,211` used hardcoded URL | Uses `config.app.url` | ✅ Fixed |
| 2 | Real credentials in `.env` | Admin password `Aoneshoper@2026Admin`, auth secrets committed | Placeholders only | ✅ Fixed |
| 3 | Plain-text admin key comparison | `verify.ts` compared plaintext `ADMIN_MASTER_KEY` | Hash-only (SHA-256 + scrypt) | ✅ Fixed |
| 4 | Duplicate env validators | Two parallel validators with different required lists | Single validator in `env.ts` | ✅ Fixed |
| 5 | `NEXT_PUBLIC_APP_URL` optional | Defaulted to `http://localhost:3000` | Required — no default | ✅ Fixed |
| 6 | Hardcoded domain `tamer.studio` | 25+ occurrences across SEO/homepage | All use `process.env.NEXT_PUBLIC_APP_URL` | ✅ Fixed |
| 7 | Inconsistent emails | `support@tamer.studio`, `support@tamerstudio.com`, `noreply@tamer.studio` | Canonical: `support@tamerstudio.com`, `noreply@tamerstudio.com` | ✅ Fixed |
| 8 | `scripts/create-admin.ts` hardcoded credentials | Password `"SecureAdminPassword123!"` in source | Reads from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars | ✅ Fixed |
| 9 | Docker hardcoded DB password | `POSTGRES_PASSWORD: tamer_password` | `${POSTGRES_PASSWORD:?...}` (required) | ✅ Fixed |
| 10 | Hardcoded `https://tamer.ai` fallback | 4 occurrences in referral/affiliate routes | Uses `config.app.url` | ✅ Fixed |

---

## Configuration Architecture (After)

```
Environment Variables (.env files)
    ↓
Single Env Validator (src/core/config/env.ts)
    ↓
Config Singleton (src/core/config/config.ts)
    ↓
Constants (src/core/config/constants.ts) — NEW
    ↓
Application Code
```

### Required Environment Variables

| Variable | Purpose | Validation |
|----------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection | Required — throws if missing |
| `BETTER_AUTH_SECRET` | Auth signing secret | Required — throws if missing |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Required — throws if missing |

### Canonical Defaults

| Setting | Value | Config Source |
|---------|-------|---------------|
| Support Email | `support@tamerstudio.com` | `EMAILS.support` |
| Default Sender | `noreply@tamerstudio.com` | `config.notifications.defaultFromEmail` |
| Twitter Handle | `@tamerstudio` | `SOCIAL.twitter` |
| Discord | `https://discord.gg/tamerstudio` | `SOCIAL.discord` |
| GitHub | `https://github.com/tamerstudio` | `SOCIAL.github` |

---

## Security Checklist

- [x] No plaintext credentials in source code
- [x] No hardcoded `http://localhost:3000` in runtime logic
- [x] No hardcoded `https://tamer.studio` in runtime logic
- [x] No hardcoded `https://tamer.ai` in runtime logic
- [x] No hardcoded admin emails (`admin@tamer.studio`)
- [x] No hardcoded support emails (`support@tamer.studio`)
- [x] No plaintext admin key comparison
- [x] Docker uses environment variables
- [x] Bootstrap admin reads from env vars
- [x] Environment validation is centralized
- [x] Single env validator (no duplicates)
- [x] `NEXT_PUBLIC_APP_URL` is required

---

## Files Changed Summary

| Category | Files Changed |
|----------|--------------|
| Core config | 4 (env.ts, config.ts, constants.ts, index.ts) |
| Deleted | 1 (env-validator.ts) |
| Auth/Admin | 3 (verify.ts, user.repository.ts, create-admin.ts) |
| Docker | 2 (docker-compose.local.yml, .env files) |
| API routes | 7 (register, billing, referral, affiliate, create-admin, 2fa, landing/seo) |
| Services | 6 (email.service.ts, payment.service.ts ×2, commerce-runtime.ts, templates.ts, settings.service.ts) |
| SEO | 11 (seo-runtime, schema, metadata, twitter, opengraph, canonical, hreflang, ai-search, sitemap, seo-validation, robots) |
| Components | 4 (Footer, AdminAvatarDropdown, SupportContent, ContactContent) |
| Config files | 3 (.env, .env.local, .env.example, production.env.example) |
| **Total** | **41 files** |
