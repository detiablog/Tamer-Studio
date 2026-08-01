# Smart Asset Intelligence System - Database Design

## Overview

The Smart Asset Intelligence system uses 11 PostgreSQL tables managed via Drizzle ORM. All tables are user-scoped via a `userId` column. No cross-table foreign keys are used (denormalized for query performance). JSONB columns provide flexible nested data structures.

**Schema File**: `src/lib/db/schema/asset-intelligence.ts`

---

## Table Schemas

### 1. asset_metadata

Core metadata store for all assets.

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
| `prompt_reference` | text | Yes | null | AI prompt reference |
| `workflow_reference` | text | Yes | null | Workflow reference |
| `publishing_reference` | text | Yes | null | Publishing reference |
| `ai_model` | varchar(200) | Yes | null | AI model used |
| `provider` | varchar(100) | Yes | null | AI provider |
| `generation_metadata` | jsonb | No | `{}` | Generation parameters |
| `extraction_status` | varchar(50) | No | `pending` | pending, completed, failed |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**: `user_id`, `asset_id`, `asset_type`, `project_id`, `extraction_status`

---

### 2. asset_tag

Tag definitions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`atag`) |
| `user_id` | text | No | - | Owner identifier |
| `name` | varchar(200) | No | - | Tag name |
| `category` | varchar(100) | Yes | null | Tag category |
| `is_system` | boolean | No | `false` | System-generated tag |
| `use_count` | integer | No | `0` | Number of assignments |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Indexes**: `user_id`, `name`
**Unique**: (`user_id`, `name`)

---

### 3. asset_tag_assignment

Links tags to assets.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`ataa`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Asset reference |
| `tag_id` | text | No | - | Tag reference |
| `is_auto` | boolean | No | `true` | Auto-assigned tag |
| `is_locked` | boolean | No | `false` | Locked (not auto-removable) |
| `created_at` | timestamp | No | now() | Assignment timestamp |

**Indexes**: `user_id`, `asset_id`, `tag_id`
**Unique**: (`asset_id`, `tag_id`)

---

### 4. asset_category

Hierarchical category definitions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`acat`) |
| `user_id` | text | No | - | Owner identifier |
| `name` | varchar(200) | No | - | Category name |
| `parent` | varchar(200) | Yes | null | Parent category name |
| `type` | varchar(100) | No | - | Category type |
| `description` | text | Yes | null | Description |
| `icon` | varchar(100) | Yes | null | Icon identifier |
| `sort_order` | integer | No | `0` | Display order |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**: `user_id`, `type`

---

### 5. asset_classification

Multi-dimensional asset classification.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`aclas`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Asset reference |
| `project_id` | text | Yes | null | Project reference |
| `campaign` | varchar(200) | Yes | null | Campaign name |
| `story` | varchar(200) | Yes | null | Story name |
| `character` | varchar(200) | Yes | null | Character name |
| `brand` | varchar(200) | Yes | null | Brand name |
| `platform` | varchar(100) | Yes | null | Target platform |
| `content_type` | varchar(100) | Yes | null | Content type |
| `media_type` | varchar(100) | Yes | null | Media type |
| `style` | varchar(100) | Yes | null | Style |
| `theme` | varchar(100) | Yes | null | Theme |
| `genre` | varchar(100) | Yes | null | Genre |
| `status` | varchar(50) | No | `active` | active, archived |
| `confidence` | integer | No | `0` | Confidence (0-100) |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**: `user_id`, `asset_id`, `project_id`, `character`, `brand`

---

### 6. asset_recognition

Entity recognition results.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`arec`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Asset reference |
| `recognition_type` | varchar(100) | No | - | Entity type |
| `label` | varchar(200) | No | - | Entity label |
| `confidence` | integer | No | `0` | Confidence (0-100) |
| `bounding_box` | jsonb | Yes | null | Spatial coordinates |
| `metadata` | jsonb | No | `{}` | Additional data |
| `created_at` | timestamp | No | now() | Detection timestamp |

**Indexes**: `user_id`, `asset_id`, `recognition_type`

---

### 7. asset_duplicate

Duplicate detection records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`adup`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Primary asset |
| `duplicate_asset_id` | text | No | - | Duplicate asset |
| `match_type` | varchar(100) | No | - | exact, near_duplicate, similar_composition |
| `similarity_score` | integer | No | - | Similarity (0-100) |
| `status` | varchar(50) | No | `detected` | detected, resolved, ignored |
| `metadata` | jsonb | No | `{}` | Additional data |
| `created_at` | timestamp | No | now() | Detection timestamp |

**Indexes**: `user_id`, `asset_id`, `duplicate_asset_id`, `status`

---

### 8. asset_relationship

