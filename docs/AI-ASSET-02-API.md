# Smart Asset Intelligence System - API Reference

## Overview

The Smart Asset Intelligence system exposes 25 REST API endpoints organized under `/api/asset-intelligence/`. All endpoints require authentication and are scoped to the authenticated user. Standard response format follows the Tamer Studio API convention.

---

## Base URL

```
/api/asset-intelligence/
```

## Authentication

All endpoints require a valid session cookie. Unauthenticated requests return 401.

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Endpoints

### Metadata

#### POST /api/asset-intelligence/metadata

Create metadata for an asset.

**Request Body:**
```json
{
  "assetId": "string (required)",
  "assetType": "string (required)",
  "title": "string (optional)",
  "description": "string (optional)",
  "width": "number (optional)",
  "height": "number (optional)",
  "duration": "number (optional)",
  "aspectRatio": "string (optional)",
  "fileSize": "number (optional)",
  "format": "string (optional)",
  "language": "string (optional)",
  "dominantColors": ["string"] (optional),
  "colorPalette": ["string"] (optional),
  "projectId": "string (optional)",
  "aiModel": "string (optional)",
  "provider": "string (optional)",
  "generationMetadata": "object (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/metadata

List metadata for the authenticated user.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| assetType | string | - | Filter by asset type |
| projectId | string | - | Filter by project |
| extractionStatus | string | - | Filter by extraction status |

#### GET /api/asset-intelligence/metadata/[id]

Get a single metadata record by ID.

**Response:** 200 OK

#### PUT /api/asset-intelligence/metadata/[id]

Update metadata fields.

**Request Body:** Partial metadata fields to update.

**Response:** 200 OK

#### DELETE /api/asset-intelligence/metadata/[id]

Delete a metadata record.

**Response:** 200 OK

---

### Tags

#### POST /api/asset-intelligence/tags

Create a new tag.

**Request Body:**
```json
{
  "name": "string (required)",
  "category": "string (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/tags

List tags for the authenticated user.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| category | string | - | Filter by category |
| search | string | - | Search by name |

#### GET /api/asset-intelligence/tags/[id]

Get a single tag by ID.

#### PUT /api/asset-intelligence/tags/[id]

Update a tag.

#### DELETE /api/asset-intelligence/tags/[id]

Delete a tag.

#### POST /api/asset-intelligence/tags/asset

Assign or remove tags from an asset.

**Request Body:**
```json
{
  "assetId": "string (required)",
  "tagIds": ["string"] (required),
  "action": "assign | remove (required)"
}
```

---

### Categories

#### POST /api/asset-intelligence/categories

Create a new category.

**Request Body:**
```json
{
  "name": "string (required)",
  "type": "string (required)",
  "parent": "string (optional)",
  "description": "string (optional)",
  "icon": "string (optional)",
  "sortOrder": "number (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/categories

List categories.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| type | string | - | Filter by type |
| parent | string | - | Filter by parent |

#### GET /api/asset-intelligence/categories/[id]

Get a single category by ID.

#### PUT /api/asset-intelligence/categories/[id]

Update a category.

#### DELETE /api/asset-intelligence/categories/[id]

Delete a category.

---

### Classifications

#### POST /api/asset-intelligence/classifications

Create or update classification for an asset.

**Request Body:**
```json
{
  "assetId": "string (required)",
  "projectId": "string (optional)",
  "campaign": "string (optional)",
  "story": "string (optional)",
  "character": "string (optional)",
  "brand": "string (optional)",
  "platform": "string (optional)",
  "contentType": "string (optional)",
  "mediaType": "string (optional)",
  "style": "string (optional)",
  "theme": "string (optional)",
  "genre": "string (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/classifications

List classifications.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| assetId | string | - | Filter by asset |
| projectId | string | - | Filter by project |
| character | string | - | Filter by character |
| brand | string | - | Filter by brand |

#### GET /api/asset-intelligence/classifications/[id]

Get a single classification by ID.

#### PUT /api/asset-intelligence/classifications/[id]

Update a classification.

#### DELETE /api/asset-intelligence/classifications/[id]

Delete a classification.

---

### Recognition

#### POST /api/asset-intelligence/recognition

Create a recognition result.

**Request Body:**
```json
{
  "assetId": "string (required)",
  "recognitionType": "string (required)",
  "label": "string (required)",
  "confidence": "number (required)",
  "boundingBox": "object (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/recognition

List recognition results.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| assetId | string | - | Filter by asset |
| recognitionType | string | - | Filter by type |
| minConfidence | number | - | Minimum confidence |

#### GET /api/asset-intelligence/recognition/[id]

Get a single recognition result.

#### PUT /api/asset-intelligence/recognition/[id]

Update a recognition result.

#### DELETE /api/asset-intelligence/recognition/[id]

Delete a recognition result.

---

### Duplicates

#### POST /api/asset-intelligence/duplicates

Create a duplicate detection record.

**Request Body:**
```json
{
  "assetId": "string (required)",
  "duplicateAssetId": "string (required)",
  "matchType": "string (required)",
  "similarityScore": "number (required)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/duplicates

List duplicate records.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| assetId | string | - | Filter by asset |
| matchType | string | - | Filter by match type |
| status | string | - | Filter by status |
| minSimilarity | number | - | Minimum similarity |

#### GET /api/asset-intelligence/duplicates/[id]

Get a single duplicate record.

#### PUT /api/asset-intelligence/duplicates/[id]

Update duplicate status (resolve/ignore).

#### DELETE /api/asset-intelligence/duplicates/[id]

Delete a duplicate record.

---

### Relationships

#### POST /api/asset-intelligence/relationships

Create a relationship between assets.

**Request Body:**
```json
{
  "sourceAssetId": "string (required)",
  "targetAssetId": "string (required)",
  "relationshipType": "string (required)",
  "strength": "number (optional, default 50)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/relationships

List relationships.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| sourceAssetId | string | - | Filter by source |
| targetAssetId | string | - | Filter by target |
| relationshipType | string | - | Filter by type |
| minStrength | number | - | Minimum strength |

#### GET /api/asset-intelligence/relationships/[id]

Get a single relationship.

#### PUT /api/asset-intelligence/relationships/[id]

Update a relationship.

#### DELETE /api/asset-intelligence/relationships/[id]

Delete a relationship.

---

### Quality

#### POST /api/asset-intelligence/quality

Create a quality score for an asset.

**Request Body:**
```json
{
  "assetId": "string (required)",
  "resolution": "number (optional)",
  "sharpness": "number (optional)",
  "composition": "number (optional)",
  "lighting": "number (optional)",
  "brandConsistency": "number (optional)",
  "technicalQuality": "number (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/quality

List quality scores.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| assetId | string | - | Filter by asset |
| minScore | number | - | Minimum overall score |
| maxScore | number | - | Maximum overall score |

#### GET /api/asset-intelligence/quality/[id]

Get a single quality score.

#### PUT /api/asset-intelligence/quality/[id]

Update a quality score.

#### DELETE /api/asset-intelligence/quality/[id]

Delete a quality score.

---

### Collections

#### POST /api/asset-intelligence/collections

Create a collection.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "type": "string (optional, default 'manual')",
  "color": "string (optional)",
  "isPinned": "boolean (optional)",
  "rules": "object (optional)"
}
```

**Response:** 201 Created

#### GET /api/asset-intelligence/collections

List collections.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| type | string | - | Filter by type |

#### GET /api/asset-intelligence/collections/[id]

Get a single collection with items.

#### PUT /api/asset-intelligence/collections/[id]

Update a collection.

#### DELETE /api/asset-intelligence/collections/[id]

Delete a collection and its items.

#### POST /api/asset-intelligence/collections/[id]/assets

Add or remove assets from a collection.

**Request Body:**
```json
{
  "assetIds": ["string"] (required),
  "action": "add | remove (required)"
}
```

---

## Endpoint Summary

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | POST | /metadata | Create metadata |
| 2 | GET | /metadata | List metadata |
| 3 | GET | /metadata/[id] | Get metadata |
| 4 | PUT | /metadata/[id] | Update metadata |
| 5 | DELETE | /metadata/[id] | Delete metadata |
| 6 | POST | /tags | Create tag |
| 7 | GET | /tags | List tags |
| 8 | GET | /tags/[id] | Get tag |
| 9 | PUT | /tags/[id] | Update tag |
| 10 | DELETE | /tags/[id] | Delete tag |
| 11 | POST | /tags/asset | Assign/remove tags |
| 12 | POST | /categories | Create category |
| 13 | GET | /categories | List categories |
| 14 | GET | /categories/[id] | Get category |
| 15 | PUT | /categories/[id] | Update category |
| 16 | DELETE | /categories/[id] | Delete category |
| 17 | POST | /classifications | Create classification |
| 18 | GET | /classifications | List classifications |
| 19 | GET | /classifications/[id] | Get classification |
| 20 | PUT | /classifications/[id] | Update classification |
| 21 | DELETE | /classifications/[id] | Delete classification |
| 22 | POST | /recognition | Create recognition |
| 23 | GET | /recognition | List recognitions |
| 24 | GET | /recognition/[id] | Get recognition |
| 25 | PUT | /recognition/[id] | Update recognition |
| 26 | DELETE | /recognition/[id] | Delete recognition |
| 27 | POST | /duplicates | Create duplicate record |
| 28 | GET | /duplicates | List duplicates |
| 29 | GET | /duplicates/[id] | Get duplicate |
| 30 | PUT | /duplicates/[id] | Update duplicate |
| 31 | DELETE | /duplicates/[id] | Delete duplicate |
| 32 | POST | /relationships | Create relationship |
| 33 | GET | /relationships | List relationships |
| 34 | GET | /relationships/[id] | Get relationship |
| 35 | PUT | /relationships/[id] | Update relationship |
| 36 | DELETE | /relationships/[id] | Delete relationship |
| 37 | POST | /quality | Create quality score |
| 38 | GET | /quality | List quality scores |
| 39 | GET | /quality/[id] | Get quality score |
| 40 | PUT | /quality/[id] | Update quality score |
| 41 | DELETE | /quality/[id] | Delete quality score |
| 42 | POST | /collections | Create collection |
| 43 | GET | /collections | List collections |
| 44 | GET | /collections/[id] | Get collection |
| 45 | PUT | /collections/[id] | Update collection |
| 46 | DELETE | /collections/[id] | Delete collection |
| 47 | POST | /collections/[id]/assets | Add/remove assets |
