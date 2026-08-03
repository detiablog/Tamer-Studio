# Bootstrap Runtime Map

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Application Startup Sequence

```
Application Startup
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  PHASE 1: Module Resolution (synchronous)           │
│  ─────────────────────────────────────────────────  │
│  1. config/config.ts        → loadConfig()          │
│     └─ validateEnv() [throws if missing env vars]   │
│  2. logger/logger.ts        → Logger.getInstance()  │
│  3. events/event-bus.ts     → EventBus.getInstance()│
│  4. events/event-hub.ts     → new EventLog()        │
│  5. seo/seo-runtime.ts      → getSEORuntime()       │
│     └─ 10 sub-runtime singletons created            │
│  6. cache/shared-cache.ts   → getSharedCache()      │
│     └─ Redis or MemoryCache selected                │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  PHASE 2: Module-Level Executions (layout.tsx)      │
│  ─────────────────────────────────────────────────  │
│  7. config.app.url          → triggers loadConfig() │
│  8. getSEORuntime()         → SEORuntime singleton  │
│  9. bootstrapNavigation()   → 49 nav items registered│
│  10. initializeEventHub()   → 3 subscribers created │
│      └─ AuditLogSubscriber → imports db → POOL      │
│  11. orgSchema              → JSON-LD generated     │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  PHASE 3: React Component Rendering                 │
│  ─────────────────────────────────────────────────  │
│  12. ThemeProvider          → next-themes wrapper   │
│  13. LocalizationProvider   → LocalizationService   │
│  14. CurrencyProvider       → CurrencyContext       │
│  15. HtmlLangUpdater        → <html lang=""> sync  │
│  16. {children}             → Page content          │
│  17. MobileNav              → Mobile bottom nav     │
│  18. PWAInstallPrompt       → PWA install banner    │
│  19. Toaster                → Sonner notifications  │
└─────────────────────────────────────────────────────┘
    │
    ▼
  Ready
```

---

## Singletons Created During Bootstrap

| # | Singleton | Created In | Lazy? | Impact |
|---|-----------|-----------|-------|--------|
| 1 | AppConfig | `config/config.ts` | Yes (getter) | Low |
| 2 | Logger | `logger/logger.ts` | Yes (static) | Low |
| 3 | EventBus | `events/event-bus.ts` | Yes (static) | Low |
| 4 | EventLog | `events/event-hub.ts` | No (module-level) | Low |
| 5 | SEORuntime | `seo/seo-runtime.ts` | Yes | Medium |
| 6-15 | 10 SEO sub-runtimes | `seo/*.ts` | Yes | Medium |
| 16 | SEOCache | `seo/seo-cache.ts` | Yes | Low |
| 17 | NavigationRuntime | `navigation/navigation-runtime.ts` | Yes | Medium |
| 18 | NavigationRegistry | `navigation/navigation.registry.ts` | Yes | Low |
| 19 | NavigationCache | `navigation/navigation-cache.ts` | Yes | Low |
| 20 | HomepageCache | `homepage/homepage-cache.ts` | Yes | Low |
| 21 | SharedCache | `cache/shared-cache.ts` | Yes | Low |
| 22 | CacheInvalidationSubscriber | `events/subscribers/cache-invalidation.subscriber.ts` | Yes | Low |
| 23 | AuditLogSubscriber | `events/subscribers/audit-log.subscriber.ts` | Yes | **HIGH** (triggers DB) |
| 24 | NotificationSubscriber | `events/subscribers/notification.subscriber.ts` | Yes | Low |
| 25 | LocalizationService | `lib/localization/index.ts` | Yes | Low |
| 26 | DB (Drizzle) | `lib/db/client.ts` | **No** (module-level) | **CRITICAL** |
| 27 | AuditService | `audit/audit.service.ts` | No (module-level) | **HIGH** (imports db) |

---

## External Service Connections

| Service | Created When | Connection Type | File |
|---------|-------------|----------------|------|
| PostgreSQL | `lib/db/client.ts` import | Pool (max:10) via postgres-js | `lib/db/client.ts` |
| Redis (Upstash) | `cache/shared-cache.ts` first call | REST via @upstash/redis | `cache/redis-cache.ts` |
| Redis (Upstash) | `security/ratelimit.ts` import | REST via @upstash/redis | `security/ratelimit.ts` |
| Redis (TCP) | `websocket/server.ts` init | TCP via `redis` | `websocket/server.ts` |
| Stripe | `commerce/commerce-runtime.ts` import | API client | `commerce/commerce-runtime.ts` |

---

## Critical Finding: DB Connection Chain

```
src/app/layout.tsx (line 23)
  └─ initializeEventHub()
       └─ AuditLogSubscriber.initialize()
            └─ audit.service.ts
                 └─ audit.repository.ts
                      └─ import { db } from "@/lib/db"
                           └─ postgres() connection pool created
```

**The root layout triggers a database connection pool during module evaluation.** This happens because `initializeEventHub()` creates an `AuditLogSubscriber` which imports `audit.service.ts` which imports `audit.repository.ts` which imports `db`.

---

## Build Behavior

During `next build`, the root layout is evaluated **3 times** (once per worker):
- 3 EventHub initializations logged
- 6 Redis warnings (missing config)
- 1 DB session error (dynamic server usage)

This means the initialization cost is paid **3x during build**.
