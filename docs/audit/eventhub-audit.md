# EventHub Audit

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Initialization Count

| Metric | Value |
|--------|-------|
| Expected initialization count | 1 (singleton) |
| Actual initialization count during build | **3** (once per worker) |
| Actual initialization count per request | 1 (guarded by `initialized` flag) |

---

## Initialization Points

| # | File | Line | Context | Runs When |
|---|------|------|---------|-----------|
| 1 | `src/app/layout.tsx` | 23 | Module-level call | Every layout evaluation (3x during build) |
| 2 | `src/components/providers/EventHubProvider.tsx` | 8 | Client-side useEffect | Browser hydration |
| 3 | `src/core/installation/installation.service.ts` | 218 | Dynamic import | Installation wizard only |

---

## Singleton Pattern

- **Module-level `initialized` boolean guard** (not a class singleton)
- **Idempotent**: Second call logs warning and returns early
- **HMR risk**: In development, module re-evaluation may reset the `initialized` flag

---

## Subscribers Registered

| # | Subscriber | Events | Impact |
|---|-----------|--------|--------|
| 1 | EventLog (global) | ALL events | Low (in-memory) |
| 2 | CacheInvalidationSubscriber | 11 CMS/homepage events | Medium (cache ops) |
| 3 | AuditLogSubscriber | ALL events | **HIGH** (DB writes) |
| 4 | NotificationSubscriber | 20+ domain events | Low (logging only) |

**Total subscriptions: 33** (2 global `subscribeAll` + 31 individual `subscribe`)

---

## Issue: Client-Side Initialization

`EventHubProvider.tsx` is a `"use client"` component that calls `bootstrapEventRuntime()` in a `useEffect`. This initializes the full event system **in the browser bundle**, creating:
- A separate EventBus instance (client-side)
- A separate EventLog instance
- 3 separate subscriber instances

These client-side subscribers **never receive server-emitted events**, wasting memory and CPU.

---

## Build Impact

During `next build` with 3 workers:
- EventHub initializes 3 times (once per worker)
- Each initialization creates 3 subscribers
- AuditLogSubscriber triggers DB import (pool creation)
- Total: 9 subscriber instances + 3 DB pool imports

---

## Recommendation

1. Remove `initializeEventHub()` from `layout.tsx` — move to API route initialization
2. Remove `EventHubProvider.tsx` client-side initialization — unnecessary
3. Make `AuditLogSubscriber` lazy-loaded (only when first event is published)
