# Startup Analysis

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Development Startup

| Phase | Duration | Notes |
|-------|----------|-------|
| Next.js ready | ~11s | Standard Turbopack startup |
| First page compile | ~27s | Includes EventHub + DB import |
| Subsequent pages | ~1-3s | Cached modules |

### First Request Cold Start

When the first request hits the server:

```
1. Module resolution (~2s)
   └─ config, logger, event-bus, event-hub, seo-runtime

2. Layout evaluation (~5s)
   └─ getSEORuntime() → 10 singletons
   └─ bootstrapNavigation() → 49 items
   └─ initializeEventHub() → 3 subscribers
      └─ AuditLogSubscriber → audit.service.ts → db → postgres() (~3s)

3. Page render (~1s)
   └─ Server component rendering

Total first request: ~8-10s
```

### Subsequent Requests

```
1. Module already cached (~0ms)
2. Layout evaluation (~50ms) — singletons already created
3. Page render (~100-500ms) — depends on data fetching

Total subsequent request: ~200-600ms
```

---

## Production Build Startup

| Phase | Duration | Notes |
|-------|----------|-------|
| Compile | 186s | Turbopack compilation |
| TypeScript validation | 170ms | Skipped (`ignoreBuildErrors: true`) |
| Page data collection | ~52s | 3 workers, 844 dynamic routes |
| Static generation | 7.1s | 24 static pages |
| Finalization | ~1.4s | Route manifest |
| **Total** | **246.8s** | — |

### Worker Behavior

During page data collection, 3 workers run in parallel:
- Each worker initializes EventHub independently
- Each worker triggers DB pool import
- Total: 3 EventHub inits + 3 DB pool imports

---

## Production Runtime Startup

| Phase | Duration | Notes |
|-------|----------|-------|
| Node.js process start | ~200ms | Standard |
| Module loading | ~2-5s | Depends on import tree |
| DB pool creation | ~100-500ms | Depends on DB latency |
| Redis connection | ~50-200ms | Upstash REST |
| Ready to serve | ~3-6s | — |

---

## Memory Footprint

| Category | Estimated | Notes |
|----------|-----------|-------|
| Node.js base | ~30MB | Standard |
| Module cache | ~20-30MB | 100+ modules |
| DB pool (10 connections) | ~5-10MB | postgres-js |
| Redis clients (4) | ~2-5MB | @upstash/redis + redis |
| Singleton objects | ~5-10MB | 38+ singletons |
| Event subscribers | ~1-2MB | 33 subscriptions |
| **Total** | **~65-90MB** | Per process |

---

## CPU Usage

| Phase | CPU | Notes |
|-------|-----|-------|
| Module compilation | High | Turbopack |
| Layout evaluation | Medium | Singleton creation |
| EventHub init | Low | Subscriber registration |
| DB pool creation | Low | Connection handshake |
| Page rendering | Medium | Server component render |

---

## Bottleneck Timeline

```
0s          5s          10s         15s         20s
│           │           │           │           │
├───────────┤           │           │           │
│ Module    │           │           │           │
│ Resolution│           │           │           │
│           ├───────────┤           │           │
│           │ Layout    │           │           │
│           │ Eval      │           │           │
│           │           ├───────────┤           │
│           │           │ EventHub  │           │
│           │           │ + DB Pool │           │
│           │           │           ├───────────┤
│           │           │           │ Page      │
│           │           │           │ Render    │
│           │           │           │           ├────
│           │           │           │           │ Ready
```

---

## Key Findings

1. **First request cold start is ~8-10s** — primarily due to DB pool creation via EventHub chain
2. **Subsequent requests are fast (~200-600ms)** — modules are cached
3. **Build takes 4.1 minutes** — 75% is compilation, 21% is page data collection
4. **97.2% of routes are dynamic** — prevents static optimization
5. **EventHub initializes 3x during build** — once per worker
6. **100+ singletons created at import time** — memory and CPU overhead

---

## Improvement Potential

| Optimization | Estimated Impact |
|-------------|-----------------|
| Remove EventHub from layout | -3-5s cold start |
| Lazy DB pool creation | -1-2s cold start |
| Remove unnecessary force-dynamic | -20s build time |
| Lazy service singletons | -10-20MB memory |
| Static route generation | -50s build time |
| **Combined** | **-5-8s cold start, -70s build, -30MB memory** |
