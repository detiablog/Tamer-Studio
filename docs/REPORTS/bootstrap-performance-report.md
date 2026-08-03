# Bootstrap Performance Report

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Executive Summary

The application bootstrap process has **3 critical bottlenecks** that significantly impact both development startup and production build times:

1. **EventHub initialization in root layout** — triggers transitive DB connection pool creation
2. **844/868 routes are dynamic (97.2%)** — blanket `force-dynamic` prevents static optimization
3. **100+ service singletons** — many created at module import time with DB dependencies

**Build time: 246.8s (4.1 minutes)**
- Compile: 186s (75.3%)
- Page data collection: ~52s (21.1%)
- Static generation: 7.1s (2.9%)

---

## Critical Bottlenecks

### 1. EventHub → DB Connection Chain

```
layout.tsx → initializeEventHub() → AuditLogSubscriber → audit.service.ts → db → postgres()
```

**Impact**: Every page render triggers a DB connection pool import. During build, this happens 3x (once per worker).

**Fix**: Move `initializeEventHub()` out of layout.tsx to API route initialization.

### 2. 97.2% Dynamic Routes

Only 24 routes are static. The blanket `force-dynamic` on dashboard and admin layouts forces all 844 child pages to be dynamic.

**Impact**: No static page caching, no CDN optimization, full server render for every request.

**Fix**: Remove unnecessary `force-dynamic` flags, remove `cookies()` from pages that only pass token as prop.

### 3. Module-Level Service Singletons

100+ services are created at module import time. Many import `db`, triggering pool creation when their module is first imported.

**Impact**: Cold start latency, memory pressure, unnecessary DB connections.

**Fix**: Use lazy initialization for all services.

---

## Build Stage Breakdown

| Stage | Duration | Bottleneck |
|-------|----------|-----------|
| Compile (Turbopack) | 186s | Large codebase, many imports |
| TypeScript validation | 170ms | Disabled (`ignoreBuildErrors: true`) |
| Page data collection | ~52s | 844 dynamic routes + DB queries |
| Static generation | 7.1s | Only 24 static pages |
| Finalization | ~1.4s | Minimal |

---

## Initialization Count During Build

| Component | Expected | Actual | Issue |
|-----------|----------|--------|-------|
| EventHub | 1 | **3** | Once per worker |
| Redis warnings | 0 | **6** | Missing config |
| DB pool imports | 0 | **3** | Via EventHub |

---

## Route Classification

| Type | Count | % |
|------|-------|---|
| Static (○) | 24 | 2.8% |
| Dynamic (ƒ) | 844 | 97.2% |
| **Total** | **868** | **100%** |

---

## Recommendations

| Priority | Category | Recommendation | Impact |
|----------|----------|---------------|--------|
| P0 | LAZY LOAD | Move EventHub out of layout.tsx | HIGH |
| P0 | LAZY LOAD | Defer DB pool creation | HIGH |
| P1 | REMOVE | Remove `force-dynamic` from 5 client pages | MEDIUM |
| P1 | REMOVE | Remove `cookies()` from 12 admin pages | MEDIUM |
| P1 | REMOVE | Remove client-side EventHubProvider | MEDIUM |
| P2 | SINGLETON | Lazy-init all 100+ service singletons | MEDIUM |
| P2 | LAZY LOAD | Defer Navigation bootstrap | LOW |
| P2 | LAZY LOAD | Defer SEO runtime creation | LOW |
| P3 | IMPROVE | Enable TypeScript validation | LOW |
| P3 | IMPROVE | Add `generateStaticParams` for known routes | LOW |

---

## Success Criteria

| Criterion | Status |
|-----------|--------|
| Every bootstrap entry point identified | PASS |
| Every EventHub initialization explained | PASS |
| Every import side effect documented | PASS |
| Every Redis initialization documented | PASS |
| Every dynamic page classified | PASS |
| Every static page classified | PASS |
| Every singleton verified | PASS |
| Every lazy-load candidate identified | PASS |
| Every build bottleneck measured | PASS |
| No optimization implemented | PASS |
