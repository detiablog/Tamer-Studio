# Bootstrap Runtime Decoupling

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02B

---

## What Changed

**1 file modified**: `src/core/events/event-hub.ts`

Converted eager subscriber registration to lazy dynamic imports. Subscribers are now registered asynchronously on first event, not at module evaluation time.

---

## Before/After

### Before (Eager)

```typescript
// event-hub.ts — top-level imports
import { getCacheInvalidationSubscriber } from "./subscribers/cache-invalidation.subscriber";
import { getAuditLogSubscriber } from "./subscribers/audit-log.subscriber";
import { getNotificationSubscriber } from "./subscribers/notification.subscriber";

export function initializeEventHub(): void {
  // Subscribers imported at module level → triggers DB import chain
  getCacheInvalidationSubscriber().initialize();
  getAuditLogSubscriber().initialize();  // → auditService → db → postgres()
  getNotificationSubscriber().initialize();
}
```

**Problem**: Top-level imports of subscriber modules trigger the DB import chain at module evaluation time.

### After (Deferred)

```typescript
// event-hub.ts — no top-level subscriber imports
async function registerSubscribers(): Promise<void> {
  if (subscribersRegistered) return;
  subscribersRegistered = true;

  const [
    { getCacheInvalidationSubscriber },
    { getAuditLogSubscriber },
    { getNotificationSubscriber },
  ] = await Promise.all([
    import("./subscribers/cache-invalidation.subscriber"),
    import("./subscribers/audit-log.subscriber"),
    import("./subscribers/notification.subscriber"),
  ]);

  getCacheInvalidationSubscriber().initialize();
  getAuditLogSubscriber().initialize();
  getNotificationSubscriber().initialize();
}
```

**Solution**: Dynamic imports inside async function. Subscribers loaded only when first event triggers registration.

---

## Architecture Preserved

| Component | Status |
|-----------|--------|
| EventBus singleton | PRESERVED |
| EventHub singleton | PRESERVED |
| EventLog | PRESERVED |
| CacheInvalidationSubscriber | PRESERVED |
| AuditLogSubscriber | PRESERVED |
| NotificationSubscriber | PRESERVED |
| Navigation bootstrap | PRESERVED |
| SEO runtime | PRESERVED |

---

## Files Modified

| File | Change |
|------|--------|
| `src/core/events/event-hub.ts` | Replaced static imports with dynamic imports |

## Files NOT Modified

| File | Reason |
|------|--------|
| `src/app/layout.tsx` | No changes needed |
| `src/core/events/event-bus.ts` | Preserved |
| `src/core/navigation/navigation-bootstrap.ts` | Preserved |
| `src/core/seo/seo-runtime.ts` | Preserved |
| All repositories | No changes |
| All services | No changes |
| Authentication | No changes |

---

## Verification

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Dev server startup | No EventHub init | Clean (1261ms) | PASS |
| GET /admin | 307 redirect | 307 | PASS |
| GET /admin/login | 200 with UI | 200 | PASS |
| GET /dashboard | 307 redirect | 307 | PASS |
| GET /login | 200 | 200 | PASS |
| GET /register | 200 | 200 | PASS |
| POST /api/admin/auth/login | 401 | 401 | PASS |
| POST /api/admin/auth/logout | 200 | 200 | PASS |
| Production build | Passes | Passes (258.9s) | PASS |
