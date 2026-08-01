# AI Prompt Intelligence - Performance

## Overview

The Prompt Intelligence system is optimized at three levels: database indexing, pagination discipline, and parallel query execution. Analyzer/Optimizer/Validator are pure, dependency-free text routines that complete in O(n) time and impose no database load.

---

## Prompt Search Optimization

### Indexed Filters

Prompt listing (`listPrompts`) builds the WHERE clause from user-scoped conditions:

- `eq(userId)` — always present
- Optional equality filters: `type`, `category`, `collectionId`, `isFavorite`, `isPinned`, `isArchived`
- Optional `search`: `LIKE '%term%'` against `name` OR `content`

Supporting indexes:

| Index | Columns |
| --- | --- |
| `prompt_library_user_idx` | `user_id` |
| `prompt_library_type_idx` | `type` |
| `prompt_library_category_idx` | `category` |
| `prompt_library_favorite_idx` | `user_id`, `is_favorite` |

### Bound Pagination

```typescript
const page = filters?.page || 1;
const limit = Math.min(filters?.limit || 20, 100);
const offset = (page - 1) * limit;
const [data, total] = await Promise.all([
  db.select().from(promptLibrary).where(where)
    .orderBy(desc(promptLibrary.isPinned), desc(promptLibrary.updatedAt))
    .limit(limit).offset(offset),
  db.select({ count: sql`count(*)` }).from(promptLibrary).where(where),
]);
```

- Lists are capped (prompts 100, variables/templates/history 200, tests 100)
- `LIMIT`/`OFFSET` keep result sets bounded
- The data query and count query run concurrently via `Promise.all`

### Search Caveat

The leading-wildcard `%term%` search on `name`/`content` cannot use btree indexes and performs a sequential scan. For large prompt libraries this is the main remaining hot spot.

**Recommendation**: add a Postgres `pg_trgm` GIN index on `name` (and optionally on `content`) to accelerate `LIKE` searches, or introduce full-text search. See Database.md for the related index table.

---

## Variable Resolution Caching

### Current Behavior

`resolveVariableValues(userId, keys)` executes one parameterized `IN (...)` query per call:

```typescript
db.select()
  .from(promptVariables)
  .where(and(
    eq(promptVariables.userId, userId),
    sql`${promptVariables.key} IN (${keys...})`
  ));
```

- Backed by `prompt_var_user_idx (user_id)` and `prompt_var_user_key_unique (user_id, key)`
- Always re-fetches from the database; there is no in-memory or Redis cache

### Optimization Opportunities

1. **Per-request memoization** — cache resolved variable maps on the request context so repeated enrichment calls in the same request do not hit the DB
2. **Short-TTL cache** — an LRU keyed by `userId` with a short (30-60s) TTL is safe for variable values and would eliminate most redundant lookups
3. **Single round-trip** — `enrichPrompt` already does exactly one extraction + one `IN` query; batch rendering in a single call keeps the cost at one query regardless of placeholder count

---

## Version Comparison

### Storage Pattern

- Versions stores full content snapshots (`content` text). `prompt_versions` is indexed by `prompt_id` (`prompt_ver_prompt_idx`) and `user_id` (`prompt_ver_user_idx`)
- `listVersions(promptId)` orders by `versionNumber` descending; the `promptId` index makes this a narrow index range scan

### Comparison Cost

- There is no server-side diff endpoint; comparison happens client-side between two fetched snapshots
- Fetching one version via `getVersion(id)` is a single-row PK lookup

### Recommendation

For long-lived prompts, a text-diff (`simple-diff` style LCS or `diff` library) evaluated server-side and cached against a `(promptId, vA, vB)` key would avoid resending full snapshot bodies to the client. This also enables future "changes in v3 vs v2" UI without transferring whole documents.

---

## History Query Optimization

### Aggregation

`getStats(userId)` for history runs three queries:

```typescript
count(*)                                   // totalHistory
coalesce(sum(credits_used), 0)             // totalCreditsUsed
select provider, count(*) group by provider // byProvider
```

All are filtered by `eq(userId)` and served by `prompt_hist_user_idx` and `prompt_hist_created_idx`.

### Feed Queries

`listHistory(userId, filters)`:

- Data + count run in parallel
- Ordered by `created_at` descending with `LIMIT/OFFSET`
- `prompt_hist_created_idx (created_at)` supports the ordering
- Optional filters `promptId` and `status` narrow the scan further via `prompt_hist_prompt_idx`

### Appendix-Only Growth

`prompt_history` and `prompt_analytics` are append-mostly and never updated in place (except status fields via the testing flow). Their `user_id` + `created_at` indexes cover the analytics aggregation queries.

### Recommendation

- Monthly rollups: pre-aggregate credits and provider counts into daily/monthly summary tables for dashboard KPIs so the `count(*)` / `sum` scans stay constant
- Optional composite index `(user_id, created_at)` if time-windowed history filters are added later

---

## Analyzer / Optimizer / Validator Performance

These services are purely CPU-side and deterministic:

- `analyze(prompt)` — a fixed set of regex checks, O(n) in prompt length
- `optimize(prompt)` — string transforms plus two `analyze` calls (before/after)
- `validate(prompt)` — regex checks plus one `analyze` call

They incur no database I/O and are trivially cheap to call on every save or submit. The only database interaction in the analyzer service is the opt-in `recordAnalytics` call.

---

## Context Builder Performance

`enrichPrompt` performs at most:

1. `renderVariables` (in-memory, twice worst case)
2. `extractVariables` (in-memory)
3. `resolveVariableValues` (one `IN` query)
4. `buildPromptContext(userId, moduleType)` (Creative Memory queries, executed concurrently inside that service)

The prompt context call is the heaviest dependency and is intentionally minimal in `buildPromptContext` (brand profile + preferences + 10 recent memories). Should it become a bottleneck, it is a candidate for the same short-TTL cache keyed by `(userId, moduleType)`.

---

## Summary of Hot Paths and Remedies

| Hot Path | Current Mitigation | Next Step |
| --- | --- | --- |
| Prompt `LIKE` search | Pagination caps | `pg_trgm` GIN index or full-text search |
| Variable resolution | Single `IN` query, unique index | Request memoization / short-TTL LRU cache |
| Version listing | `prompt_id` index, PK fetch | Server-side diff caching |
| History aggregation | `user_id`/`created_at` indexes | Daily/monthly rollup tables |
| Context builder | Minimal memory query set | TTL cache on `(userId, moduleType)` |
