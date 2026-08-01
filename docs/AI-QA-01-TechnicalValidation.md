# AI Quality Assurance - Technical Validation

## Overview

Technical Validation covers resolution, compression, metadata, and file integrity checks across image and video assets. These validations are embedded within the Image Validator and Video Validator services.

## Image Technical Validation

**File:** `src/core/quality-assurance/image-validator.service.ts`

### Resolution

| Dimension | Score |
|-----------|-------|
| Width >= 2048 AND Height >= 2048 | 100 |
| Width >= 1024 AND Height >= 1024 | 85 |
| Width >= 640 AND Height >= 640 | 65 |
| Below 640x640 | 40 |

**Minimum threshold:** 640x640. Assets below this trigger an issue.

### Sharpness / Blur

- Derived from the `blur` asset property
- `sharpness = 100 - blur`
- **Threshold:** blur > 30 triggers "Image appears blurry" issue

### Noise

- Read from the `noise` asset property
- **Threshold:** noise > 40 triggers "High noise detected" issue
- Score contribution: `100 - min(noise, 100)`

### Compression Artifacts

- Derived from the `compression` asset property
- `artifacts = 100 - min(compression > 80 ? 80 : compression)`
- Higher compression values indicate more artifacts

### Lighting

- Read from the `lighting` asset property (default: 60)
- **Thresholds:**
  - lighting < 30: "Poor lighting detected"
  - lighting > 95: "Overexposed lighting"

### Exposure

- Read from the `exposure` asset property (default: 60)
- Used in overall score calculation

### Contrast

- Read from the `contrast` asset property (default: 50)
- **Threshold:** contrast < 20 triggers "Very low contrast" issue

### Cropping

- Read from the `cropping` asset property (default: 80)
- **Threshold:** cropping < 40 triggers "Unusual cropping detected" issue

### Composition

- Read from the `composition` asset property (default: 70)
- **Threshold:** composition < 40 triggers recommendation for composition terms

### Subject Visibility

- Read from the `subjectVisibility` asset property (default: 75)
- **Threshold:** visibility < 40 triggers "Subject is not clearly visible" issue

### Text Readability

- Read from the `textReadability` asset property (default: 80)
- Used in overall score calculation

### Watermark Detection

- Read from the `watermarkPresence` asset property (default: 0)
- If present, overall score is multiplied by 0.98

### Image Overall Score

```
overallScore = (
  resolution * 0.20 +
  sharpness * 0.15 +
  (100 - noise) * 0.10 +
  exposure * 0.10 +
  contrast * 0.10 +
  cropping * 0.05 +
  composition * 0.10 +
  subjectVisibility * 0.15 +
  textReadability * 0.05
) * (watermarkPresence > 0 ? 0.98 : 1)
```

## Video Technical Validation

**File:** `src/core/quality-assurance/video-validator.service.ts`

### Resolution

| Width | Score |
|-------|-------|
| >= 1920 | 100 |
| >= 1280 | 85 |
| >= 720 | 65 |
| Below 720 | 40 |

**Minimum threshold:** 480px width. Assets below trigger an issue.

### Frame Rate (FPS)

| FPS | Score |
|-----|-------|
| >= 60 | 100 |
| >= 30 | 90 |
| >= 24 | 75 |
| > 0 but < 24 | 40 |
| 0 (unknown) | 50 |

### Frame Consistency

- Read from the `frameConsistency` asset property (default: 70)
- **Threshold:** < 50 triggers "Frame inconsistencies detected" issue

### Scene Continuity

- Read from the `sceneContinuity` asset property (default: 70)
- **Threshold:** < 50 triggers "Scene continuity issues" issue

### Audio Presence

- Read from `audioPresent` or derived from `hasAudio` flag
- **Threshold:** < 50 triggers "Missing or low audio" issue

### Rendering Errors

- Read from the `renderingErrors` asset property (default: 0)
- Score: `100 - min(renderingErrors * 20, 100)`
- **Threshold:** > 0 triggers rendering error issue

### Transition Quality

- Read from the `transitionQuality` asset property (default: 75)

### Ending Quality

- Read from the `endingQuality` asset property (default: 70)

### Thumbnail Availability

- Read from the `hasThumbnail` flag
- Values: 100 (present) | 20 (absent)
- **Threshold:** < 50 triggers "No thumbnail generated" issue

### Video Overall Score

```
overallScore = (
  resolution * 0.15 +
  fpsScore * 0.15 +
  frameConsistency * 0.15 +
  sceneContinuity * 0.15 +
  audioPresence * 0.10 +
  (100 - renderingErrors * 20) * 0.10 +
  transitionQuality * 0.05 +
  endingQuality * 0.05 +
  thumbnailAvailability * 0.10
)
```

## File Integrity

File integrity is assessed through the combination of:
- Resolution validation (minimum dimensions)
- Compression artifact detection
- Rendering error counting
- Noise level measurement

Assets that fail multiple technical checks will receive low technical scores, triggering recommendations for regeneration.
