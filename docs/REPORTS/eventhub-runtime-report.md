# EventHub Runtime Report

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02B

---

## Architecture

```
EventBus (singleton)
  ├─ listeners: Map<EventType, Set<EventHandler>>
  ├─ allListeners: Set<EventHandler>
  ├─ subscribe(type, handler)
  ├─ subscribeAll(handler)
  ├─ emit(event)
  └─ publish(type, payload, source)

EventHub (singleton)
  ├─ initialized: boolean
  ├─ subscribersRegistered: boolean
  ├─ eventLog: EventLog
  ├─ initializeEventHub()
  │   ├─ setupEventLogging() ← synchronous, lightweight
  │   └─ registerSubscribers() ← async, dynamic imports
  │       ├─ CacheInvalidationSubscriber
  │       ├─ AuditLogSubscriber ← triggers DB import
  │       └─ NotificationSubscriber
  └─ shutdownEventHub()
```

---

## Initialization Flow

### Before

```
Module evaluation → initializeEventHub() → sync subscriber registration
  └─ All 3 subscribers loaded immediately
  └─ DB import chain triggered at module level
```

### After

```
Module evaluation → initializeEventHub() → async subscriber registration
  └─ EventLog created (sync, lightweight)
  └─ registerSubscribers() starts async imports
  └─ Module evaluation continues
  └─ First event triggers subscriber registration
  └─ Dynamic imports complete
  └─ Subscribers registered
```

---

## Build Behavior

During `next build` with 3 workers:
- Each worker evaluates `layout.tsx`
- `initializeEventHub()` is called 3 times
- `registerSubscribers()` runs 3 times (async)
- Each worker registers its own subscribers
- Total: 3 subscriber sets (one per worker)

**Note**: This is expected behavior for Next.js build workers. Each worker is an independent process.

---

## Runtime Behavior

### Development

1. Dev server starts (1261ms)
2. First request triggers layout evaluation
3. `initializeEventHub()` called
4. `setupEventLogging()` runs synchronously
5. `registerSubscribers()` starts async imports
6. Page renders
7. Async imports complete (~100ms)
8. Subscribers registered

### Production

1. Server starts
2. Module evaluation calls `initializeEventHub()`
3. `setupEventLogging()` runs synchronously
4. `registerSubscribers()` starts async imports
5. First request arrives
6. Async imports complete
7. Subscribers registered

---

## Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Module evaluation | Subscribers loaded | Subscribers deferred |
| First event | Immediate processing | ~100ms delay (import time) |
| Subsequent events | Immediate processing | Immediate processing |
| DB pool creation | At module level | On first event |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Events lost before subscribers registered | Low | Low | EventLog captures all events |
| Async import failure | Very Low | Medium | Try/catch in dynamic imports |
| Memory leak | None | N/A | Subscribers properly managed |

---

## Recommendation

The deferred subscriber registration successfully decouples EventHub initialization from application startup while preserving the existing architecture.

**Next steps** (future sprints):
1. Remove `initializeEventHub()` from `layout.tsx` entirely
2. Initialize EventHub lazily on first API request
3. Remove client-side `EventHubProvider` initialization
