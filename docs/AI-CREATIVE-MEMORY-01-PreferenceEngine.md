# AI Creative Memory System - Preference Engine

## Preference Inference Algorithm

The Preference Engine infers user preferences by analyzing learning events and behavioral patterns. It uses a confidence-based scoring system to track the reliability of each inferred preference.

### Inference Sources

| Source | Trigger | Inference Method |
|--------|---------|-----------------|
| `prompt_inference` | Prompt usage events | Track prompt patterns per module type |
| `style_inference` | Style preference events | Track style selections per category |
| `asset_inference` | Asset interactions | Track asset type engagement |
| `auto_inference` | Aggregate event analysis | Statistical analysis of all events |

### Confidence Calculation

Confidence is calculated using a formula that considers:

1. **Event frequency**: More events = higher confidence
2. **Event type weight**: Different events have different weights
3. **Historical confidence**: Previous confidence values are accumulated
4. **Ceiling**: Maximum confidence is capped at 95

```
confidence = min(95, (eventCount / totalEvents) * 100 + baseBonus)
```

Where `baseBonus` varies by source:
- `style_inference`: +30
- `prompt_inference`: +30
- `asset_inference`: +30
- `auto_inference`: +20

### Incremental Updates

When a preference already exists, confidence is updated incrementally:

```
newConfidence = min(100, existingConfidence + delta)
```

Where `delta` depends on the event type:
- Successful prompt: +5
- Failed prompt: -2
- Favorite: +20
- Download: +10
- Publish: +15
- Edit: +5

---

## Confidence Scoring

### Score Ranges

| Range | Level | Description |
|-------|-------|-------------|
| 0-20 | Very Low | Insufficient data, unreliable |
| 21-40 | Low | Emerging pattern, may change |
| 41-60 | Medium | Established pattern, moderately reliable |
| 61-80 | High | Strong pattern, reliable |
| 81-95 | Very High | Highly reliable preference |
| 96-100 | Reserved | Used for manually set preferences |

### Confidence Decay

Confidence is not explicitly decayed over time, but:

- New events can decrease confidence (e.g., failed prompts: -2)
- Successful patterns increase confidence incrementally
- The ceiling of 95 prevents infinite growth from repeated events

### Preference Ordering

Preferences are displayed and used in descending confidence order:

```typescript
db.select()
  .from(creativePreference)
  .where(eq(creativePreference.userId, userId))
  .orderBy(desc(creativePreference.confidence));
```

---

## Preference Categories

### Style Preferences

- **Key Pattern**: `style_{category}`
- **Example**: `style_visual`, `style_thumbnail`, `style_caption`
- **Source**: `style_inference`
- **Editable**: Yes (default)
- **Confidence Bonus**: +30 base, +confidence/10 per event

### Prompt Preferences

- **Key Pattern**: `prompt_style_{moduleType}`
- **Example**: `prompt_style_image`, `prompt_style_video`
- **Source**: `prompt_inference`
- **Editable**: Yes (default)
- **Confidence Bonus**: +30 base, +5 per success, -2 per failure

### Asset Preferences

- **Key Pattern**: `asset_type_{assetType}`
- **Example**: `asset_type_image`, `asset_type_video`
- **Source**: `asset_inference`
- **Editable**: Yes (default)
- **Confidence Bonus**: +30 base, weighted by action type

### Activity Preferences

- **Key Pattern**: `activity_{eventType}_{category}`
- **Example**: `activity_prompt_usage_image`, `activity_asset_favorite_video`
- **Source**: `auto_inference`
- **Editable**: No (auto-generated)
- **Confidence Bonus**: +20 base

---

## Updatable vs Auto-Inferred Preferences

### Updatable Preferences (isEditable: true)

- Created by user actions (style selections, prompt usage)
- Can be modified via the Preferences API
- Confidence increases with consistent usage
- Default for manually created preferences

### Auto-Inferred Preferences (isEditable: false)

- Created by the `inferPreferences()` method
- Cannot be directly modified by users
- Updated only through new learning events
- Used for statistical analysis and activity tracking

### Preference Structure

```typescript
{
  id: string;           // Prefixed ID (e.g., "cpref_xxxx")
  userId: string;       // Owner identifier
  category: string;     // Preference category
  key: string;          // Unique key within category
  value: string;        // Preference value
  confidence: number;   // Confidence score (0-100)
  source?: string;      // Inference source
  isEditable: boolean;  // Whether user can edit
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Uniqueness Constraint

Each preference has a unique constraint on `(userId, key)`:

```typescript
unique("creative_pref_user_key_unique").on(table.userId, table.key);
```

This ensures one preference per key per user, enabling upsert behavior.
