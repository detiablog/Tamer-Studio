# AI Creative Memory System - API Endpoints

## Overview

All API endpoints are implemented as Next.js Route Handlers under `src/app/api/memory/`. Every endpoint requires user authentication via the `userAuthentication()` middleware.

### Base URL

```
/api/memory
```

### Authentication

All endpoints require a valid user session. The middleware extracts `userId` from the session and ensures it is present before proceeding.

### Response Format

All responses use the project's standard response format:

```json
{
  "success": true,
  "data": { ... }
}
```

or on error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## General Memory Endpoints

### List Memories

```
GET /api/memory
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `search` | string | No | Search content (LIKE) |
| `pinnedOnly` | string | No | Filter pinned only (`"true"`) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |

**Response**: `{ data: Memory[], total: number, page: number, limit: number }`

### Create Memory

```
POST /api/memory
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | Yes | Memory category |
| `key` | string | Yes | Unique key within category |
| `content` | string | No | Text content |
| `data` | object | No | Structured data |
| `source` | string | No | Origin module/event |
| `score` | number | No | Relevance score |
| `isPinned` | boolean | No | Pinned flag |
| `isSystem` | boolean | No | System-generated flag |
| `metadata` | object | No | Additional metadata |
| `expiresAt` | string | No | Expiration ISO timestamp |

**Response**: `Memory` (201 Created)

### Get Memory

```
GET /api/memory/[id]
```

**Response**: `Memory` or 404

### Update Memory

```
PUT /api/memory/[id]
```

**Request Body**: Partial memory fields to update

**Response**: Updated `Memory`

### Delete Memory

```
DELETE /api/memory/[id]
```

**Response**: 200 OK

---

## Brand Profile Endpoints

### List Brand Profiles

```
GET /api/memory/brand
```

**Response**: `BrandProfile[]`

### Create Brand Profile

```
POST /api/memory/brand
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Brand name |
| `logo` | string | No | Logo URL/data |
| `primaryColors` | string[] | No | Primary colors |
| `secondaryColors` | string[] | No | Secondary colors |
| `typography` | string | No | Font families |
| `watermark` | string | No | Watermark |
| `voice` | string | No | Brand voice |
| `tone` | string | No | Brand tone |
| `audience` | string | No | Target audience |
| `preferredCta` | string | No | CTA style |
| `preferredPlatforms` | string[] | No | Target platforms |
| `keywords` | string[] | No | Brand keywords |
| `rules` | string[] | No | Brand rules |
| `brandStyleGuide` | object | No | Extended style guide |
| `isActive` | boolean | No | Active flag |

**Response**: `BrandProfile` (201 Created)

### Get Brand Profile

```
GET /api/memory/brand/[id]
```

**Response**: `BrandProfile` or 404

### Update Brand Profile

```
PUT /api/memory/brand/[id]
```

**Response**: Updated `BrandProfile`

### Delete Brand Profile

```
DELETE /api/memory/brand/[id]
```

**Response**: 200 OK

---

## Preference Endpoints

### List Preferences

```
GET /api/memory/preferences
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: Preference[], total: number, page: number, limit: number }`

### Create Preference

```
POST /api/memory/preferences
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | Yes | Preference category |
| `key` | string | Yes | Unique key |
| `value` | string | Yes | Preference value |
| `confidence` | number | No | Confidence score |
| `source` | string | No | Inference source |
| `isEditable` | boolean | No | Editable flag |

**Response**: `Preference` (201 Created)

### Get Preference

```
GET /api/memory/preferences/[id]
```

**Response**: `Preference` or 404

### Update Preference

```
PUT /api/memory/preferences/[id]
```

**Response**: Updated `Preference`

### Delete Preference

```
DELETE /api/memory/preferences/[id]
```

**Response**: 200 OK

---

## Learning Event Endpoints

### List Learning Events

