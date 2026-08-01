# Smart Asset Intelligence System - Relationship Engine

## Overview

The Relationship Engine discovers, creates, and manages relationships between assets. Relationships connect assets that are semantically, visually, or contextually related, enabling users to navigate asset collections through associative links. Each relationship includes a type classification and a strength score indicating the strength of the connection.

---

## Architecture

```
+---------------------+
|  Asset Metadata     |
|  Recognition Data   |
|  Classification Data|
+----------+----------+
           |
           v
+----------+----------+
|  Relationship       |
|  Discovery Engine   |
| - same character    |
| - same brand        |
| - visual similarity |
| - same project      |
| - same campaign     |
+----------+----------+
           |
           v
+----------+----------+     +--------------------+
|  Relationship       |<--->|  asset_relationship|
|  Service (CRUD)     |     |  table             |
+----------+----------+     +--------------------+
           |
           v
+----------+----------+
|  Strength Scorer    |
| (weighted scoring   |
|  per relationship)  |
+---------------------+
           |
           v
+----------+----------+
|  Relationship       |
|  Graph              |
| (navigate, explore) |
+---------------------+
```

---

## Table Schema: asset_relationship

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`arel`) |
| `user_id` | text | No | - | Owner identifier |
| `source_asset_id` | text | No | - | Source asset reference |
| `target_asset_id` | text | No | - | Target asset reference |
| `relationship_type` | varchar(100) | No | - | Type of relationship |
| `strength` | integer | No | `50` | Relationship strength (0-100) |
| `metadata` | jsonb | No | `{}` | Additional relationship data |
| `created_at` | timestamp | No | now() | Creation timestamp |

### Indexes

- `asset_rel_user_idx` on `user_id` - User scoping
- `asset_rel_source_idx` on `source_asset_id` - Source lookup
- `asset_rel_target_idx` on `target_asset_id` - Target lookup
- `asset_rel_type_idx` on `relationship_type` - Type filtering

### Unique Constraint

- `asset_rel_unique` on (`source_asset_id`, `target_asset_id`, `relationship_type`) - Prevents duplicate relationships of the same type between two assets

---

## Relationship Types

| Type | Description | Auto-Discovery |
|------|-------------|----------------|
| `character_continuation` | Assets featuring the same character | Yes |
| `brand_variant` | Assets from the same brand campaign | Yes |
| `visual_similarity` | Visually similar assets | Yes |
| `same_project` | Assets from the same project | Yes |
| `same_campaign` | Assets from the same campaign | Yes |
| `same_story` | Assets from the same story/series | Yes |
| `same_style` | Assets with matching visual style | Yes |
| `same_platform` | Assets targeting the same platform | Yes |
| `sequential` | Assets in a sequence (e.g., storyboards) | Yes |
| `thumbnail_of` | Thumbnail derived from a source asset | Yes |
| `variant_of` | Variant/derivative of another asset | Manual |
| `related_to` | General association | Manual |

---

## Strength Scoring

Each relationship has a strength score (0-100) indicating how strong the connection is:

| Score Range | Strength Level | Description |
|-------------|----------------|-------------|
| 80-100 | Strong | High confidence, multiple matching signals |
| 60-79 | Moderate | Good confidence, few matching signals |
| 40-59 | Weak | Low confidence, single matching signal |
| 0-39 | Very Weak | Minimal connection, likely irrelevant |

### Strength Calculation

```
base_score = 50 (default)

+ character_match:     +20
+ brand_match:         +15
+ project_match:       +10
+ campaign_match:      +10
+ style_match:         +10
+ visual_similarity:   +15 (scaled by similarity score)
+ sequential_order:    +10

capped at 100
```

---

## Auto-Discovery Flow

```
Asset Created/Updated
    |
    v
Scan Existing Assets -> Find potential matches
    |
    v
Character Matching -> Compare recognized characters
    |
    v
Brand Matching -> Compare recognized brands
    |
    v
Visual Similarity -> Compare color palettes, dimensions, composition
    |
    v
Context Matching -> Compare project, campaign, story, style
    |
    v
Score Relationships -> Calculate strength scores
    |
    v
Persist Relationships -> asset_relationship (with unique constraint)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/asset-intelligence/relationships` | Create relationship |
| GET | `/api/asset-intelligence/relationships` | List relationships |
| GET | `/api/asset-intelligence/relationships/[id]` | Get single relationship |
| PUT | `/api/asset-intelligence/relationships/[id]` | Update relationship |
| DELETE | `/api/asset-intelligence/relationships/[id]` | Delete relationship |

### Query Parameters

- `page` (number, default 1)
- `limit` (number, default 20, max 100)
- `sourceAssetId` (string, optional) - Filter by source asset
- `targetAssetId` (string, optional) - Filter by target asset
- `relationshipType` (string, optional) - Filter by type
- `minStrength` (number, optional) - Minimum strength threshold

---

## Bidirectional Relationships

Relationships are stored as directional (source -> target) but can be queried bidirectionally:

```sql
-- Find all relationships involving asset X (as source or target)
SELECT * FROM asset_relationship
WHERE user_id = $1
  AND (source_asset_id = $2 OR target_asset_id = $2);
```

---

## User Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `auto_relationships` | true | Enable automatic relationship discovery |

---

## Query Examples

### Get top related assets for a given asset

```sql
SELECT
  ar.*,
  am.title,
  am.asset_type,
  am.dominant_colors
FROM asset_relationship ar
JOIN asset_metadata am ON ar.target_asset_id = am.asset_id
WHERE ar.user_id = $1 AND ar.source_asset_id = $2
ORDER BY ar.strength DESC
LIMIT 10;
```

### Find all character continuation chains

```sql
SELECT
  ar.source_asset_id,
  ar.target_asset_id,
  ar.strength
FROM asset_relationship ar
WHERE ar.user_id = $1
  AND ar.relationship_type = 'character_continuation'
ORDER BY ar.strength DESC;
```

### Get relationship distribution by type

```sql
SELECT
  relationship_type,
  COUNT(*) as count,
  AVG(strength) as avg_strength
FROM asset_relationship
WHERE user_id = $1
GROUP BY relationship_type
ORDER BY count DESC;
```
