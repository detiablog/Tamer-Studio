# AI Quality Assurance - Story Validation

## Overview

Story Validation evaluates narrative content (stories, dramas, affiliate narratives) for consistency across timeline, characters, relationships, locations, and episode continuity. It is invoked for assets with `assetType` of `"story"` or `"drama"`.

**File:** `src/core/quality-assurance/story-validator.service.ts`

## Validation Checks

### Timeline Consistency

**Metric:** `timelineConsistency`
**Default:** 75
**Threshold for issue:** < 50
**Weight:** 0.15

Validates that events occur in correct chronological order. Checks for temporal paradoxes, flashback accuracy, and sequential logic.

**Issue:** "Timeline inconsistencies"
**Recommendation:** "Review the story timeline for order errors"

### Character Consistency

**Metric:** `characterConsistency`
**Default:** 75
**Threshold for issue:** < 50
**Weight:** 0.20

Validates that character attributes (appearance, personality, abilities) remain consistent across episodes and scenes.

**Issue:** "Character inconsistencies detected"
**Recommendation:** "Re-verify character appearance with references"

### Relationship Consistency

**Metric:** `relationshipConsistency`
**Default:** 70
**Weight:** 0.10

Validates that character relationships (family, friends, enemies, allies) remain consistent throughout the narrative.

### Location Consistency

**Metric:** `locationConsistency`
**Default:** 70
**Weight:** 0.10

Validates that settings and locations maintain consistent descriptions, geography, and spatial relationships.

### Object Consistency

**Metric:** `objectConsistency`
**Default:** 70
**Weight:** 0.05

Validates that objects, props, and items maintain continuity (e.g., an object introduced in one scene appears correctly in subsequent scenes).

### Dialogue Style

**Metric:** `dialogueStyle`
**Default:** 70
**Weight:** 0.10

Validates that character dialogue maintains consistent voice, vocabulary, and speech patterns.

### Episode Continuity

**Metric:** `episodeContinuity`
**Default:** 70
**Threshold for issue:** < 50
**Weight:** 0.20

Validates continuity between episodes. Checks that events, character states, and plot threads carry forward correctly.

**Issue:** "Episode continuity issues"
**Recommendation:** "Check previous episode endings against new content"

### Rule Compliance

**Metric:** `ruleCompliance`
**Default:** 75
**Threshold for issue:** < 50
**Weight:** 0.10

Validates that the content adheres to user-defined story rules (genre constraints, content policies, narrative guidelines).

**Issue:** "Story rules may be violated"
**Recommendation:** "Validate content against story rules"

## Overall Story Score Calculation

```
overallStoryScore = (
  timelineConsistency * 0.15 +
  characterConsistency * 0.20 +
  relationshipConsistency * 0.10 +
  locationConsistency * 0.10 +
  objectConsistency * 0.05 +
  dialogueStyle * 0.10 +
  episodeContinuity * 0.20 +
  ruleCompliance * 0.10
)
```

**Total weight:** 1.00

## Score Ranges

| Range | Interpretation |
|-------|---------------|
| 85-100 | Excellent narrative consistency |
| 70-84 | Good consistency, minor issues |
| 50-69 | Needs improvement, several inconsistencies |
| 0-49 | Significant narrative problems, requires rework |

## Asset Types Using Story Validation

- `story` - Standalone story content
- `drama` - Serialized drama/episode content
