# R13: Event System Remediation Report — CMS-01.5 Production Readiness Remediation

**Status:** PARTIAL
**Date:** 2026-07-28

---

## Summary of Findings

The event bus is fully implemented with 46 domain events and 16 application events. The notification platform subscribes to 35+ events but only logs them. Event publishers are injected as optional everywhere, meaning events are silently dropped when not provided. The event bus is not wired to any runtime for cross-runtime synchronization.

---

## Changes Made

No direct changes in this remediation cycle — this report documents findings for future work.

---

## Current Architecture

| Component | Status | Notes |
|---|---|---|
| Event Bus | IMPLEMENTED | In-memory, 46 domain + 16 application events |
| Notification Platform | SUBSCRIBES | 35+ events, but only logs — no user notifications |
| Event Publisher Injection | OPTIONAL | Events silently dropped when publisher not provided |
| Cross-runtime sync | NOT IMPLEMENTED | Runtimes don't communicate via events |
| Persistence | NONE | Events lost on restart |

---

## Event Coverage

| Category | Events | Subscribers | Actions |
|---|---|---|---|
| Domain events | 46 | Notification platform | Logging only |
| Application events | 16 | None | — |
| Cross-runtime events | 0 | — | — |

---

## Remaining Issues

| Issue | Severity | Impact |
|---|---|---|
| Event bus not wired to runtimes | High | No automatic cache invalidation or data sync |
| Events silently dropped | High | Critical events may be lost without indication |
| Notification platform only logs | Medium | Users don't receive actual notifications |
| No event persistence | Medium | Events lost on application restart |
| No dead letter queue | Medium | Failed event processing has no retry mechanism |
| No event ordering guarantees | Low | Race conditions possible in concurrent processing |

---

## Recommendations

1. **Priority 1 — Wire event bus to runtimes**: Subscribe CMS, Homepage, and SEO runtimes to relevant events for automatic cache invalidation.
2. **Priority 1 — Make event publisher required**: Remove optional injection — ensure all modules that produce events have a publisher.
3. **Priority 2 — Notification platform**: Implement actual notification delivery (email, in-app, push) instead of just logging.
4. **Priority 2 — Event persistence**: Add database or Redis persistence for events to survive restarts.
5. **Priority 3 — Dead letter queue**: Implement retry logic and dead letter queue for failed event processing.
6. **Priority 3 — Event sourcing**: Consider event sourcing for critical domain events (billing, auth) for audit trails.
