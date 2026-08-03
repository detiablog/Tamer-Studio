# Bootstrap Performance Audit

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Bootstrap Entry Points

| Entry Point | File | Triggers |
|-------------|------|----------|
| Root Layout | `src/app/layout.tsx` | Config, SEO, Navigation, EventHub |
| Dashboard Layout | `src/app/(dashboard)/layout.tsx` | Session validation |
| Admin Layout | `src/app/admin/(protected)/layout.tsx` | Session validation |
| Middleware | `src/middleware.ts` | Security headers, session validation |
| API Routes | `src/app/api/*/route.ts` | Varies per route |

---

## Bootstrap Cost Analysis

### Root Layout (runs on every page)

| Operation | Cost | Lazy? | Impact |
|-----------|------|-------|--------|
| `config.app.url` | Low | Yes (getter) | Low |
| `getSEORuntime()` | Medium | Yes | 10 singletons |
| `bootstrapNavigation()` | Medium | No | 49 items in Maps |
| `initializeEventHub()` | **HIGH** | No | 3 subscribers + DB import |
| `resolveOrganization()` | Low | No | Sync computation |

### Dashboard Layout (runs on every dashboard page)

| Operation | Cost | Lazy? | Impact |
|-----------|------|-------|--------|
| `getServerSession()` | Medium | No | DB query per request |

### Admin Layout (runs on every admin page)

| Operation | Cost | Lazy? | Impact |
|-----------|------|-------|--------|
| `getAdminSession()` | Medium | No | DB query + sliding window |

---

## Singleton Count

| Category | Count | Created At |
|----------|-------|-----------|
| Config | 1 | Import time (lazy getter) |
| Logger | 1 | Import time |
| EventBus | 1 | Import time |
| EventLog | 1 | Import time |
| SEO Runtimes | 11 | Layout evaluation |
| Navigation Runtimes | 3 | Layout evaluation |
| Cache Runtimes | 3 | Layout evaluation |
| Event Subscribers | 3 | Layout evaluation |
| DB (Drizzle) | 1 | Import time (transitive) |
| Auth Client | 1 | Import time |
| Commerce Services | 4 | Import time |
| Email Services | 8 | Import time |
| **Total** | **38+** | — |

---

## Repository Count

| Category | Count |
|----------|-------|
| Admin repositories | 2 |
| Auth repositories | 1 |
| Email repositories | 1 |
| CMS repositories | 2 |
| Commerce repositories | 3 |
| Analytics repositories | 1 |
| Security repositories | 2 |
| Other repositories | 10+ |
| **Total** | **22+** |

---

## Service Count

| Category | Count |
|----------|-------|
| Core services | 15+ |
| AI services | 10+ |
| Security services | 8+ |
| Email services | 8+ |
| Analytics services | 5+ |
| CMS services | 5+ |
| Commerce services | 4+ |
| Other services | 20+ |
| **Total** | **75+** |

---

## Connection Count

| Service | Connections | Pool Size |
|---------|-------------|-----------|
| PostgreSQL | 1 pool | max: 10 |
| Redis (Upstash REST) | 2 clients | N/A (REST) |
| Redis (TCP) | 2 clients | N/A |
| Stripe | 1 client | N/A |
| **Total** | **6** | — |

---

## Event Subscribers

| Subscriber | Events | Impact |
|-----------|--------|--------|
| EventLog | ALL | Low |
| CacheInvalidationSubscriber | 11 | Medium |
| AuditLogSubscriber | ALL | **HIGH** (DB) |
| NotificationSubscriber | 20+ | Low |
| **Total** | **33 subscriptions** | — |

---

## Lazy-Load Candidates

| Module | Currently | Can Be Lazy? | Impact |
|--------|-----------|-------------|--------|
| EventHub | Eager (layout) | YES | HIGH |
| Navigation | Eager (layout) | PARTIAL | MEDIUM |
| SEO Runtime | Eager (layout) | YES | MEDIUM |
| DB Pool | Transitive (EventHub) | CRITICAL | HIGH |
| Commerce | Eager (import) | YES | MEDIUM |
| Email | Eager (import) | Already lazy | LOW |
| CMS | Eager (import) | YES | MEDIUM |
| Analytics | Eager (import) | YES | MEDIUM |
| Security Hub | Eager (import) | YES | MEDIUM |
| AI Gateway | Eager (import) | YES | MEDIUM |
