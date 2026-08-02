# Installation Capability Audit — INSTALL-AUDIT-01

> Generated: 2026-08-03
> Source: `src/` and `scripts/` (Single Source of Truth)

---

## Executive Summary

This audit determines which installation features already exist in Tamer Studio and classifies each as **Already Implemented**, **Needs Improvement**, or **Missing**.

---

## Capability Matrix

### 1. Database Migration

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/scripts/migrate.ts` (28 lines) |
| Command | `pnpm db:migrate` |
| Implementation | Drizzle ORM PostgreSQL migrator. Reads `config.database.url`, runs migrations from `./drizzle` folder, single connection. |
| Migrations | 38 SQL migration files in `drizzle/` directory |
| Drizzle Config | `drizzle.config.ts` — schema from `./src/lib/db/schema/**/*.ts`, output `./drizzle` |
| Reuse | **Direct reuse** — No changes needed |

### 2. Environment Validation

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/core/config/env.ts` (40 lines) |
| Implementation | `validateEnv()` checks 3 required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` |
| `RECOMMENDED_ENV_VARS` | `REDIS_URL`, `STORAGE_PROVIDER`, `SMTP_HOST`, `OPENAI_API_KEY` |
| `loadConfig()` | Lazy-loaded config proxy with `database`, `auth`, `admin`, `app`, `notifications` sections |
| Reuse | **Direct reuse** — Extend with additional optional checks for installer |

### 3. Health Check

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/app/api/health/route.ts` (56 lines) |
| Checks | Database (SELECT 1), Redis, Storage |
| Response | status, timestamp, version, environment, uptime, memory, per-check results |
| Status Logic | 0 unhealthy = healthy, 1 = degraded, 2+ = unhealthy |
| Additional Health | `src/core/observability/health.ts` (InMemoryHealthDashboard), `src/core/operations/health.service.ts` (OpsHealthService) |
| Reuse | **Direct reuse** — Can be called during installation to verify environment |

### 4. Configuration Validation

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/core/config/config.ts` (85 lines) |
| Implementation | `AppConfig` interface validates: database URL, auth secret, admin master key, app URL, notification providers |
| Lazy Loading | Config loaded on first access via proxy pattern |
| Reuse | **Direct reuse** — Config validates on first access |

### 5. Workspace Creation

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/core/workspace/workspace.service.ts` |
| Schema | `src/lib/db/schema/identity.ts` — `workspace` table with `ownerId`, `name`, `slug`, `type`, `settings`, `limits` |
| Seed Reference | `src/scripts/seed.ts` lines 254-278 — creates "Default Workspace" |
| Reuse | **Direct reuse** — WorkspaceService can create default workspace |

### 6. Default Settings

| Status | **Needs Improvement** |
|--------|----------------------|
| Location | `src/core/admin/settings/settings.service.ts` |
| Implementation | **In-memory** settings cache with defaults |
| Default Global Settings | platformName: "Tamer Studio", registrationOpen: true, maintenanceMode: false |
| Categories | global, ai, billing, security, rateLimits, upload |
| Issue | Settings are NOT persisted to database — lost on restart |
| Security Settings | `sec_settings` table exists in `src/lib/db/schema/security.ts` — separate from admin settings |
| Recommendation | Settings should be persisted to database or loaded from environment |

### 7. Role Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/scripts/seed.ts` lines 184-204 |
| Roles | Admin (level 100, isSystem=true), User (level 10, isSystem=true) |
| Schema | `src/lib/db/schema/identity.ts` — `role` table |
| RBAC | `src/core/admin/rbac.ts` — admin/super_admin roles with full permissions |
| Reuse | **Extract** role creation logic for installer |

### 8. Permission Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/scripts/seed.ts` lines 206-252 |
| Permissions | admin:access, user:create, workspace:create |
| Schema | `src/lib/db/schema/identity.ts` — `permission` and `role_permission` tables |
| RBAC Permissions | `src/core/admin/rbac.ts` — comprehensive route-to-permission mapping |
| Reuse | **Extract** permission seeding logic for installer |

### 9. Feature Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/scripts/seed.ts` lines 296-324 |
| Feature Flags | dark_mode, new_dashboard, ai_suggestions |
| Schema | `src/lib/db/schema/feature-flags.ts` |
| Runtime Flags | `src/core/config/features.ts` — environment-based feature flags |
| Reuse | **Direct reuse** — Feature flags can be seeded during installation |

### 10. User Registration

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/app/api/auth/register/route.ts` (138 lines) |
| Implementation | Full registration flow: validation → BetterAuth sign-up → email verification → audit |
| Validation | Name ≥3 chars, email valid, password ≥12 chars with complexity requirements |
| Rate Limiting | 5 registrations per hour per IP |
| Email Verification | Token-based, 24h expiry, logged to `email_verification_log` |
| Reuse | **Direct reuse** — Registration endpoint works for installer |

### 11. Admin Creation

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `scripts/create-admin.ts` (48 lines) |
| Implementation | Creates admin user with scrypt-hashed password in `admin` table |
| Requirements | `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars |
| Admin Auth | Separate from BetterAuth — uses master key + cookie-based sessions |
| Reuse | **Improve** — Add workspace membership, audit logging, naming parameter |

