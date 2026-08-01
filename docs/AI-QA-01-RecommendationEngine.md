# AI Quality Assurance - Recommendation Engine

## Overview

The Recommendation Engine generates actionable improvement suggestions based on validation scores and detected issues. Each recommendation includes a type, severity, impact score, and suggested action.

**File:** `src/core/quality-assurance/recommendation-engine.service.ts`

## Recommendation Types

| Type | Trigger | Impact | Action |
|------|---------|--------|--------|
| `regenerate_image` | image score < 60 | 30 | `regenerate` |
| `regenerate_video` | video score < 60 | 35 | `regenerate` |
| `brand_fix` | brand score < 60 | 25 | `fix_brand` |
| `story_fix` | story score < 60 | 25 | `fix_story` |
| `publishing_fix` | publishing score < 60 | 20 | `fix_publishing` |
| `improve_prompt` | prompt score < 60 | 20 | `optimize_prompt` |
| `manual_review` | per issue (up to 5) | 10 | `review` |

## Severity Levels

| Level | Description |
|-------|-------------|
| `info` | Informational, no immediate action required |
| `warning` | Action recommended to improve quality |
| `critical` | Blocking issue that prevents publishing |

## Impact Scoring

Impact is an integer (0-100) representing the estimated quality improvement if the recommendation is addressed:

- **30-35:** High impact (regeneration recommendations)
- **20-25:** Medium impact (brand/story/publishing fixes)
- **10:** Low impact (manual review suggestions)

## Recommendation Generation Logic

### Score-Based Recommendations

The engine evaluates each score category against a threshold of 60:

```
for each category in [image, video, brand, story, publishing, prompt]:
    if score[category] < 60:
        generate recommendation with type, title, description, severity, impact, action
```

### Issue-Based Recommendations

Detected issues from validators are converted to manual review recommendations:

```
for each issue in issues (max 5):
    generate recommendation:
        type: "manual_review"
        title: issue text
        description: "Detected issue: {issue}"
        severity: "info"
        impact: 10
        action: "review"
```

## Recommendation Structure

```typescript
interface Recommendation {
  type: string;        // e.g., "regenerate_image"
  title: string;       // e.g., "Regenerate Image"
  description: string; // Detailed explanation
  severity: "info" | "warning" | "critical";
  impact: number;      // 0-100 estimated improvement
  action: string;      // e.g., "regenerate"
}
```

## Persistence

All recommendations are persisted to the `quality_recommendation` table:

| Field | Description |
|-------|-------------|
| id | Unique identifier (qrec_*) |
| reportId | Associated quality report |
| userId | Owner of the recommendation |
| type | Recommendation type |
| title | Short title |
| description | Detailed description |
| severity | Severity level |
| status | Current status (default: "open") |
| impact | Impact score |
| action | Suggested action |
| metadata | Additional data as JSON |

## Recommendation Status Management

Recommendations can be updated via the API:

```
PUT /api/quality/{reportId}/recommendations/{recId}
Body: { status: "resolved" | "dismissed" | "open" }
```

## Recommendations Retrieval

```
GET /api/quality/{reportId} -> includes recommendations array in full report
```

Recommendations are returned ordered by impact (descending) for prioritized action.
