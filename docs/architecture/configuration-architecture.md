# Configuration Architecture — Tamer Studio

> Generated: 2026-08-02

---

## Overview

Tamer Studio uses a **three-tier configuration hierarchy**:

```
Layer 1: Environment Variables (.env files)
    ↓
Layer 2: Core Config Singleton (src/core/config/)
    ↓
Layer 3: Database-Backed Runtime Settings (src/core/*/settings.ts)
```

---

## Layer 1: Environment Variables

### File Structure

```
.env                    # Active development config (contains secrets)
.env.local              # Local overrides (contains dev credentials)
.env.example            # Template — canonical list of all supported vars
production.env.example  # Production template with Docker-oriented defaults
```

### Loading Order (Next.js)
1. `.env` (base)
2. `.env.local` (overrides `.env`, except in production)
3. `.env.development` / `.env.production` (environment-specific)

### Variables by Category

| Category | Variables | Required |
|----------|-----------|----------|
| Database | `DATABASE_URL` | **Yes** |
| Auth | `BETTER_AUTH_SECRET`, `AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_URL`, `SESSION_SECRET`, `JWT_SECRET` | `BETTER_AUTH_SECRET` **Yes** |
| App | `NODE_ENV`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` | `NEXT_PUBLIC_APP_URL` Recommended |
| Admin | `ADMIN_MASTER_KEY`, `ADMIN_MASTER_KEY_HASH`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Optional |
| Redis | `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional |
| AI | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY` | Optional (per provider) |
| Payment | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IPAYMU_API_KEY`, etc. | Optional (per provider) |
| Storage | `R2_*`, `ASSET_STORAGE_DIR`, `STORAGE_PROVIDER` | Optional |
| Email | `SMTP_*`, `NOTIFICATION_*`, `EMAIL_ENCRYPTION_KEY` | Optional |
| Feature Flags | `FEATURE_AFFILIATE`, `FEATURE_DRAMA`, etc. | Optional |
| Monitoring | `SENTRY_DSN`, `METRICS_BACKEND_URL`, `LOG_LEVEL`, `ENABLE_MONITORING` | Optional |

---

## Layer 2: Core Config Singleton

### `src/core/config/env.ts` — Validation & Access

```typescript
// Required variables
const REQUIRED_ENV_VARS = {
  DATABASE_URL: "DATABASE_URL",
  BETTER_AUTH_SECRET: "BETTER_AUTH_SECRET",
};

// Functions
validateEnv()              // Throws if required vars missing
getEnv(key)                // Returns value or throws
getOptionalEnv(key, default) // Returns value or default
```

### `src/core/config/config.ts` — Application Config

```typescript
const config = {
  database: { url: string },
  auth: { secret: string, url: string },
  admin: { masterKeyHash: string },
  app: { url: string, env: string },
  notifications: {
    emailProvider: string,
    smsProvider: string,
    pushProvider: string,
    defaultFromEmail: string,
    defaultFromName: string,
  },
};
```

**Singleton pattern** — config is lazy-loaded on first access and cached.

### `src/core/config/features.ts` — Feature Flags

Dual-mode feature flags:
- **Env-based:** `FEATURE_<FLAG_NAME>=true` at startup
- **Runtime-mutable:** `setFeatureFlag()`, `removeFeatureFlag()` via `Map`

```typescript
const FEATURE_FLAGS = [
  "KNOWLEDGE_GRAPH",
  "WORKFLOW_AUTOMATION", 
  "ADVANCED_ANALYTICS",
  "MULTI_PROVIDER_AI",
];
```

**Note:** Additional feature flags (`AFFILIATE`, `DRAMA`, `STORY`, `TALENT`, `ADMIN`) are read directly from `process.env.FEATURE_*` in other files — not through the `features.ts` system.

---

## Layer 3: Database-Backed Runtime Settings

### Architecture

Each module has its own settings service that:
1. Loads settings from PostgreSQL on startup
2. Caches in memory
3. Provides getter/setter API
4. Persists changes to DB
5. Emits events on changes

### Settings Modules

| Module | Service | Table | Key Settings |
|--------|---------|-------|-------------|
| Admin | `SettingsService` | `platformSettings` | platformName, registrationOpen, maintenanceMode, readOnlyMode, defaultLanguage, rateLimits |
| Security Hub | `SecuritySettingsService` | `secSettings` | bruteForceProtection, IP whitelist/blacklist, CSP toggles |
| Scaling | `ScaleSettingsService` | `scaleSettings` | autoScaling, min/max workers, CDN, cache TTL |
| Operations | `OpsSettingsService` | `opsSettings` | maintenanceMode, alert emails/webhooks, health check intervals |
| Launch | `LaunchSettingsService` | `launchSettings` | launchVersion, registration toggle, emergency banner |
| Observability | `ObsSettingsService` | `obsSettings` | metrics/logging/tracing enabled, sampling rate |
| Orchestrator | `OrchestratorSettingsService` | `orchestratorSettings` | maxConcurrentExecutions, retry config |
| Automation | `AutomationSettingsService` | `automationSettings` | concurrent executions, queue size, retry delay |
| Beta Program | `BetaSettingsService` | `betaSettings` | betaEnabled, maxUsers, requireInvitation |
| Asset Intelligence | `AssetSettingsService` | `assetSettings` | autoTagging, autoClassification, qualityScoring |

