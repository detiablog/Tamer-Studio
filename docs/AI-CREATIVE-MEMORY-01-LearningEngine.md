# AI Creative Memory System - Learning Engine

## Event Types

The Learning Engine records the following event types:

| Event Type | Category | Description | Weight |
|------------|----------|-------------|--------|
| `prompt_usage` | moduleType | User used a prompt in an AI module | Varies by success |
| `asset_favorite` | assetType | User favorited a generated asset | +20 |
| `asset_download` | assetType | User downloaded a generated asset | +10 |
| `asset_publish` | assetType | User published a generated asset | +15 |
| `asset_edit` | assetType | User edited a generated asset | +5 |
| `style_preference` | category | User expressed a style preference | +confidence/10 |

### Event Data Structure

```typescript
{
  id: string;           // Prefixed ID (e.g., "cle_xxxx")
  userId: string;       // Owner identifier
  eventType: string;    // Event type (see above)
  category?: string;    // Category (module type, asset type, etc.)
  entityId?: string;    // Related entity ID
  entityType?: string;  // Related entity type
  data: Record<string, unknown>;  // Event-specific data
  source?: string;      // Origin of the event
  createdAt: Date;      // Event timestamp
}
```

---

## Learning from User Edits

When a user edits a generated asset:

1. **Event recorded**: `asset_edit` event with asset details
2. **Confidence update**: Existing asset type preference gains +5 confidence
3. **Memory update**: If a matching memory exists, its score increases
4. **Preference inference**: `inferPreferences()` is triggered to recalculate

### Edit Data Payload

```json
{
  "assetId": "asset_123",
  "assetType": "image",
  "action": "edit",
  "projectId": "proj_456"
}
```

---

## Learning from Prompt Changes

### Prompt Usage Recording

```typescript
recordPromptUsage(userId, {
  prompt: string,
  moduleType: string,
  projectId?: string,
  wasSuccessful: boolean,
  rating?: number
})
```

### Processing Logic

1. **Learning event** is recorded with prompt details
2. **Score calculation**:
   - Successful: 70 base (or 50 + rating * 10 if rated)
   - Failed: 30
3. **Memory update**:
   - Existing memory: score += 5 (success) or -3 (failure)
   - New memory: score = calculated score
4. **Preference update**:
   - Existing preference: confidence += 5 (success) or -2 (failure)
   - New preference: confidence = calculated confidence

### Prompt Memory Key Format

```
{moduleType}_{prompt.slice(0, 80)}
```

Example: `image_a beautiful sunset over the ocean with vibrant colors`

---

## Learning from Favorites, Downloads, and Published Assets

### Asset Interaction Recording

```typescript
recordAssetPreference(userId, {
  assetId: string,
  assetType: string,
  action: "favorite" | "download" | "publish" | "edit",
  projectId?: string
})
```

### Processing Logic

1. **Learning event** is recorded with asset details
2. **Preference update**:
   - Calculate weight based on action type
   - Update existing preference or create new one
   - Confidence increases by weight amount

### Action Weights

| Action | Weight | Description |
|--------|--------|-------------|
| `favorite` | +20 | Strongest positive signal |
| `publish` | +15 | High commitment signal |
| `download` | +10 | Moderate engagement signal |
| `edit` | +5 | Mild engagement signal |

---

## Preference Inference from Events

### Batch Inference

The `inferPreferences()` method performs batch analysis across all learning events:

```typescript
inferPreferences(userId: string)
```

### Inference Steps

1. **Event type counts**: Aggregate events by type and category
2. **Style counts**: Aggregate style preference events by style and category
3. **Prompt counts**: Aggregate prompt usage events by prompt and module type
4. **Asset counts**: Aggregate asset events by asset type
5. **Activity preferences**: Create activity-level preferences from event type counts
6. **Style preferences**: Create/update style preferences from style event counts
7. **Prompt preferences**: Create/update prompt preferences from prompt event counts
8. **Asset preferences**: Create/update asset preferences from asset event counts

### Inference Output

```typescript
{
  inferred: number;    // Number of preferences inferred
  totalEvents: number; // Total events analyzed
}
```

---

## Privacy Controls

### Settings Table (creative_memory_settings)

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `learningEnabled` | boolean | `true` | Master switch for learning |
| `learningPaused` | boolean | `false` | Temporarily pause learning |
| `maxMemories` | integer | `10000` | Maximum memories per user |
| `maxLearningEvents` | integer | `5000` | Maximum events per user |
| `autoCleanup` | boolean | `true` | Enable automatic cleanup |
| `retentionDays` | integer | `365` | Days before cleanup eligibility |
| `categoryLimits` | jsonb | `{}` | Per-category memory limits |
| `excludedCategories` | jsonb | `[]` | Categories excluded from learning |

### Learning Flow with Privacy Checks

```typescript
async processEvent(userId, event) {
  const settings = await this.checkSettings(userId);
  if (!settings.learningEnabled || settings.learningPaused) {
    return {
      recorded: false,
      inferred: false,
      reason: settings.learningPaused ? "paused" : "disabled"
    };
  }
  // ... record event and infer preferences
}
```

### Clear Learning Data

```typescript
clearLearningData(userId, options?)
```

| Option | Type | Description |
|--------|------|-------------|
| `category` | string | Clear only events in this category |
| `olderThan` | Date | Clear only events older than this date |

When clearing:
- Events are deleted based on filters
- If category specified: preferences in that category are also deleted
- If no filters: all preferences and memories are deleted

### API Endpoints for Privacy

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/memory/settings` | GET | Read current settings |
| `POST /api/memory/settings` | POST | Create/update settings |
| `PUT /api/memory/settings` | PUT | Update settings |
| `POST /api/memory/admin/reset-learning` | POST | Clear learning data |
| `POST /api/memory/clear` | POST | Clear all memories |

### Default Settings (No Settings Record)

When no settings record exists, the system uses these defaults:

```typescript
{
  learningEnabled: true,
  learningPaused: false,
  maxMemories: 10000,
  maxLearningEvents: 5000,
  autoCleanup: true,
  retentionDays: 365,
  categoryLimits: {},
  excludedCategories: [],
}
```