### 12. Navigation Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/core/navigation/navigation-bootstrap.ts` (671 lines) |
| Items | 50 navigation items (21 sidebar, 20 admin, 4 header, 5 footer) |
| Runtime | `src/core/navigation/navigation-runtime.ts` — in-memory, permission-filtered |
| Reuse | **Direct reuse** — `bootstrapNavigation()` registers all items |

### 13. Localization Initialization

| Status | **Needs Improvement** |
|--------|----------------------|
| Location | `src/core/localization/` (12 files) |
| Implementation | Services exist (region, currency, formatting, translation cache) but **no seed/init file** |
| Locale Files | `locales/` directory exists (translation files) |
| Missing | No default locale seeding, no locale configuration during installation |
| Recommendation | Add locale initialization during installation |

### 14. CMS/Landing Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Landing Seed | `scripts/seed-landing-sections.ts` — 14 sections, idempotent upsert |
| CMS Runtime | `src/core/cms/landing-builder-runtime.ts` — full visual editor |
| Page Helper | `src/core/cms/landing-page.helper.ts` — lazy page creation |
| Reuse | **Direct reuse** — Landing seed + page helper |

### 15. Storage Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/core/storage/storage-engine.ts` (195 lines) |
| Implementation | Full file storage with quota management, soft delete, folder management |
| Providers | Local storage (R2 configured but optional) |
| Reuse | **Direct reuse** — StorageEngine works out of the box |

### 16. AI Provider Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/scripts/seed.ts` lines 326-424 |
| Providers | OpenAI, Anthropic (seeded with config) |
| Schema | `src/lib/db/schema/ai-providers.ts` |
| Reuse | **Extract** AI provider seeding for installer (environment-based) |

### 17. Billing/Subscription Initialization

| Status | **Already Implemented** |
|--------|------------------------|
| Commerce Seed | `src/core/commerce/seed.ts` — plans, billing options, pricing |
| Schema | `src/lib/db/schema/billing.ts`, `commerce.ts`, `commerce-plans.ts` |
| Reuse | **Direct reuse** — `ensureSeeded()` |

### 18. Cron/Scheduled Jobs

| Status | **Already Implemented** |
|--------|------------------------|
| Location | `src/core/jobs/cron-setup.ts` (105 lines) |
| Jobs | Daily metrics aggregation (1 AM UTC), hourly health check |
| Reuse | **Direct reuse** — Optional during installation |

---

## Summary Table

| # | Capability | Status | Reusable? | Action |
|---|-----------|--------|-----------|--------|
| 1 | Database Migration | ✅ Implemented | Yes | Keep |
| 2 | Environment Validation | ✅ Implemented | Yes | Extend |
| 3 | Health Check | ✅ Implemented | Yes | Keep |
| 4 | Configuration Validation | ✅ Implemented | Yes | Keep |
| 5 | Workspace Creation | ✅ Implemented | Yes | Keep |
| 6 | Default Settings | ⚠️ In-Memory | Partial | Persist to DB |
| 7 | Role Initialization | ✅ Implemented | Extract | Extract |
| 8 | Permission Initialization | ✅ Implemented | Extract | Extract |
| 9 | Feature Initialization | ✅ Implemented | Yes | Keep |
| 10 | User Registration | ✅ Implemented | Yes | Keep |
| 11 | Admin Creation | ✅ Implemented | Improve | Add workspace |
| 12 | Navigation Init | ✅ Implemented | Yes | Keep |
| 13 | Localization Init | ⚠️ Partial | No | Create init |
| 14 | CMS/Landing Init | ✅ Implemented | Yes | Keep |
| 15 | Storage Init | ✅ Implemented | Yes | Keep |
| 16 | AI Provider Init | ✅ Implemented | Extract | Extract |
| 17 | Billing Init | ✅ Implemented | Yes | Keep |
| 18 | Cron Jobs | ✅ Implemented | Yes | Optional |

---

## Key Findings

### Already Implemented (14 of 18)
Most installation capabilities already exist. The application has:
- Complete database migration system
- Environment validation
- Health checks
- Workspace, role, permission, feature flag, navigation, CMS, storage, billing initialization
- Admin creation script

### Needs Improvement (3 of 18)
1. **Default Settings** — In-memory, not persisted to database
2. **Localization Init** — Services exist but no seed/init file
3. **Admin Creation** — Missing workspace membership, audit logging

### Missing (1 of 18)
None — All core installation capabilities exist. The gap is in **orchestration**, not implementation.

---

## Orchestration Gap

The critical missing piece is **an installation wizard that orchestrates existing components**:

```
Installation Wizard
├── 1. Validate Environment (config/env.ts)
├── 2. Check Health (api/health/route.ts)
├── 3. Run Migrations (scripts/migrate.ts)
├── 4. Create Admin (scripts/create-admin.ts — improved)
├── 5. Create Default Workspace (workspace.service.ts)
├── 6. Seed Roles & Permissions (extract from seed.ts)
├── 7. Seed Commerce Plans (commerce/seed.ts)
├── 8. Seed Landing Sections (seed-landing-sections.ts)
├── 9. Seed Navigation (navigation-bootstrap.ts)
├── 10. Initialize Settings (settings.service.ts — persist)
├── 11. Initialize Localization (new init file)
└── 12. Start Cron Jobs (cron-setup.ts — optional)
```

**No new implementation is needed** — only orchestration of existing modules.
