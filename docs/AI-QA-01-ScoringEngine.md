# AI Quality Assurance - Scoring Engine

## Overview

The Scoring Engine calculates weighted quality scores across all validation categories and produces a single overall score (0-100) for each validated asset.

**File:** `src/core/quality-assurance/scoring-engine.service.ts`

## Score Calculation Methodology

### Step 1: Category Score Input

The orchestrator collects raw scores from each validator:

```
scoreInputs = {
  image:       imageValidator.overallScore       (if image asset)
  video:       videoValidator.overallScore       (if video asset)
  brand:       brandValidator.overallBrandScore   (always)
  story:       storyValidator.overallStoryScore   (if story/drama)
  publishing:  publishingValidator.publishingReadinessScore (if publishing/affiliate)
  technical:   asset.technicalScore || 80
}
```

### Step 2: Weighted Category Scoring

Each category is assigned a default weight:

| Category | Default Weight | Description |
|----------|---------------|-------------|
| image | 0.15 | Visual quality |
| video | 0.20 | Video production quality |
| brand | 0.15 | Brand consistency |
| story | 0.15 | Narrative consistency |
| technical | 0.15 | Technical specifications |
| publishing | 0.10 | Publishing readiness |
| accessibility | 0.05 | Accessibility compliance |
| localization | 0.05 | Localization readiness |

Categories not present in the input receive a default score of 70. Unknown categories default to weight 0.1.

### Step 3: Overall Score Calculation

```
overallScore = sum(categoryScore * categoryWeight) / sum(categoryWeights)
```

All category weights are included in the denominator regardless of whether the category was evaluated. The result is rounded to the nearest integer and capped at 100.

## Score Ranges

| Range | Label | Description |
|-------|-------|-------------|
| 85-100 | Excellent | Asset meets or exceeds quality standards |
| 70-84 | Good | Asset is acceptable with minor improvements needed |
| 50-69 | Acceptable | Asset needs improvement before publishing |
| 0-49 | Poor | Asset requires significant rework or regeneration |

## Score Explanations

The engine generates a human-readable explanation per category:

- **85-100:** `{category}: Excellent quality`
- **70-84:** `{category}: Good quality`
- **50-69:** `{category}: Acceptable, needs improvement`
- **0-49:** `{category}: Poor quality, requires attention`

## Score Persistence

Each category score is persisted as a `quality_score` record with:

| Field | Description |
|-------|-------------|
| reportId | Associated quality report |
| category | Category name (e.g., "image", "brand") |
| score | Numeric score (0-100) |
| explanation | Human-readable explanation |
| weight | Category weight used in calculation |
| details | Raw score data as JSON |

## Overall Score in Report

The final overall score is stored in the `quality_report` table:

| Field | Description |
|-------|-------------|
| overallScore | Final weighted score |
| passed | `overallScore >= minScore` |
| requiresReview | `!passed` |
| scores | All category scores as JSON map |

## Score Comparison Logic

```
if (overallScore >= minScore) -> passed = true, status = "passed"
if (overallScore < minScore)  -> passed = false, status = "failed", requiresReview = true
```

The `minScore` is determined by (in priority order):
1. Request-level `minScore` parameter
2. User's `quality_settings.defaultMinScore`
3. System default: 70