Asset-to-asset relationships.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`arel`) |
| `user_id` | text | No | - | Owner identifier |
| `source_asset_id` | text | No | - | Source asset |
| `target_asset_id` | text | No | - | Target asset |
| `relationship_type` | varchar(100) | No | - | Relationship type |
| `strength` | integer | No | `50` | Strength (0-100) |
| `metadata` | jsonb | No | `{}` | Additional data |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Indexes**: `user_id`, `source_asset_id`, `target_asset_id`, `relationship_type`
**Unique**: (`source_asset_id`, `target_asset_id`, `relationship_type`)

---

### 9. asset_quality_score

Quality assessment scores.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`aqty`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Asset reference |
| `resolution` | integer | No | `0` | Resolution score |
| `sharpness` | integer | No | `0` | Sharpness score |
| `composition` | integer | No | `0` | Composition score |
| `lighting` | integer | No | `0` | Lighting score |
| `brand_consistency` | integer | No | `0` | Brand consistency score |
| `technical_quality` | integer | No | `0` | Technical quality score |
| `overall_score` | integer | No | `0` | Overall score |
| `metadata` | jsonb | No | `{}` | Additional data |
| `created_at` | timestamp | No | now() | Scoring timestamp |

**Indexes**: `user_id`, `asset_id`, `overall_score`

---

### 10. asset_collection

Asset collections (manual and auto).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`acol`) |
| `user_id` | text | No | - | Owner identifier |
| `name` | varchar(200) | No | - | Collection name |
| `description` | text | Yes | null | Description |
| `type` | varchar(100) | No | `manual` | manual, auto |
| `color` | varchar(50) | Yes | null | Display color |
| `is_pinned` | boolean | No | `false` | Pinned flag |
| `is_auto` | boolean | No | `false` | Auto-populated |
| `rules` | jsonb | No | `{}` | Auto-collection rules |
| `asset_count` | integer | No | `0` | Number of assets |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**: `user_id`, `type`

---

### 11. asset_collection_item

Collection membership.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`acit`) |
| `collection_id` | text | No | - | Collection reference |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Asset reference |
| `position` | integer | No | `0` | Sort position |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Addition timestamp |

**Indexes**: `collection_id`, `asset_id`
**Unique**: (`collection_id`, `asset_id`)

---

### 12. asset_search_index

Full-text search index.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`asidx`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Asset reference |
| `search_text` | text | No | - | Aggregated searchable text |
| `tags` | jsonb | No | `[]` | Tag names |
| `categories` | jsonb | No | `[]` | Category names |
| `metadata` | jsonb | No | `{}` | Additional index data |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**: `user_id`, `asset_id`, `search_text`

---

### 13. asset_settings

User-level intelligence settings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`aset`) |
| `user_id` | text | No | unique | Owner identifier |
| `auto_tagging` | boolean | No | `true` | Auto-tagging enabled |
| `auto_classification` | boolean | No | `true` | Auto-classification enabled |
| `duplicate_detection` | boolean | No | `true` | Duplicate detection enabled |
| `quality_scoring` | boolean | No | `true` | Quality scoring enabled |
| `auto_relationships` | boolean | No | `true` | Auto-relationships enabled |
| `auto_indexing` | boolean | No | `true` | Auto-indexing enabled |
| `min_quality_score` | integer | No | `50` | Minimum quality threshold |
| `metadata` | jsonb | No | `{}` | Additional settings |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Unique**: `user_id`

---

## Entity Relationship Diagram

```
asset_metadata (1) ---< (N) asset_tag_assignment >--- (1) asset_tag
      |
      +---< (N) asset_classification
      |
      +---< (N) asset_recognition
      |
      +---< (N) asset_duplicate (self-referencing)
      |
      +---< (N) asset_relationship (self-referencing)
      |
      +---< (1) asset_quality_score
      |
      +---< (N) asset_collection_item >--- (1) asset_collection
      |
      +---< (1) asset_search_index

asset_settings (1:1 per user)
asset_category (hierarchical, self-referencing via parent)
```

---

## ID Prefix Reference

| Table | Prefix | Example |
|-------|--------|---------|
| asset_metadata | `ameta` | `ameta_a1b2c3d4` |
| asset_tag | `atag` | `atag_e5f6g7h8` |
| asset_tag_assignment | `ataa` | `ataa_i9j0k1l2` |
| asset_category | `acat` | `acat_m3n4o5p6` |
| asset_classification | `aclas` | `aclas_q7r8s9t0` |
| asset_recognition | `arec` | `arec_u1v2w3x4` |
| asset_duplicate | `adup` | `adup_y5z6a7b8` |
| asset_relationship | `arel` | `arel_c9d0e1f2` |
| asset_quality_score | `aqty` | `aqty_g3h4i5j6` |
| asset_collection | `acol` | `acol_k7l8m9n0` |
| asset_collection_item | `acit` | `acit_o1p2q3r4` |
| asset_search_index | `asidx` | `asidx_s5t6u7v8` |
| asset_settings | `aset` | `aset_w9x0y1z2` |
