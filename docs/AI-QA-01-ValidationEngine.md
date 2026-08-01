# AI Quality Assurance - Validation Engine

## Overview

The Validation Engine consists of specialized validator services that evaluate AI-generated assets against quality criteria. Each validator operates independently, producing a score (0-100), issues list, and recommendations. Validators are invoked by the Quality Orchestrator based on asset type.

## Validator Types

### Image Validator

**File:** `src/core/quality-assurance/image-validator.service.ts`

Evaluates visual quality of generated images.

| Metric | Weight | Threshold | Description |
|--------|--------|-----------|-------------|
| Resolution | 0.20 | 640px min | Width/height adequacy |
| Sharpness | 0.15 | blur < 30 | Blur inverse |
| Noise | 0.10 | noise < 40 | Visual noise level |
| Exposure | 0.10 | 30-95 range | Lighting balance |
| Contrast | 0.10 | contrast > 20 | Dynamic range |
| Composition | 0.10 | composition > 40 | Framing quality |
| Subject Visibility | 0.15 | visibility > 40 | Subject clarity |
| Text Readability | 0.05 | text readability > 0 | Text legibility |

**Resolution Scoring:**
- 2048x2048+: 100
- 1024x1024+: 85
- 640x640+: 65
- Below 640x640: 40

**Watermark Penalty:** Overall score multiplied by 0.98 if watermark is present.

### Video Validator

**File:** `src/core/quality-assurance/video-validator.service.ts`

Evaluates video production quality.

| Metric | Weight | Threshold | Description |
|--------|--------|-----------|-------------|
| Resolution | 0.15 | 480px min | Video dimensions |
| FPS | 0.15 | 24fps min | Frame rate |
| Frame Consistency | 0.15 | > 50 | Temporal stability |
| Scene Continuity | 0.15 | > 50 | Narrative flow |
| Audio Presence | 0.10 | > 50 | Sound track |
| Rendering Errors | 0.10 | 0 | Visual artifacts |
| Transition Quality | 0.05 | > 0 | Scene transitions |
| Ending Quality | 0.05 | > 0 | Conclusion quality |
| Thumbnail | 0.10 | exists | Thumbnail present |

**FPS Scoring:**
- 60fps: 100
- 30fps: 90
- 24fps: 75
- Below 24fps: 40

**Resolution Scoring:**
- 1920px+: 100
- 1280px+: 85
- 720px+: 65
- Below 720px: 40

### Brand Validator

**File:** `src/core/quality-assurance/brand-validator.service.ts`

Validates assets against the user's active brand profile from `creativeBrandProfile`.

| Metric | Weight | Description |
|--------|--------|-------------|
| Logo Present | 0.15 | Logo inclusion check |
| Watermark Present | 0.10 | Watermark inclusion check |
| Color Match | 0.25 | Brand color palette match |
| Typography Match | 0.15 | Font family alignment |
| Tone Match | 0.20 | Content tone consistency |
| CTA Match | 0.15 | Call-to-action alignment |

**Color Matching:** Exact string comparison (case-insensitive) of asset colors against combined primary and secondary brand colors.

**Fallback (No Brand Profile):**
- Logo * 0.4 + Watermark * 0.4 + 60 * 0.2

### Story Validator

**File:** `src/core/quality-assurance/story-validator.service.ts`

Validates narrative content for consistency.

| Metric | Weight | Threshold | Description |
|--------|--------|-----------|-------------|
| Timeline Consistency | 0.15 | > 50 | Chronological order |
| Character Consistency | 0.20 | > 50 | Character attributes |
| Relationship Consistency | 0.10 | > 50 | Character relationships |
| Location Consistency | 0.10 | > 50 | Setting accuracy |
| Object Consistency | 0.05 | > 0 | Prop continuity |
| Dialogue Style | 0.10 | > 0 | Voice consistency |
| Episode Continuity | 0.20 | > 50 | Cross-episode flow |
| Rule Compliance | 0.10 | > 50 | Story rule adherence |

### Publishing Validator

**File:** `src/core/quality-assurance/publishing-validator.service.ts`

Validates publishing readiness for platform distribution.

| Metric | Weight | Description |
|--------|--------|-------------|
| Platform Requirements | 0.15 | Platform-specific rules |
| Aspect Ratio | 0.10 | Platform-optimal ratios |
| Duration | 0.10 | Length requirements |
| Caption Quality | 0.15 | Caption presence and quality |
| Hashtag Quality | 0.10 | Hashtag relevance |
| Thumbnail Quality | 0.15 | Thumbnail presence |
| Title Quality | 0.10 | Title presence |
| Description Quality | 0.10 | Description presence |
| Localization | 0.05 | Multi-language readiness |

## Validation Pipeline

```
1. Load user settings (defaultMinScore, enabledValidators)
2. Select validators based on assetType
3. Run each validator (best-effort, failures do not block pipeline)
4. Collect issues from all validators
5. Pass scores to Scoring Engine
6. Generate recommendations from scores + issues
7. Determine recovery action
8. Persist report, scores, validations, recommendations
9. Log audit entry
```

**Error Handling:** Each validator is wrapped in a try/catch. If a validator fails, it returns a fallback result with default scores (typically 60) rather than blocking the pipeline.

## Validator Configuration

### User Settings (`quality_settings`)

| Field | Default | Description |
|-------|---------|-------------|
| strictMode | false | Enable stricter validation |
| autoRetryEnabled | true | Allow automatic retries |
| autoRetryThreshold | 50 | Score below which retry is attempted |
| maxRetryCount | 3 | Maximum retry attempts |
| defaultMinScore | 70 | Minimum passing score |
| skipValidation | false | Skip all validation |
| enabledValidators | [] | Specific validators to enable |

### Thresholds (`quality_threshold`)

Global thresholds per category defining min/max acceptable scores and weights. Managed via `QualityRuleService.upsertThreshold()`.

### Rules (`quality_rule`)

Per-user custom rules with:
- `minScore`: Minimum passing score
- `autoRetryThreshold`: Score triggering retry
- `maxRetryCount`: Max retries allowed
- `ignoredValidators`: Validators to skip
- `mode`: Validation mode (strict, balanced, relaxed)