```
GET /api/memory/learning
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventType` | string | No | Filter by event type |
| `category` | string | No | Filter by category |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: LearningEvent[], total: number, page: number, limit: number }`

### Record Learning Event

```
POST /api/memory/learning
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventType` | string | Yes | Event type |
| `category` | string | No | Event category |
| `entityId` | string | No | Related entity ID |
| `entityType` | string | No | Related entity type |
| `data` | object | No | Event-specific data |
| `source` | string | No | Event origin |

**Response**: `LearningEvent` (201 Created)

---

## Visual Memory Endpoints

### List Visual Memories

```
GET /api/memory/visual
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | No | Filter by project |
| `search` | string | No | Search by name |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: VisualMemory[], total: number, page: number, limit: number }`

### Create Visual Memory

```
POST /api/memory/visual
```

**Response**: `VisualMemory` (201 Created)

### Get/Update/Delete Visual Memory

```
GET /api/memory/visual/[id]
PUT /api/memory/visual/[id]
DELETE /api/memory/visual/[id]
```

---

## Story Memory Endpoints

### List Story Memories

```
GET /api/memory/story
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: StoryMemory[], total: number, page: number, limit: number }`

### Create Story Memory

```
POST /api/memory/story
```

**Response**: `StoryMemory` (201 Created)

### Get/Update/Delete Story Memory

```
GET /api/memory/story/[id]
PUT /api/memory/story/[id]
DELETE /api/memory/story/[id]
```

---

## Character Memory Endpoints

### List Character Memories

```
GET /api/memory/character
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: CharacterMemory[], total: number, page: number, limit: number }`

### Create Character Memory

```
POST /api/memory/character
```

**Response**: `CharacterMemory` (201 Created)

### Get/Update/Delete Character Memory

```
GET /api/memory/character/[id]
PUT /api/memory/character/[id]
DELETE /api/memory/character/[id]
```

---

## Thumbnail Memory Endpoints

### List Thumbnail Memories

```
GET /api/memory/thumbnail
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | No | Filter by project |
| `search` | string | No | Search by name |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: ThumbnailMemory[], total: number, page: number, limit: number }`

### Create Thumbnail Memory

```
POST /api/memory/thumbnail
```

**Response**: `ThumbnailMemory` (201 Created)

### Get/Update/Delete Thumbnail Memory

```
GET /api/memory/thumbnail/[id]
PUT /api/memory/thumbnail/[id]
DELETE /api/memory/thumbnail/[id]
```

---

## Caption Memory Endpoints

### List Caption Memories

```
GET /api/memory/caption
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | No | Filter by project |
| `search` | string | No | Search by name |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: CaptionMemory[], total: number, page: number, limit: number }`

### Create Caption Memory

```
POST /api/memory/caption
```

**Response**: `CaptionMemory` (201 Created)

### Get/Update/Delete Caption Memory

```
GET /api/memory/caption/[id]
PUT /api/memory/caption/[id]
DELETE /api/memory/caption/[id]
```

---

## Workflow Memory Endpoints

### List Workflow Memories

```
GET /api/memory/workflow
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by name |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: WorkflowMemory[], total: number, page: number, limit: number }`

### Create Workflow Memory

```
POST /api/memory/workflow
```

**Response**: `WorkflowMemory` (201 Created)

### Get/Update/Delete Workflow Memory

```
GET /api/memory/workflow/[id]
PUT /api/memory/workflow/[id]
DELETE /api/memory/workflow/[id]
```

---

## Generation Memory Endpoints

### List Generation Memories

```
GET /api/memory/generation
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `moduleType` | string | No | Filter by module type |
| `projectId` | string | No | Filter by project |
| `isFavorite` | string | No | Filter favorites (`"true"` or `"false"`) |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response**: `{ data: GenerationMemory[], total: number, page: number, limit: number }`

### Create Generation Memory

```
POST /api/memory/generation
```

**Response**: `GenerationMemory` (201 Created)

