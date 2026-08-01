# AI Quality Assurance - Auto Recovery

## Overview

The Auto Recovery service determines the appropriate action when an asset fails quality validation. It evaluates the overall score against thresholds and retry history to decide whether to approve, regenerate, escalate, or stop.

**File:** `src/core/quality-assurance/auto-recovery.service.ts`

## Recovery Decisions

### Approve

**Condition:** `overallScore >= minScore`

The asset meets the minimum quality threshold and is approved for use.

```
{ action: "approve", reason: "Score {overallScore} meets minimum {minScore}" }
```

### Regenerate

**Condition:** `overallScore < minScore AND currentRetryCount < maxRetryCount`

The asset does not meet quality standards but retries are available. The system requests regeneration with potentially improved parameters.

```
{ action: "regenerate", reason: "Score {overallScore} below minimum but above retry threshold", retryCount: currentRetryCount + 1 }
```

or

```
{ action: "regenerate", reason: "Score {overallScore} in retry range", retryCount: currentRetryCount + 1 }
```

### Manual Review

**Condition:** `currentRetryCount >= maxRetryCount`

Maximum retry attempts have been exhausted. The asset requires human review.

```
{ action: "manual_review", reason: "Max retries ({maxRetryCount}) reached", retryCount: currentRetryCount }
```

### Stop

**Condition:** Fallback case

Unable to recover automatically. The asset is flagged for complete rejection.

```
{ action: "stop", reason: "Unable to recover automatically" }
```

## Decision Matrix

| Score vs MinScore | Score vs RetryThreshold | Retries Left | Action |
|-------------------|------------------------|--------------|--------|
| >= minScore | N/A | Any | approve |
| < minScore | >= retryThreshold | > 0 | regenerate |
| < minScore | < retryThreshold | > 0 | regenerate |
| < minScore | Any | 0 | manual_review |
| < minScore | Any | 0 | stop |

## Retry Logic

### Retry Flow

```
1. Asset fails validation (overallScore < minScore)
2. AutoRecoveryService.decide() returns "regenerate"
3. Report status updated to "regenerate"
4. Retry history recorded via recordRetry()
5. External system regenerates asset
6. New asset re-enters validation pipeline
7. Repeat until pass or max retries reached
```

### Retry Parameters

| Parameter | Source | Default |
|-----------|--------|---------|
| minScore | User settings or request | 70 |
| autoRetryThreshold | User settings | 50 |
| maxRetryCount | User settings | 3 |
| currentRetryCount | Retry history count | 0 |

## Retry History Tracking

Each retry attempt is recorded in the `quality_retry_history` table:

| Field | Description |
|-------|-------------|
| id | Unique identifier (qauto_*) |
| reportId | Associated quality report |
| userId | Owner of the retry |
| assetId | Asset being retried |
| retryCount | Attempt number |
| reason | Why the retry was initiated |
| status | Current retry status |
| provider | AI provider used for regeneration |
| model | AI model used for regeneration |
| scoreBefore | Score before retry |
| scoreAfter | Score after retry (0 if pending) |
| metadata | Additional data as JSON |

## Retry History Retrieval

```
GET /api/quality/{reportId} -> includes retries array in full report
```

Retry history is returned in reverse chronological order (most recent first).

## Integration with Orchestrator

The orchestrator calls Auto Recovery after scoring:

```typescript
const recovery = autoRecoveryService.decide(
  overallScore,
  minScore,
  settings.autoRetryThreshold ?? 50,
  settings.maxRetryCount ?? 3,
  0  // currentRetryCount from history
);

await db.update(qualityReport)
  .set({ status: recovery.action === "approve" ? "passed" : recovery.action })
  .where(eq(qualityReport.id, report.id));
```
