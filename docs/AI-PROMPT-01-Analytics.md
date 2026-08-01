# AI Prompt Intelligence - Analytics

## Overview

The Analytics subsystem aggregates prompt usage, quality, cost, and provider data across the user's account. It combines data from three sources:

1. `prompt_history` — every executed (resolved) prompt, with provider, model, credits used, and execution time
2. `prompt_library` — use counts, quality scores, and type distribution
3. `prompt_analytics` — arbitrary numeric metrics recorded by the analyzer

All aggregates are computed server-side and exposed through the history stats and library stats endpoints.

---

## Prompt Usage Tracking

### History Recording

Each prompt execution that flows through Prompt Intelligence is recorded with `recordHistory` (`src/core/prompt-intelligence/prompt-history.service.ts`), storing:

- `resolvedPrompt` — the final, enriched, variable-resolved text
- `promptId` / `versionNumber` — traceability back to the library and version
- `provider` / `model` — execution stack
- `creditsUsed` / `executionTimeMs` — cost and latency
- `resultReference` / `projectReference` — external object links
- `status` — `completed` (default), or other execution states
- `createdAt` — execution timestamp

### Use Count

Every time a library prompt is consumed, callers increment the prompt's `useCount`:

```typescript
async incrementUseCount(id: string) {
  return db.update(promptLibrary)
    .set({ useCount: sql`${promptLibrary.useCount} + 1` })
    .where(eq(promptLibrary.id, id))
    .returning();
}
```

### History Stats

`getStats(userId)` aggregates the timestamped history:

```typescript
{
  totalHistory: number;        // count of all history rows
  totalCreditsUsed: number;    // sum(creditsUsed)
  byProvider: ProviderCount[]; // group by provider
}
```

```sql
-- byProvider equivalent
SELECT provider, COUNT(*) FROM prompt_history
WHERE user_id = $1
GROUP BY provider;
```

---

## Quality Score Tracking

### Static Scores

- Every library prompt stores a `qualityScore` (integer 0 - 100), refreshed whenever the analyzer runs against it
- Versions also snapshot `qualityScore` at creation time, allowing score trend analysis across a prompt's history

### Time-Series Metrics

`recordAnalytics` (in `prompt-analyzer.service.ts`) writes into `prompt_analytics`:

| Field | Description |
| --- | --- |
| `metricName` | e.g. `quality_score`, `estimated_tokens`, `credits`, `latency` |
| `value` | Numeric metric value (`real`) |
| `provider` / `model` | Optional execution context |
| `dimensions` | JSONB facet data |
| `promptId` | Optional link to the prompt |

`getPromptStats(userId)` returns:

```typescript
{
  totalAnalytics: number;
  byMetric: {
    metricName: string;
    avgValue: number;   // avg(value)
    count: number;      // count(*)
  }[];
}
```

```sql
-- byMetric equivalent
SELECT metric_name, AVG(value), COUNT(*)
FROM prompt_analytics
WHERE user_id = $1
GROUP BY metric_name;
```

---

## History Analysis

The Analytics tab in the Prompt Studio renders history-derived KPIs:

| Card | Source |
| --- | --- |
| **Total Usage** | `stats.totalUsage` (history item count) |
| **Credits Used** | `stats.creditsUsed` (total credits) |
| **Avg Tokens / Prompt** | `stats.avgTokens` |
| **Success Rate** | `stats.successRate` (percentage of completed) |

### Breakdowns

- **Most Used Types** — `stats.byType` from `prompt_library` grouped by `type`:
  ```sql
  SELECT type, COUNT(*) FROM prompt_library
  WHERE user_id = $1
  GROUP BY type;
  ```
- **History by Provider** — `stats.byProvider` from `prompt_history` grouped by `provider`
- **Recent Activity** — last 10 history items rendered with provider, tokens, credits, and timestamp badges

`getStats(userId)` (library service) also exposes counts for prompts, favorites, collections, variables, history, and versions:

```typescript
{
  totalPrompts: number;
  favoritePrompts: number;
  totalCollections: number;
  totalVariables: number;
  totalHistory: number;
  totalVersions: number;
  typeCounts: { type: string; count: number }[];
}
```

---

## Provider Usage

Provider-level reporting flows from two aggregations:

1. **History by Provider** — count of executions per provider (`prompt_history.byProvider`)
2. **Analytics by provider/model** — metric rows in `prompt_analytics` tagged with `provider` and `model`, analyzed via `getPromptStats`

This enables per-provider cost and quality comparisons (e.g., average credits or quality score delivered by `openai` vs `anthropic`).

---

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/prompts/history/stats` | History totals, credits, by-provider breakdowns |
| `GET /api/prompts/stats` | Library totals and type distribution |
| `GET /api/prompts/history` | Paginated history feed |
| `POST /api/prompts/history` | Record a history entry |
| `GET /api/prompts/settings` | (analytics tab also consumes this endpoint) |

---

## Example

Given:

- 3 executions: `openai` (1 credit), `openai` (2 credits), `anthropic` (1 credit)

History stats produce:

```json
{
  "success": true,
  "data": {
    "totalHistory": 3,
    "totalCreditsUsed": 4,
    "byProvider": [
      { "provider": "openai", "count": 2 },
      { "provider": "anthropic", "count": 1 }
    ]
  }
}
```

Library stats produce the dashboard counts plus:

```json
{
  "typeCounts": [
    { "type": "image", "count": 4 },
    { "type": "marketing", "count": 2 },
    { "type": "custom", "count": 1 }
  ]
}
```
