# BETA-01: Performance

## Scope

Performance characteristics and optimization strategies for the beta program module.

## Architecture

### Database Queries

All list queries use:
- Drizzle ORM for type-safe queries
- Pagination with `limit` and `offset`
- Index-backed filtering on status, category, severity columns
- `count(*)` queries run in parallel with data queries

### Caching

- Dashboard data uses SWR with `revalidateOnFocus: false`
- Deduping interval set to 5000ms to prevent rapid refetching
- Individual tabs fetch data independently for progressive loading

### Parallel Execution

The overview and stats endpoints execute multiple database queries in parallel using `Promise.all()`:

```typescript
const [invitationStats, userStats, feedbackStats, bugStats, featureStats, ratingStats] = await Promise.all([
  invitationService.getStats(),
  betaUserService.getStats(),
  betaFeedbackService.getStats(),
  bugReportService.getStats(),
  featureRequestService.getStats(),
  betaRatingService.getStats(),
]);
```

### Query Optimization

- Filter conditions are built dynamically, only adding WHERE clauses for active filters
- Pagination uses OFFSET/LIMIT with total count queried separately
- Vote counts use SQL increments (`sql\`${table.votes} + 1\``) to avoid read-modify-write

### Readiness Calculation

The readiness score calculation runs 3 parallel queries:

```typescript
const [bugStats, ratingStats, feedbackStats] = await Promise.all([
  bugReportService.getStats(),
  betaRatingService.getStats(),
  betaFeedbackService.getStats(),
]);
```

### Dashboard Performance

- 10 SWR hooks run independently
- Tabs render conditionally (only active tab content in DOM)
- Loading states shown per-section, not per-page

## Configuration

SWR deduping interval can be adjusted in the client component:
```typescript
const { data } = useSWR(url, fetcher, { dedupingInterval: 5000 });
```

## Commands

```bash
# No build commands required
```

## Verification

- Test list endpoints with large datasets (1000+ records)
- Verify pagination performance
- Check dashboard loads within acceptable time
- Monitor database query performance
