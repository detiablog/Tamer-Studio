# R4: Runtime Integration Remediation Report — CMS-01.5 Production Readiness Remediation

**Status:** PARTIAL
**Date:** 2026-07-28

---

## Summary of Findings

Three runtimes (CMS, SEO, Homepage) have been partially wired together, but the event bus remains disconnected from all runtimes. Cross-runtime cache invalidation is not implemented, meaning updates in one runtime do not propagate to others without manual intervention.

---

## Changes Made

### 1. Runtime Wiring
| Integration | Status | Details |
|---|---|---|
| CMS → Homepage Runtime | WIRED | CMS content changes propagate to Homepage cache |
| CMS → SEO Runtime | WIRED | CMS content changes update SEO metadata |
| Homepage → Navigation Runtime | WIRED | Homepage updates refresh navigation data |

### 2. Isolated Caches
Each runtime maintains its own in-memory cache. No shared cache invalidation layer exists.

---

## Remaining Issues

| Issue | Severity | Impact |
|---|---|---|
| Event Bus NOT WIRED to any runtime | High | Runtimes cannot react to domain events |
| Cross-runtime cache invalidation NOT IMPLEMENTED | High | Stale data across runtimes after mutations |
| In-memory caches have no TTL or max-size policy | Medium | Memory growth over time |
| No cache warming strategy on cold start | Medium | First requests after deploy hit DB |

---

## Recommendations

1. **Wire event bus to runtimes**: Subscribe CMS runtime to domain events (e.g., `content.updated`, `page.published`) and use them to invalidate Homepage and SEO caches.
2. **Implement cache invalidation**: Create a shared `CacheInvalidationService` that broadcasts invalidation events across all runtimes.
3. **Add TTL and max-size**: Configure cache eviction policies to prevent unbounded memory growth.
4. **Cache warming**: On application start, pre-warm critical caches (navigation, homepage content) from DB.
5. **Consider Redis**: If the application scales beyond a single instance, migrate from in-memory to Redis for shared cache state.
