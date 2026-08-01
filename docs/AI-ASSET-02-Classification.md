# Smart Asset Intelligence System - Classification

## Overview

The Classification Engine automatically categorizes assets across multiple dimensions including campaign, story, character, brand, platform, content type, media type, style, theme, and genre. It works alongside the Category System to provide hierarchical organization and the Tagging System for flat-label classification.

---

## Architecture

```
+---------------------+
|    Asset Metadata   |
+----------+----------+
           |
           v
+----------+----------+     +-------------------+
|  Classification     |<--->|  asset_category   |
|  Engine             |     |  (hierarchical)   |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+     +-------------------+
|  Confidence         |<--->|  asset_           |
|  Scorer             |     |  classification   |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+
|  Category Manager   |
| (CRUD, hierarchy,   |
|  ordering)          |
+---------------------+
```

---

## Table Schema: asset_classification

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`aclas`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Reference to asset |
| `project_id` | text | Yes | null | Associated project |
| `campaign` | varchar(200) | Yes | null | Campaign name |
| `story` | varchar(200) | Yes | null | Story/series name |
| `character` | varchar(200) | Yes | null | Character name |
| `brand` | varchar(200) | Yes | null | Brand name |
| `platform` | varchar(100) | Yes | null | Target platform |
| `content_type` | varchar(100) | Yes | null | Content type category |
| `media_type` | varchar(100) | Yes | null | Media format type |
| `style` | varchar(100) | Yes | null | Visual/content style |
| `theme` | varchar(100) | Yes | null | Thematic classification |
| `genre` | varchar(100) | Yes | null | Genre classification |
| `status` | varchar(50) | No | `active` | active, archived |
| `confidence` | integer | No | `0` | Classification confidence (0-100) |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

### Indexes

- `asset_class_user_idx` on `user_id` - User scoping
- `asset_class_asset_idx` on `asset_id` - Asset lookup
- `asset_class_project_idx` on `project_id` - Project scoping
- `asset_class_character_idx` on `character` - Character filtering
- `asset_class_brand_idx` on `brand` - Brand filtering

---

## Table Schema: asset_category

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`acat`) |
| `user_id` | text | No | - | Owner identifier |
| `name` | varchar(200) | No | - | Category name |
| `parent` | varchar(200) | Yes | null | Parent category name |
| `type` | varchar(100) | No | - | Category type |
| `description` | text | Yes | null | Category description |
| `icon` | varchar(100) | Yes | null | Icon identifier |
| `sort_order` | integer | No | `0` | Display ordering |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

### Indexes

- `asset_cat_user_idx` on `user_id` - User scoping
- `asset_cat_type_idx` on `type` - Type filtering

---

## Classification Dimensions

| Dimension | Field | Example Values | Description |
|-----------|-------|----------------|-------------|
| Campaign | `campaign` | "Summer Sale 2025", "Product Launch" | Marketing campaign association |
| Story | `story` | "Brand Story Episode 1", "Tutorial Series" | Narrative/series association |
| Character | `character` | "Hero Character", "Mascot" | Character within content |
| Brand | `brand` | "Acme Corp", "Partner Brand" | Brand identity |
| Platform | `platform` | "instagram", "youtube", "tiktok" | Target publishing platform |
| Content Type | `content_type` | "social_post", "ad", "tutorial" | Content purpose/type |
| Media Type | `media_type` | "photo", "video", "infographic" | Media format type |
| Style | `style` | "minimalist", "bold", "corporate" | Visual/content style |
| Theme | `theme` | "summer", "holiday", "tech" | Thematic classification |
| Genre | `genre` | "educational", "entertainment", "promotional" | Content genre |

---

## Auto-Classification Flow

```
Asset Uploaded/Updated
    |
    v
Metadata Analysis -> Extract keywords, colors, dimensions
    |
    v
AI Classification -> Analyze content with AI model
    |
    v
Rule Matching -> Apply user-defined classification rules
    |
    v
Confidence Scoring -> Score each classification dimension
    |
    v
Persist to asset_classification
    |
    v
Update Search Index
```

### Confidence Scoring

Each classification dimension receives a confidence score (0-100):

| Score Range | Confidence Level | Description |
|-------------|-----------------|-------------|
| 80-100 | High | Strong AI + rule agreement |
| 60-79 | Medium | Moderate confidence, may need review |
| 40-59 | Low | Weak signal, manual review recommended |
| 0-39 | Very Low | Minimal confidence, likely incorrect |

---

## Category Hierarchy

Categories support parent-child relationships for hierarchical organization:

```
Content Type (parent)
  +-- Social Post
  +-- Advertisement
  +-- Tutorial
  +-- Blog Post

Platform (parent)
  +-- Instagram
  |   +-- Feed Post
  |   +-- Story
  |   +-- Reel
  +-- YouTube
  |   +-- Short
  |   +-- Long Form
  +-- TikTok
```

---

## API Endpoints

### Classification CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/asset-intelligence/classifications` | Create classification |
| GET | `/api/asset-intelligence/classifications` | List classifications |
| PUT | `/api/asset-intelligence/classifications/[id]` | Update classification |
| DELETE | `/api/asset-intelligence/classifications/[id]` | Delete classification |

### Category CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/asset-intelligence/categories` | Create category |
| GET | `/api/asset-intelligence/categories` | List categories |
| PUT | `/api/asset-intelligence/categories/[id]` | Update category |
| DELETE | `/api/asset-intelligence/categories/[id]` | Delete category |

---

## User Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `auto_classification` | true | Enable automatic classification of new assets |

---

## Query Examples

### Find all assets in a campaign

```sql
SELECT am.*, ac.*
FROM asset_metadata am
JOIN asset_classification ac ON am.asset_id = ac.asset_id
WHERE ac.user_id = $1 AND ac.campaign = 'Summer Sale 2025';
```

### Find assets by brand and platform

```sql
SELECT am.*, ac.*
FROM asset_metadata am
JOIN asset_classification ac ON am.asset_id = ac.asset_id
WHERE ac.user_id = $1
  AND ac.brand = 'Acme Corp'
  AND ac.platform = 'instagram';
```

### Get classification distribution

```sql
SELECT platform, content_type, COUNT(*) as count
FROM asset_classification
WHERE user_id = $1
GROUP BY platform, content_type
ORDER BY count DESC;
```
