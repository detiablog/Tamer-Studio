# CORE-PERFORMANCE-01 — Testing Checklist

## Cache System
- [ ] Cache set/get works
- [ ] Cache TTL expires correctly
- [ ] Cache invalidation works
- [ ] Cache stats display
- [ ] Clear cache works

## SWR Optimization
- [ ] No duplicate API calls on re-render
- [ ] 5s deduping interval works
- [ ] Navigation doesn't cause duplicate fetches

## N+1 Query Fixes
- [ ] Monitoring health check parallelized
- [ ] Monitoring overview parallelized
- [ ] Analytics queries cached

## Bundle Optimization
- [ ] optimizePackageImports active
- [ ] Server packages externalized
- [ ] Image optimization (AVIF/WebP)

## Performance Dashboard
- [ ] Overview tab loads
- [ ] Metrics tab shows data
- [ ] Reports tab functional
- [ ] Cache tab shows stats
- [ ] Recommendations display

## Build
- [ ] TypeScript passes
- [ ] Build succeeds (faster than before)
- [ ] No runtime errors
- [ ] No regressions
