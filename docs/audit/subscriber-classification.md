# Subscriber Classification

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02B

---

## Subscriber Matrix

| Subscriber | Trigger | DB | Lazy Candidate | Classification |
|-----------|---------|-----|---------------|----------------|
| CacheInvalidationSubscriber | 11 CMS/homepage events | No (cache only) | Yes | **DEFERRED** |
| AuditLogSubscriber | ALL events | **YES** (audit.service → db) | Yes | **DEFERRED** |
| NotificationSubscriber | 20+ domain events | No (logging only) | Yes | **DEFERRED** |
| EventLog (global) | ALL events | No (in-memory) | No | **KEEP** (already lazy) |

---

## Classification Details

### CacheInvalidationSubscriber

- **Purpose**: Invalidates HomepageCache, SEOCache, NavigationCache on CMS events
- **Dependencies**: HomepageCache, SEOCache, NavigationCache (all in-memory/cache)
- **DB dependency**: No
- **Lazy candidate**: Yes — only needed when CMS events are published
- **Classification**: **DEFERRED** — registered on first event

### AuditLogSubscriber

- **Purpose**: Writes audit logs to database on all events
- **Dependencies**: `auditService` → `audit.repository.ts` → `db`
- **DB dependency**: **YES** — this is the critical chain
- **Lazy candidate**: Yes — only needed when events are published
- **Classification**: **DEFERRED** — registered on first event

### NotificationSubscriber

- **Purpose**: Dispatches notifications on domain events
- **Dependencies**: EventPublisher (lightweight)
- **DB dependency**: No (currently logging only)
- **Lazy candidate**: Yes — only needed when domain events are published
- **Classification**: **DEFERRED** — registered on first event

### EventLog

- **Purpose**: In-memory event history
- **Dependencies**: None
- **DB dependency**: No
- **Lazy candidate**: No — already created at module level (lightweight)
- **Classification**: **KEEP** — already efficient

---

## Impact Analysis

### Before (Eager Registration)

```
layout.tsx module evaluation
  → initializeEventHub()
    → import audit-log.subscriber
      → import audit.service
        → import db
          → postgres() ← POOL CREATED
```

### After (Deferred Registration)

```
layout.tsx module evaluation
  → initializeEventHub()
    → setupEventLogging() ← lightweight
    → registerSubscribers() ← async, dynamic imports
      → import("./subscribers/audit-log.subscriber") ← deferred
        → import audit.service ← deferred
          → import db ← deferred
            → postgres() ← DEFERRED until first event
```

---

## Recommendation

All 3 subscribers should be deferred. The implementation uses `Promise.all()` with dynamic imports to register all subscribers asynchronously on first event.

**Result**: DB pool creation is deferred until first event is published, not at module evaluation time.
