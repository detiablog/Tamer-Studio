# Smart Asset Intelligence System - Recognition

## Overview

The Recognition Engine detects and labels entities within assets including characters, brands, objects, text, logos, and other visual elements. Each recognition result includes the entity type, label, confidence score, and optional bounding box coordinates for spatial context.

---

## Architecture

```
+---------------------+
|    Asset Content    |
| (image, video frame)|
+----------+----------+
           |
           v
+----------+----------+
|  Recognition        |
|  Pipeline            |
| - object detection   |
| - character ID       |
| - brand detection    |
| - text extraction    |
| - logo detection     |
+----------+----------+
           |
           v
+----------+----------+     +-------------------+
|  Recognition        |<--->|  asset_recognition |
|  Service (CRUD)     |     |  table             |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+
|  Entity Aggregation |
| (group by type,     |
|  label, confidence) |
+---------------------+
```

---

## Table Schema: asset_recognition

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`arec`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Reference to asset |
| `recognition_type` | varchar(100) | No | - | Entity type category |
| `label` | varchar(200) | No | - | Detected entity label |
| `confidence` | integer | No | `0` | Detection confidence (0-100) |
| `bounding_box` | jsonb | Yes | null | Spatial coordinates |
| `metadata` | jsonb | No | `{}` | Additional detection data |
| `created_at` | timestamp | No | now() | Detection timestamp |

### Indexes

- `asset_recog_user_idx` on `user_id` - User scoping
- `asset_recog_asset_idx` on `asset_id` - Asset lookup
- `asset_recog_type_idx` on `recognition_type` - Type filtering

---

## Recognition Types

| Type | Label Examples | Description |
|------|----------------|-------------|
| `character` | "Hero Character", "Mascot", "Spokesperson" | Named characters in content |
| `brand` | "Acme Corp", "Partner Logo" | Brand identifiers and logos |
| `object` | "Car", "Laptop", "Building", "Nature" | Detected objects |
| `text` | "Sale 50%", "Call Now" | Extracted text elements |
| `logo` | "Company Logo", "Badge" | Logo detection |
| `face` | "Person 1", "Person 2" | Face detection |
| `scene` | "Office", "Outdoor", "Studio" | Scene classification |
| `color` | "Dominant Red", "Blue Accent" | Color-based recognition |
| `emotion` | "Happy", "Serious", "Excited" | Emotion detection |
| `watermark` | "Watermark Detected" | Watermark presence |

---

## Bounding Box Format

Bounding boxes are stored as JSON objects with normalized coordinates (0-1 range):

```json
{
  "x": 0.25,
  "y": 0.30,
  "width": 0.50,
  "height": 0.40
}
```

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `x` | number | 0-1 | Left edge (normalized) |
| `y` | number | 0-1 | Top edge (normalized) |
| `width` | number | 0-1 | Box width (normalized) |
| `height` | number | 0-1 | Box height (normalized) |

---

## Recognition Pipeline

### Image Processing

```
Image Asset
    |
    v
Object Detection -> Detect objects, scenes, colors
    |
    v
Character Detection -> Identify known characters
    |
    v
Brand/Logo Detection -> Match brand identifiers
    |
    v
Text Extraction (OCR) -> Extract text elements
    |
    v
Emotion Analysis -> Classify emotional tone
    |
    v
Store Results -> asset_recognition
```

### Video Processing

```
Video Asset
    |
    v
Frame Sampling -> Extract key frames
    |
    v
Per-Frame Recognition -> Run detection on each frame
    |
    v
Temporal Aggregation -> Merge results across frames
    |
    v
Confidence Weighting -> Weight by frequency and confidence
    |
    v
Store Results -> asset_recognition
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/asset-intelligence/recognition` | Create recognition result |
| GET | `/api/asset-intelligence/recognition` | List recognition results |
| GET | `/api/asset-intelligence/recognition/[id]` | Get single result |
| PUT | `/api/asset-intelligence/recognition/[id]` | Update result |
| DELETE | `/api/asset-intelligence/recognition/[id]` | Delete result |

### Query Parameters

- `page` (number, default 1)
- `limit` (number, default 20, max 100)
- `assetId` (string, optional) - Filter by asset
- `recognitionType` (string, optional) - Filter by type (character, brand, object, etc.)
- `minConfidence` (number, optional) - Minimum confidence threshold

---

## Integration with Classification

Recognition results feed into the Classification Engine:

1. **Character Recognition** -> Populates `classification.character` field
2. **Brand Recognition** -> Populates `classification.brand` field
3. **Scene Recognition** -> Informs `classification.style` and `classification.theme`
4. **Text Extraction** -> Provides keywords for search indexing

---

## Integration with Relationship Engine

Recognized entities help establish asset relationships:

- Same characters detected in multiple assets -> `character_continuation` relationship
- Same brand logos detected -> `brand_variant` relationship
- Similar objects/scenes -> `visual_similarity` relationship

---

## Confidence Thresholds

| Threshold | Action |
|-----------|--------|
| 80-100 | Auto-apply classification, high-weight relationship |
| 60-79 | Suggest classification, medium-weight relationship |
| 40-59 | Queue for manual review |
| 0-39 | Discard or log only |

---

## Query Examples

### Find assets containing a specific character

```sql
SELECT am.*, ar.label, ar.confidence
FROM asset_metadata am
JOIN asset_recognition ar ON am.asset_id = ar.asset_id
WHERE ar.user_id = $1
  AND ar.recognition_type = 'character'
  AND ar.label = 'Hero Character'
ORDER BY ar.confidence DESC;
```

### Get recognition summary per asset

```sql
SELECT
  asset_id,
  recognition_type,
  COUNT(*) as entity_count,
  AVG(confidence) as avg_confidence
FROM asset_recognition
WHERE user_id = $1
GROUP BY asset_id, recognition_type;
```

### Find assets with detected brands

```sql
SELECT DISTINCT am.*, ar.label as brand_label
FROM asset_metadata am
JOIN asset_recognition ar ON am.asset_id = ar.asset_id
WHERE ar.user_id = $1 AND ar.recognition_type = 'brand';
```
