# Usage Runtime Report — B11 Sprint (Phase 9)

**Sprint:** AI Runtime (B11)  
**Phase:** 9 — Usage Runtime  
**Status:** COMPLETED  
**Date:** 2026-07-28

---

## Objective

Create the Usage Runtime for tracking credits, tokens, cost, duration, provider usage, model usage, and workspace usage.

---

## Implementation

### File: `src/core/ai/usage/usage-runtime.ts`

#### DefaultUsageRuntime Class

- [x] `record(telemetry)` — Records usage from TelemetryRecord
- [x] `getSummary(filters?)` — Comprehensive usage summary
- [x] `getRecords(filters?)` — Filtered usage records
- [x] `getProviderSummary(providerId)` — Per-provider breakdown
- [x] `getModelSummary(model)` — Per-model breakdown
- [x] `getDailySummary(days?)` — Daily usage trends
- [x] `getCostEstimate(providerId, model, tokens)` — Cost projection

#### Usage Tracking

| Metric | Tracked |
|--------|---------|
| Request Count | YES |
| Prompt Tokens | YES |
| Completion Tokens | YES |
| Total Tokens | YES |
| Estimated Cost | YES |
| Duration | YES |
| Success Rate | YES |
| Provider Breakdown | YES |
| Model Breakdown | YES |
| Daily Breakdown | YES |

#### Filters

| Filter | Purpose |
|--------|---------|
| `userId` | Per-user tracking |
| `workspaceId` | Per-workspace tracking |
| `projectId` | Per-project tracking |
| `providerId` | Per-provider tracking |
| `model` | Per-model tracking |
| `capability` | Per-capability tracking |
| `startDate/endDate` | Time range |
| `status` | Success/failure |

#### Usage Summary

```typescript
UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  currency: string;
  promptTokens: number;
  completionTokens: number;
  averageDurationMs: number;
  successRate: number;
  providerBreakdown: Record<string, ProviderUsageSummary>;
  modelBreakdown: Record<string, ModelUsageSummary>;
  dailyBreakdown: Record<string, DailyUsageSummary>;
}
```

---

## Verification

- [x] Token tracking (prompt, completion, total)
- [x] Cost tracking per provider/model
- [x] Duration tracking
- [x] Provider usage breakdown
- [x] Model usage breakdown
- [x] Daily usage trends
- [x] Workspace isolation support
- [x] Cost estimation for projections

---

## Compliance

| Rule | Status |
|------|--------|
| AI Runtime never owns credits | COMPLIANT |
| Credit Runtime owns credits | COMPLIANT (delegated to billing) |
| Usage reported back after execution | COMPLIANT |
