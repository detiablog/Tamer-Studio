# Import Side Effects Analysis

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Critical Side Effects (Execute Immediately on Import)

### 1. Database Connection Pool — `src/lib/db/client.ts`

| Attribute | Detail |
|---|---|
| **File** | `src/lib/db/client.ts:9-15` |
| **Code** | `postgres(connectionString, { max: 10, idle_timeout: 30, connect_timeout: 5 })` |
| **Side effect?** | **YES** — Creates PostgreSQL connection pool at module scope |
| **Impact** | **CRITICAL** — 10 connections created; blocks if DB unreachable (5s timeout) |
| **Deferrable?** | YES — Should use lazy initialization |

### 2. Redis Client — `src/core/security/ratelimit.ts`

| Attribute | Detail |
|---|---|
| **File** | `src/core/security/ratelimit.ts:5-32` |
| **Code** | `new Redis({ url: ..., token: ... })` + 3 Ratelimit instances |
| **Side effect?** | **YES** — Creates Redis client AND 3 Ratelimit objects at module scope |
| **Impact** | **MEDIUM** — Redis client created even when env vars are empty |
| **Deferrable?** | YES — Wrap in lazy getters |

### 3. EventHub Initialization — `src/app/layout.tsx:23`

| Attribute | Detail |
|---|---|
| **File** | `src/app/layout.tsx:23` |
| **Code** | `initializeEventHub()` |
| **Side effect?** | **YES** — Creates EventLog, 3 subscribers, triggers DB import |
| **Impact** | **HIGH** — Triggers transitive DB connection pool creation |
| **Deferrable?** | YES — Could initialize on first API request |

### 4. Navigation Bootstrap — `src/app/layout.tsx:22`

| Attribute | Detail |
|---|---|
| **File** | `src/app/layout.tsx:22` |
| **Code** | `bootstrapNavigation()` |
| **Side effect?** | **YES** — Registers 49 navigation items into in-memory Maps |
| **Impact** | **MEDIUM** — Iterates through 4 arrays, creates objects |
| **Deferrable?** | Partially — Data needed for rendering but could be deferred |

### 5. SEO Runtime — `src/app/layout.tsx:21`

| Attribute | Detail |
|---|---|
| **File** | `src/app/layout.tsx:21` |
| **Code** | `getSEORuntime()` + `resolveOrganization()` |
| **Side effect?** | **YES** — Creates SEORuntime + 10 sub-runtime singletons |
| **Impact** | **MEDIUM** — 10+ singleton objects created |
| **Deferrable?** | Partially — Singletons are cheap but numerous |

### 6. Auth Client — `src/core/auth/client.ts`

| Attribute | Detail |
|---|---|
| **File** | `src/core/auth/client.ts:3-5` |
| **Code** | `createAuthClient({ baseURL: ... })` |
| **Side effect?** | **YES** — Calls createAuthClient at module scope |
| **Impact** | **LOW** — Lightweight client object |
| **Deferrable?** | MEDIUM — Could use lazy initialization |

### 7. Commerce Runtime — `src/core/commerce/commerce-runtime.ts`

| Attribute | Detail |
|---|---|
| **File** | `src/core/commerce/commerce-runtime.ts:41-44` |
| **Code** | `new WalletService()`, `new StripeGateway()`, etc. |
| **Side effect?** | **YES** — Creates 4 service instances at module scope |
| **Impact** | **MEDIUM** — Stripe client + DB repositories |
| **Deferrable?** | YES — Only needed for billing routes |

---

## Module-Level Singleton Exports (100+ instances)

Every file below creates `new ServiceClass()` at module scope:

### DB-Dependent Singletons (trigger pool creation when imported)

| File | Export | Imports DB? |
|------|--------|-------------|
| `audit/audit.service.ts` | `auditService` | YES |
| `ai/provider-router.ts` | `providerRouter` | YES |
| `workflow/workflow-engine.ts` | `workflowEngine` | YES |
| `security-hub/*.service.ts` | 8 services | YES |
| `analytics/*.service.ts` | 2 services | YES |
| `ai-gateway/*.service.ts` | 7 services | YES |
| `storage/storage-engine.ts` | `storageEngine` | YES |
| `campaign/*.service.ts` | 2 services | YES |
| `scaling/*.service.ts` | 7 services | YES |
| `learning-engine/*.service.ts` | 6 services | YES |
| `asset-intelligence/*.service.ts` | 10 services | YES |
| `creative-memory/*.service.ts` | 4 services | YES |
| `localization/*.service.ts` | 3 services | YES |
| `modules/email/*.ts` | 8 services | YES |

### Lighter Singletons (no DB dependency)

| File | Export |
|------|--------|
| `logger/logger.ts` | `logger` |
| `events/event-bus.ts` | `eventBus` |
| `foundation/container.ts` | `container` |
| `foundation/lifecycle.ts` | `lifecycle` |
| `cms/page.registry.ts` | `pageRegistry` |
| `cms/components/component.library.ts` | `componentLibrary` |
| `automation/*.service.ts` | 7 services |

---

## Global State Mutations

| File | Line | Code | Impact |
|------|------|------|--------|
| `lib/db/client.ts` | 18-21 | `globalThis.onExit = async () => { await client.end(); }` | Low |

---

## No Matches Found For

| Pattern | Result |
|---------|--------|
| `process.on()` | None |
| `window.xxx = ...` | None |
| Classic IIFE | None |
| `addEventListener` at module scope | None |
| `EventEmitter` | None |

---

## Summary: Import Chain from layout.tsx

```
layout.tsx
├── @/core/config         → lazy getter (validation on first access)
├── @/core/seo            → getSEORuntime() → 10 sub-runtime singletons
├── @/core/navigation     → bootstrapNavigation() → 49 nav items
├── @/core/events/event-hub → initializeEventHub() → 3 subscribers
│   ├── event-bus         → EventBus singleton
│   ├── cache-invalidation → CacheInvalidationSubscriber
│   ├── audit-log         → AuditLogSubscriber → IMPORTS DB
│   └── notification      → NotificationSubscriber
└── NO direct import of @/lib/db
```

**The root layout does NOT directly import `@/lib/db`.** The DB connection is triggered **transitively** through `initializeEventHub()` → `AuditLogSubscriber` → `audit.service.ts` → `audit.repository.ts` → `db`.
