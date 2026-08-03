# Build Performance Audit

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01
**Build Time:** 246.8s (4.1 minutes)

---

## Build Stage Timing

| Stage | Duration | % of Total |
|-------|----------|-----------|
| Compile (Turbopack) | 3.1 min (186s) | 75.3% |
| TypeScript validation | 170ms | 0.1% |
| Collecting page data | ~52s | 21.1% |
| Static page generation | 7.1s | 2.9% |
| Finalization | ~1.4s | 0.6% |
| **Total** | **246.8s** | **100%** |

---

## Route Classification

| Type | Count | Percentage |
|------|-------|-----------|
| Static (○) | 24 | 2.8% |
| Dynamic (ƒ) | 844 | 97.2% |
| Lambda (λ) | 0 | 0% |
| **Total** | **868** | **100%** |

---

## Build Issues

### 1. EventHub Initializes 3 Times

```
Initializing EventHub... (worker 1)
Initializing EventHub... (worker 2)
Initializing EventHub... (worker 3)
```

**Impact**: Each initialization creates 3 subscribers + triggers DB import.

### 2. Redis Warnings (6 occurrences)

```
[Upstash Redis] The 'url' property is missing or undefined in your Redis config.
[Upstash Redis] The 'token' property is missing or undefined in your Redis config.
```

**Impact**: Redis client created with empty config; warnings pollute build output.

### 3. DB Session Error During Build

```
getServerSession error: Dynamic server usage: Route /dashboard couldn't be
rendered statically because it used `cookies`.
```

**Impact**: Build worker fails to statically generate `/dashboard` (expected — it's dynamic).

### 4. 97.2% Dynamic Routes

Only 24 out of 868 routes are static. The blanket `force-dynamic` on dashboard and admin layouts forces all child pages to be dynamic.

---

## Build Bottleneck Analysis

| Bottleneck | Impact | Fix Difficulty |
|------------|--------|---------------|
| 844 dynamic routes | HIGH — prevents static optimization | Medium |
| EventHub 3x initialization | MEDIUM — redundant work per worker | Easy |
| DB connection at build time | MEDIUM — unnecessary during build | Easy |
| 100+ service singletons | LOW — only imported when needed | Medium |
| TypeScript validation disabled | LOW — hides type errors | Easy to enable |

---

## Static Route Distribution

| Category | Routes | Could Be More? |
|----------|--------|---------------|
| Marketing | 12 | Yes — blog, features, etc. |
| Auth | 6 | No — already static |
| SEO | 3 | No — already static |
| Utility | 3 | No — already static |
| **Total** | **24** | — |

---

## Recommendations (No Implementation)

1. **IMPROVE**: Move `initializeEventHub()` out of layout.tsx
2. **IMPROVE**: Remove `force-dynamic` from pure client components (5 pages)
3. **IMPROVE**: Remove `cookies()` from admin pages that only pass token as prop
4. **LAZY LOAD**: Defer EventHub, Navigation, SEO runtime initialization
5. **SINGLETON**: Ensure DB pool is created once, not per worker
6. **REMOVE**: Client-side EventHubProvider initialization