---

## Framework Configuration Files

| File | Purpose | Env Vars |
|------|---------|----------|
| `next.config.ts` | Next.js: standalone output, images, packages | None |
| `tsconfig.json` | TypeScript: paths, compiler | None |
| `drizzle.config.ts` | Drizzle ORM: schema, migrations | `DATABASE_URL` |
| `vitest.config.ts` | Vitest: test runner | None |
| `eslint.config.mjs` | ESLint: lint rules | None |
| `postcss.config.mjs` | PostCSS: Tailwind v4 | None |
| `components.json` | shadcn/ui: component config | None |

---

## Infrastructure Configuration

### Docker

| File | Purpose |
|------|---------|
| `Dockerfile` | 3-stage build (deps → builder → runner) |
| `docker-compose.yml` | Production stack: app + db + redis + worker + nginx |
| `docker-compose.local.yml` | Local dev: db + redis |
| `config/docker/docker-compose.scaling.yml` | Horizontal scaling: 3 replicas |

### Nginx

| File | Purpose |
|------|---------|
| `config/nginx/nginx.conf` | Reverse proxy + SSL + security headers |
| `config/nginx/nginx.scaling.conf` | Load balancer with upstream group |

### CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Quality gates (typecheck + build) |
| `.github/workflows/deploy.yml` | Deploy pipeline (placeholder) |
| `.github/workflows/locale-sync.yml` | Auto-sync Indonesian locale |

---

## Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ENVIRONMENT                           │
│  .env / .env.local / platform env vars                  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              ENV VALIDATION                              │
│  src/core/config/env.ts                                 │
│  - validateEnv()                                        │
│  - getEnv() / getOptionalEnv()                          │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              CONFIG SINGLETON                            │
│  src/core/config/config.ts                              │
│  - config.database.url                                  │
│  - config.auth.secret                                   │
│  - config.app.url                                       │
│  - config.notifications.*                               │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              FEATURE FLAGS                               │
│  src/core/config/features.ts                            │
│  - isFeatureEnabled()                                   │
│  - setFeatureFlag() / removeFeatureFlag()               │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│         DATABASE-BACKED SETTINGS                         │
│  src/core/admin/settings/                               │
│  src/core/security-hub/settings.service.ts              │
│  src/core/scaling/settings.service.ts                   │
│  src/core/operations/settings.service.ts                │
│  (10+ module-specific settings services)                │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              APPLICATION CODE                            │
│  Services, API routes, middleware, components            │
│  consume config from all layers                         │
└─────────────────────────────────────────────────────────┘
```

---

## Issues & Recommendations

### 1. Duplicate Validators
**Current:** Two separate validators (`env.ts` and `env-validator.ts`) with different required lists.
**Fix:** Consolidate into `src/core/config/env.ts` only. Remove `src/lib/env-validator.ts`.

### 2. No Centralized Constants
**Current:** URLs, emails, social links hardcoded in 30+ files.
**Fix:** Create `src/core/config/constants.ts`:
```typescript
export const CONSTANTS = {
  URLS: {
    BASE: getOptionalEnv("NEXT_PUBLIC_APP_URL", ""),
    SEO_BASE: getOptionalEnv("NEXT_PUBLIC_SEO_URL", ""),
  },
  EMAILS: {
    SUPPORT: getOptionalEnv("SUPPORT_EMAIL", ""),
    FROM: getOptionalEnv("NOTIFICATION_DEFAULT_FROM_EMAIL", ""),
  },
  SOCIAL: {
    TWITTER: getOptionalEnv("TWITTER_HANDLE", ""),
    DISCORD: getOptionalEnv("DISCORD_URL", ""),
    GITHUB: getOptionalEnv("GITHUB_URL", ""),
  },
};
```

### 3. Dual Feature Flag Systems
**Current:** `features.ts` defines 4 flags; `.env.local` uses 5 different flags read directly.
**Fix:** Extend `features.ts` to include all feature flags, or create a unified system.

### 4. Missing Environment-Specific Templates
**Current:** Only `.env.example` and `production.env.example`.
**Fix:** Create `.env.staging.example` or document environment differences.

### 5. No Config Documentation
**Current:** `.env.example` has inline comments but no comprehensive docs.
**Fix:** This audit serves as the documentation baseline.
