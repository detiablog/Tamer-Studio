# Smart Asset Intelligence System - Metadata Engine

## Overview

The Metadata Engine is the foundational component of the Smart Asset Intelligence system. It extracts, stores, and manages comprehensive metadata for every asset in the platform. Metadata serves as the primary data source for all downstream intelligence features including classification, tagging, search, quality scoring, and relationship detection.

---

## Architecture

```
+---------------------+
|    Asset Upload     |
+----------+----------+
           |
           v
+----------+----------+
|  Metadata Extractor |
| - dimensions        |
| - format detection  |
| - color extraction  |
| - duration parsing  |
| - file size         |
+----------+----------+
           |
           v
+----------+----------+     +-------------------+
|  Metadata Service   |<--->|  asset_metadata   |
|  (CRUD + search)    |     |  table            |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+
|  Search Indexer     |
| (auto-index on      |
|  metadata change)   |
+---------------------+
```

---

## Table Schema: asset_metadata

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`ameta`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Reference to asset |
| `asset_type` | varchar(50) | No | - | image, video, storyboard, script, caption, thumbnail, audio, reference |
| `title` | varchar(500) | Yes | null | Human-readable title |
| `description` | text | Yes | null | Detailed description |
| `width` | integer | Yes | null | Pixel width |
| `height` | integer | Yes | null | Pixel height |
| `duration` | integer | Yes | null | Duration in seconds |
| `aspect_ratio` | varchar(50) | Yes | null | Aspect ratio string |
| `file_size` | integer | Yes | null | File size in bytes |
| `format` | varchar(50) | Yes | null | File format |
| `language` | varchar(10) | Yes | null | Language code |
| `dominant_colors` | jsonb | No | `[]` | Top 5 dominant colors |
| `color_palette` | jsonb | No | `[]` | Extended color palette |
| `project_id` | text | Yes | null | Associated project |
| `prompt_reference` | text | Yes | null | AI prompt used for generation |
| `workflow_reference` | text | Yes | null | Workflow that produced this asset |
| `publishing_reference` | text | Yes | null | Publishing record reference |
| `ai_model` | varchar(200) | Yes | null | AI model used |
| `provider` | varchar(100) | Yes | null | AI provider name |
| `generation_metadata` | jsonb | No | `{}` | Generation parameters and context |
| `extraction_status` | varchar(50) | No | `pending` | pending, completed, failed |
| `metadata` | jsonb | No | `{}` | Additional extensible metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

### Indexes

- `asset_meta_user_idx` on `user_id` - User scoping
- `asset_meta_asset_idx` on `asset_id` - Asset lookup
- `asset_meta_type_idx` on `asset_type` - Type filtering
- `asset_meta_project_idx` on `project_id` - Project scoping
- `asset_meta_extraction_idx` on `extraction_status` - Status queries

---

## Metadata Fields by Asset Type

### Image Assets

| Field | Extracted | Description |
|-------|-----------|-------------|
| width | Yes | Image width in pixels |
| height | Yes | Image height in pixels |
| aspect_ratio | Yes | Calculated from width/height |
| file_size | Yes | File size in bytes |
| format | Yes | JPEG, PNG, WebP, etc. |
| dominant_colors | Yes | Top 5 extracted colors |
| color_palette | Yes | Extended color analysis |

### Video Assets

| Field | Extracted | Description |
|-------|-----------|-------------|
| width | Yes | Video width in pixels |
| height | Yes | Video height in pixels |
| duration | Yes | Total duration in seconds |
| aspect_ratio | Yes | Video aspect ratio |
| file_size | Yes | File size in bytes |
| format | Yes | MP4, MOV, WebM, etc. |

### Audio Assets

| Field | Extracted | Description |
|-------|-----------|-------------|
| duration | Yes | Audio duration in seconds |
| file_size | Yes | File size in bytes |
| format | Yes | MP3, WAV, OGG, etc. |

### Text Assets (Script, Caption)

| Field | Extracted | Description |
|-------|-----------|-------------|
| language | Yes | Detected language |
| file_size | Yes | File size in bytes |
| format | Yes | TXT, SRT, VTT, etc. |

---

## API Endpoints

### POST /api/asset-intelligence/metadata

Create metadata for an asset.

**Request Body:**
```json
{
  "assetId": "a1b2c3",
  "assetType": "image",
  "title": "Hero Banner",
  "description": "Main landing page hero",
  "width": 1920,
  "height": 1080,
  "aspectRatio": "16:9",
  "fileSize": 2048000,
  "format": "jpeg",
  "dominantColors": ["#FF5733", "#33FF57", "#3357FF"],
  "projectId": "proj_123"
}
```

**Response:** 201 Created with created metadata object.

### GET /api/asset-intelligence/metadata

List metadata for the authenticated user.

**Query Parameters:**
- `page` (number, default 1)
- `limit` (number, default 20, max 100)
- `assetType` (string, optional) - Filter by asset type
- `projectId` (string, optional) - Filter by project
- `extractionStatus` (string, optional) - Filter by status

### GET /api/asset-intelligence/metadata/[id]

Get a single metadata record by ID.

### PUT /api/asset-intelligence/metadata/[id]

Update metadata fields.

### DELETE /api/asset-intelligence/metadata/[id]

Delete a metadata record.

---

## Extraction Status Workflow

```
pending -> completed (successful extraction)
pending -> failed (extraction error, retry available)
failed -> pending (manual retry)
completed -> pending (re-extraction requested)
```

---

## Color Extraction

The metadata engine extracts dominant colors from image assets using AI-powered analysis:

1. **Sampling**: Image is sampled at multiple scales
2. **Clustering**: Colors are grouped using k-means clustering
3. **Ranking**: Colors are ranked by pixel coverage
4. **Storage**: Top 5 colors stored in `dominant_colors`, extended palette in `color_palette`

**Example Output:**
```json
{
  "dominantColors": ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB", "#2ECC71"],
  "colorPalette": ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB", "#2ECC71", "#9B59B6", "#F39C12"]
}
```

---

## Search Index Integration

When metadata is created or updated, the search index is automatically rebuilt:

1. Metadata change triggers index update
2. Search text is assembled from title, description, tags, categories, and metadata fields
3. Index entry is created or updated in `asset_search_index`
4. Full-text search vectors are regenerated

---

## Quality Metrics

Metadata quality is assessed based on field completeness:

| Metric | Weight | Description |
|--------|--------|-------------|
| Title Present | 15% | Has a non-empty title |
| Description Present | 15% | Has a non-empty description |
| Dimensions Present | 10% | Width and height are set |
| Format Detected | 10% | File format is identified |
| Colors Extracted | 10% | Dominant colors are available |
| Project Linked | 10% | Associated with a project |
| AI Model Recorded | 10% | Generation context is captured |
| Language Detected | 10% | Language is identified (for text assets) |
| Duration Recorded | 10% | Duration is captured (for audio/video) |

---

## Configuration

User-level metadata settings are managed through the `asset_settings` table:

| Setting | Default | Description |
|---------|---------|-------------|
| `auto_indexing` | true | Automatically index metadata changes |
| `quality_scoring` | true | Auto-score quality on metadata creation |
