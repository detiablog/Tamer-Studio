# AI-LEARNING-01 - Preference Engine

## Overview

The Preference Engine infers, stores, and manages user preferences based on observed behavior patterns, explicit user input, and feedback signals. It provides a unified preference resolution system that other platform components can query.

## Preference Inference Sources

### 1. Behavioral Inference

Preferences derived from observed user behavior:

- **Content Style**: Preferred content formats, tones, and structures
- **Workflow Habits**: Preferred workflow sequences and shortcuts
- **Feature Usage**: Preferred tools and features
- **Quality Standards**: Inferred quality thresholds
- **Publishing Habits**: Preferred publishing platforms and schedules

### 2. Explicit Override

User-provided preference values that override inferred values:

- Settings configured in the preferences UI
- Profile preferences
- Workspace-level defaults

### 3. Feedback Inference

Preferences learned from user feedback:

- Recommendation acceptance patterns
- Rating patterns
- Comment analysis

### 4. Default Fallback

Platform defaults when no inference is available:

- System-wide defaults
- Workspace defaults
- Plan-based defaults

## Preference Resolution

```
Explicit Override > High Confidence Inference > Medium Confidence > Low Confidence > Default
```

### Resolution Algorithm

```typescript
function resolvePreference(key: string, userId: string): PreferenceValue {
  // 1. Check for explicit override
  const override = getExplicitOverride(userId, key);
  if (override) return override.value;

  // 2. Check for high-confidence inference (>0.8)
  const highConf = getInferredPreference(userId, key, 0.8);
  if (highConf) return highConf.value;

  // 3. Check for medium-confidence inference (>0.5)
  const medConf = getInferredPreference(userId, key, 0.5);
  if (medConf) return medConf.value;

  // 4. Check for low-confidence inference (>0.3)
  const lowConf = getInferredPreference(userId, key, 0.3);
  if (lowConf) return lowConf.value;

  // 5. Return default
  return getDefaultPreference(key);
}
```

## Preference Schema

```typescript
type Preference = {
  id: string;
  userId: string;
  workspaceId: string;
  key: string;
  value: string;
  source: string;          // behavioral, explicit, feedback, default
  confidence: number;      // 0.0 to 1.0
  overridden: boolean;
  inferredAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
};
```

## Preference Categories

### Content Preferences

| Key | Type | Description |
|-----|------|-------------|
| `content.preferredFormat` | string | Preferred content format |
| `content.preferredTone` | string | Preferred writing tone |
| `content.preferredLength` | string | Preferred content length |
| `content.stylePreset` | string | Preferred style preset |

### Workflow Preferences

| Key | Type | Description |
|-----|------|-------------|
| `workflow.defaultStep` | string | Preferred first workflow step |
| `workflow.batchMode` | boolean | Prefer batch operations |
| `workflow.autoSave` | boolean | Enable auto-save |
| `workflow.shortcuts` | object | Preferred keyboard shortcuts |

### Feature Preferences

| Key | Type | Description |
|-----|------|-------------|
| `feature.defaultAIModel` | string | Preferred AI model |
| `feature.defaultProvider` | string | Preferred AI provider |
| `feature.imageStyle` | string | Preferred image generation style |
| `feature.videoQuality` | string | Preferred video quality |

### Publishing Preferences

| Key | Type | Description |
|-----|------|-------------|
| `publishing.defaultPlatform` | string | Primary publishing platform |
| `publishing.schedulePreference` | string | Preferred publishing schedule |
| `publishing.autoOptimize` | boolean | Auto-optimize for platforms |

### Quality Preferences

| Key | Type | Description |
|-----|------|-------------|
| `quality.minThreshold` | number | Minimum quality threshold |
| `quality.autoReview` | boolean | Enable auto quality review |
| `quality.strictMode` | boolean | Enable strict quality checks |

## Preference Management API

### List Preferences

```
GET /api/learning/preferences
```

Returns all preferences for the authenticated user.

### Override Preference

```
POST /api/learning/preferences/override
```

Sets an explicit override for a preference:

```json
{
  "id": "pref_123",
  "value": "new_value"
}
```

### Delete Preference

```
DELETE /api/learning/preferences/[id]
```

Removes a preference, reverting to inference or default.

## Confidence Scoring

Confidence is calculated based on:

- **Evidence Strength**: Number of observations supporting the preference
- **Consistency**: How consistent the observations are
- **Recency**: How recently the preference was observed
- **Source Weight**: Weight assigned to the inference source

### Confidence Levels

| Level | Range | Description |
|-------|-------|-------------|
| High | 0.8 - 1.0 | Strong evidence, reliable |
| Medium | 0.5 - 0.8 | Moderate evidence, generally reliable |
| Low | 0.3 - 0.5 | Weak evidence, may change |
| Very Low | 0.0 - 0.3 | Insufficient evidence |

## Privacy Considerations

- Users can view all inferred preferences
- Users can override any inferred preference
- Users can delete preferences to revert to defaults
- Privacy mode limits the types of preferences inferred
- Preferences are scoped to user and workspace
