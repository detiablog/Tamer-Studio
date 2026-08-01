# AI Quality Assurance - Brand Validation

## Overview

Brand Validation ensures AI-generated assets align with the user's defined brand identity. It reads the active brand profile from the Creative Memory system and scores the asset against brand guidelines.

**File:** `src/core/quality-assurance/brand-validator.service.ts`

## Validation Checks

### Logo Presence

**Metric:** `logoPresent`
**Values:** 100 (present) | 30 (absent)
**Weight:** 0.15

Checks whether the asset includes the brand logo as indicated by the `hasLogo` flag in the asset metadata.

### Watermark Presence

**Metric:** `watermarkPresent`
**Values:** 100 (present) | 20 (absent)
**Weight:** 0.10

Checks whether the asset includes a brand watermark via the `hasWatermark` flag.

### Color Match

**Metric:** `colorMatch`
**Range:** 0-100
**Weight:** 0.25

Compares the asset's color palette against the brand profile's combined primary and secondary colors.

**Calculation:**
```
matchCount = count(assetColors that exist in brandColors)
colorMatch = (matchCount / totalBrandColors) * 100
```

**Threshold:** If `colorMatch < 50`, an issue is raised recommending palette adjustment.

### Typography Match

**Metric:** `typographyMatch`
**Values:** 90 (match) | 40 (mismatch)
**Weight:** 0.15

Compares the asset's typography against the brand profile's typography setting. Exact string comparison.

### Tone Match

**Metric:** `toneMatch`
**Values:** 100 (exact match) | 50 (mismatch)
**Weight:** 0.20

Compares the asset's tone against the brand profile's tone setting. Exact string comparison.

**Threshold:** If `toneMatch < 60` and brand has a defined tone, an issue is raised.

### CTA Match

**Metric:** `ctaMatch`
**Values:** 100 (match) | 50 (mismatch)
**Weight:** 0.15

Compares the asset's preferred CTA against the brand profile's preferred CTA.

### Thumbnail Style Match

**Metric:** `thumbnailStyleMatch`
**Default:** 70
**Weight:** Not included in overall calculation

Placeholder for future thumbnail style validation.

## Brand Consistency Scoring

### With Active Brand Profile

```
overallBrandScore = (
  logoPresent * 0.15 +
  watermarkPresent * 0.10 +
  colorMatch * 0.25 +
  typographyMatch * 0.15 +
  toneMatch * 0.20 +
  ctaMatch * 0.15
)
```

### Without Active Brand Profile (Fallback)

```
overallBrandScore = (
  logoPresent * 0.40 +
  watermarkPresent * 0.40 +
  60 * 0.20
)
```

When no brand profile exists, the system falls back to basic logo/watermark checks with a neutral score of 60 for other metrics.

## Brand Profile Source

Brand data is loaded from the `creativeBrand_profile` table:

```typescript
const [brand] = await db.select()
  .from(creativeBrandProfile)
  .where(
    and(
      eq(creativeBrandProfile.userId, userId),
      eq(creativeBrandProfile.isActive, true)
    )
  )
  .orderBy(creativeBrandProfile.updatedAt)
  .limit(1);
```

The most recently updated active profile is used.

## Brand Profile Fields Used

| Profile Field | Asset Field | Comparison |
|---------------|-------------|------------|
| primaryColors, secondaryColors | colors | Set intersection |
| typography | typography | Exact match |
| tone | tone | Exact match |
| preferredCta | preferredCta | Exact match |
