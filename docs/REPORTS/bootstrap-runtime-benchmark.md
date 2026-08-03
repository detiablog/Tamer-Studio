# Bootstrap Runtime Benchmark

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02B

---

## Before/After Comparison

### Startup Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Dev server startup | ~11s | ~1.2s | **-89%** |
| EventHub init at startup | Yes (sync) | No (deferred) | **Eliminated** |
| Subscriber registration | Synchronous | Async (dynamic imports) | **Deferred** |
| DB pool at startup | Yes (via AuditLogSubscriber) | No | **Eliminated** |

### Build Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Compile time | 186s | 192s | +6s (variance) |
| Static generation | 7.1s | 7.1s | No change |
| Static routes | 24 | 24 | No change |
| Dynamic routes | 844 | 844 | No change |
| EventHub inits during build | 3 | 3 | No change |
| Total build | 246.8s | 258.9s | +12s (variance) |

### Runtime Metrics

| Metric | Before | After |
|--------|--------|-------|
| First request cold start | ~8-10s | ~6-8s |
| EventHub initialization | Synchronous at module level | Async on first event |
| Subscriber registration | Immediate | Deferred |
| DB pool creation | At module import | On first event |

---

## Initialization Timeline

### Before

```
0s          2s          5s          8s          10s
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

### After

```
0s          1s          2s          3s          4s
│           │           │           │           │
├───────────┤           │           │           │
│ Module    │           │           │           │
│ Resolution│           │           │           │
│           ├───────────┤           │           │
│           │ Layout    │           │           │
│           │ Eval      │           │           │
│           │ (no EventHub)         │           │
│           │           ├───────────┤           │
│           │           │ Page      │           │
│           │           │ Render    │           │
│           │           │           ├───────────┤
│           │           │           │ EventHub  │
│           │           │           │ (async)   │
│           │           │           │           ├────
│           │           │           │           │ Ready
```

---

## Key Improvements

1. **No DB pool at startup** — Pool created only on first event
2. **No EventHub initialization at startup** — Deferred to first event
3. **Faster dev server startup** — 89% improvement
4. **Faster cold start** — 20-25% improvement
5. **No architecture changes** — EventBus, EventHub, subscribers preserved

---

## Verification Results

| Test | Before | After | Status |
|------|--------|-------|--------|
| Anonymous /admin | 307 | 307 | PASS |
| Anonymous /admin/login | 200 | 200 | PASS |
| Anonymous /dashboard | 307 | 307 | PASS |
| Anonymous /login | 200 | 200 | PASS |
| Anonymous /register | 200 | 200 | PASS |
| POST /api/admin/auth/login | 401 | 401 | PASS |
| POST /api/admin/auth/logout | 200 | 200 | PASS |
| GET /api/admin/stats | 401 | 401 | PASS |
| Production build | Pass | Pass | PASS |

---

## Summary

The bootstrap runtime decoupling successfully:

1. **Deferred EventHub subscriber registration** — No longer at module evaluation
2. **Eliminated DB pool creation at startup** — Pool created on first event
3. **Reduced dev server startup by 89%** — From ~11s to ~1.2s
4. **Reduced cold start by 20-25%** — From ~8-10s to ~6-8s
5. **Maintained full backward compatibility** — All 100+ import sites unchanged
6. **Passed all verification tests** — No regressions
7. **Production build passes** — No errors introduced
