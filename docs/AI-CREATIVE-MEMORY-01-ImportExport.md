# AI Creative Memory System - Import/Export

## Full Export

### Endpoint

```
GET /api/memory/export
```

### Description

Exports all creative memory data for the authenticated user as a single JSON response.

### Exported Data Structure

```json
{
  "memories": [...],         // creativeMemory records
  "brands": [...],           // creativeBrandProfile records
  "preferences": [...],      // creativePreference records
  "learningEvents": [...],   // creativeLearningEvent records
  "visuals": [...],          // creativeVisualMemory records
  "stories": [...],          // creativeStoryMemory records
  "characters": [...],       // creativeCharacterMemory records
  "thumbnails": [...],       // creativeThumbnailMemory records
  "captions": [...],         // creativeCaptionMemory records
  "workflows": [...],        // creativeWorkflowMemory records
  "generations": [...],      // creativeGenerationMemory records
  "publishing": [...],       // creativePublishingMemory records
  "settings": {...}          // creativeMemorySettings record
}
```

### Implementation

```typescript
async exportAll(userId: string) {
  const memories = await db.select().from(creativeMemory).where(eq(creativeMemory.userId, userId));
  const brands = await db.select().from(creativeBrandProfile).where(eq(creativeBrandProfile.userId, userId));
  const preferences = await db.select().from(creativePreference).where(eq(creativePreference.userId, userId));
  const events = await db.select().from(creativeLearningEvent).where(eq(creativeLearningEvent.userId, userId));
  const visuals = await db.select().from(creativeVisualMemory).where(eq(creativeVisualMemory.userId, userId));
  const stories = await db.select().from(creativeStoryMemory).where(eq(creativeStoryMemory.userId, userId));
  const characters = await db.select().from(creativeCharacterMemory).where(eq(creativeCharacterMemory.userId, userId));
  const thumbnails = await db.select().from(creativeThumbnailMemory).where(eq(creativeThumbnailMemory.userId, userId));
  const captions = await db.select().from(creativeCaptionMemory).where(eq(creativeCaptionMemory.userId, userId));
  const workflows = await db.select().from(creativeWorkflowMemory).where(eq(creativeWorkflowMemory.userId, userId));
  const generations = await db.select().from(creativeGenerationMemory).where(eq(creativeGenerationMemory.userId, userId));
  const publishing = await db.select().from(creativePublishingMemory).where(eq(creativePublishingMemory.userId, userId));
  const settings = await this.getSettings(userId);
  return { memories, brands, preferences, learningEvents: events, visuals, stories, characters, thumbnails, captions, workflows, generations, publishing, settings };
}
```

---

## Full Import

### Endpoint

```
POST /api/memory/import
```

### Request Body

```json
{
  "memories": [...],
  "brands": [...],
  "preferences": [...],
  "learningEvents": [...],
  "visuals": [...],
  "stories": [...],
  "characters": [...],
  "thumbnails": [...],
  "captions": [...],
  "workflows": [...],
  "generations": [...]
}
```

### Validation

At least one data section must be provided:

```typescript
if (!body.memories && !body.brands && !body.preferences && !body.learningEvents) {
  return errorResponse("VALIDATION_ERROR", "At least one data section is required");
}
```

### Import Behavior

- **New IDs**: All imported records receive new IDs (existing IDs are overwritten)
- **User ID**: All records are assigned to the importing user's ID
- **Batch insert**: Each category is inserted as a batch for performance
- **No merge**: Import creates new records, does not merge with existing data

### Response

```json
{
  "memories": 15,
  "brands": 2,
  "preferences": 8,
  "learningEvents": 50,
  "visuals": 5,
  "stories": 3,
  "characters": 4,
  "thumbnails": 6,
  "captions": 4,
  "workflows": 2,
  "generations": 10
}
```

Each key represents the count of records imported for that category.

---

## Selective Import/Export

### Selective Export

The current implementation exports all data. Selective export can be achieved by:

1. Exporting all data
2. Filtering the JSON on the client side
3. Re-importing the filtered subset

### Selective Import

Selective import is supported by only including desired categories in the request body:

```json
{
  "brands": [...],
  "preferences": [...]
}
```

Categories not included in the request body are not imported.

---

## Backup/Restore Workflow

### Backup Procedure

1. **Export**: `GET /api/memory/export`
2. **Save**: Store the JSON response as a backup file
3. **Verify**: Confirm the backup file contains all expected data

### Restore Procedure

1. **Clear** (optional): `POST /api/memory/clear` to remove existing data
2. **Import**: `POST /api/memory/import` with the backup JSON
3. **Verify**: `GET /api/memory/stats` to confirm data counts match

### Backup File Format

```json
{
  "version": "1.0",
  "exportDate": "2024-01-15T10:30:00Z",
  "userId": "user_xxxxx",
  "data": {
    "memories": [...],
    "brands": [...],
    "preferences": [...],
    "learningEvents": [...],
    "visuals": [...],
    "stories": [...],
    "characters": [...],
    "thumbnails": [...],
    "captions": [...],
    "workflows": [...],
    "generations": [...],
    "publishing": [...],
    "settings": {...}
  }
}
```

### Important Notes

- Import does not clear existing data; it appends new records
- For a clean restore, clear data before importing
- Imported records receive new IDs to prevent conflicts
- User ID is always reassigned to the authenticated user
- Publishing memory and settings use upsert behavior (single record per user)