### Get/Update/Delete Generation Memory

```
GET /api/memory/generation/[id]
PUT /api/memory/generation/[id]
DELETE /api/memory/generation/[id]
```

---

## Publishing Memory Endpoints

### Get Publishing Memory

```
GET /api/memory/publishing
```

**Response**: `PublishingMemory` or null

### Create/Update Publishing Memory

```
POST /api/memory/publishing
PUT /api/memory/publishing
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `preferredPlatforms` | string[] | No | Target platforms |
| `postingTime` | object | No | Preferred posting times |
| `postingFrequency` | string | No | Posting frequency |
| `schedulingPattern` | object | No | Scheduling pattern |
| `campaignTiming` | object | No | Campaign timing |
| `timezone` | string | No | User timezone |
| `publishingStrategy` | object | No | Publishing strategy |

**Response**: `PublishingMemory` (201 Created or updated)

---

## Context and Search Endpoints

### Build Context

```
POST /api/memory/context
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | No | Project context |
| `moduleType` | string | No | Module type context |
| `categories` | string[] | No | Memory categories |

**Response**: `{ context: CreativeContext, summary: string }`

### Search Context

```
GET /api/memory/search
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `categories` | string | No | Comma-separated categories |
| `limit` | number | No | Result limit (max 50) |

**Response**: `Memory[]`

### Get Suggestions

```
GET /api/memory/suggestions
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `moduleType` | string | No | Module type filter |
| `category` | string | No | Category filter |

**Response**: `Memory[]`

---

## Statistics and Settings Endpoints

### Get Statistics

```
GET /api/memory/stats
```

**Response**: Aggregate counts for all memory types

### Get Settings

```
GET /api/memory/settings
```

**Response**: `MemorySettings` or null

### Create/Update Settings

```
POST /api/memory/settings
PUT /api/memory/settings
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `learningEnabled` | boolean | No | Learning master switch |
| `learningPaused` | boolean | No | Pause learning |
| `maxMemories` | number | No | Memory limit |
| `maxLearningEvents` | number | No | Event limit |
| `autoCleanup` | boolean | No | Auto cleanup flag |
| `retentionDays` | number | No | Retention period |
| `categoryLimits` | object | No | Per-category limits |
| `excludedCategories` | string[] | No | Excluded categories |

**Response**: `MemorySettings` (201 Created or updated)

---

## Import/Export Endpoints

### Export All

```
GET /api/memory/export
```

**Response**: Full export JSON with all memory types

### Import All

```
POST /api/memory/import
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `memories` | array | No | General memories |
| `brands` | array | No | Brand profiles |
| `preferences` | array | No | Preferences |
| `learningEvents` | array | No | Learning events |
| `visuals` | array | No | Visual memories |
| `stories` | array | No | Story memories |
| `characters` | array | No | Character memories |
| `thumbnails` | array | No | Thumbnail memories |
| `captions` | array | No | Caption memories |
| `workflows` | array | No | Workflow memories |
| `generations` | array | No | Generation memories |

At least one section must be provided.

**Response**: Import counts per category (201 Created)

### Clear All

```
POST /api/memory/clear
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `categories` | string[] | No | Categories to clear (all if omitted) |

**Response**: `{ cleared: true }`

---

## Admin Endpoints

### Analytics

```
GET /api/memory/admin/analytics
```

**Response**: Same as `/api/memory/stats`

### Learning Rules

```
GET /api/memory/admin/rules
POST /api/memory/admin/rules
```

**GET Response**: Learning events list
**POST Response**: Created learning event

### Admin Clear

```
POST /api/memory/admin/clear
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `categories` | string[] | No | Categories to clear |

**Response**: `{ cleared: true }`

### Reset Learning

```
POST /api/memory/admin/reset-learning
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | string | No | Category to reset |
| `olderThan` | string | No | ISO timestamp cutoff |

**Response**: `{ eventsDeleted: number }`

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server-side error |
