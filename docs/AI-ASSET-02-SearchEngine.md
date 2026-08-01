# Smart Asset Intelligence System - Search Engine

## Overview

The Search Engine provides fast, full-text search and filtered queries across the asset library. It maintains a search index that is automatically updated when asset metadata, tags, categories, or classifications change. The search supports text queries, tag-based filtering, category filtering, asset type filtering, and quality-based ranking.

---

## Architecture

```
+---------------------+
|  Asset Changes      |
| (metadata, tags,    |
|  categories)        |
+----------+----------+
           |
           v
+----------+----------+
|  Index Builder      |
| (assemble search    |
|  text, update index)|
+----------+----------+
           |
           v
+----------+----------+     +---------------------+
|  Search Service     |<--->|  asset_search_index  |
|  (query, filter)    |     |  table               |
+----------+----------+     +---------------------+
           |
           v
+----------+----------+
|  Result Ranking     |
| (relevance +        |
|  quality score)     |
+----------+----------+
           |
           v
+----------+----------+
|  Filtered Results   |
| (paginated, sorted) |
+---------------------+
```

---

## Table Schema: asset_search_index

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`asidx`) |
| `user_id` | text | No | - | Owner identifier |
| `asset_id` | text | No | - | Reference to asset |
| `search_text` | text | No | - | Aggregated searchable text |
| `tags` | jsonb | No | `[]` | Associated tag names |
| `categories` | jsonb | No | `[]` | Associated category names |
| `metadata` | jsonb | No | `{}` | Additional index data |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

### Indexes

- `asset_search_user_idx` on `user_id` - User scoping
- `asset_search_asset_idx` on `asset_id` - Asset lookup
- `asset_search_text_idx` on `search_text` - Full-text search

---

## Search Text Assembly

The search index aggregates text from multiple sources into a single `search_text` field:

```
search_text = [
  title,
  description,
  tag_names[],
  category_names[],
  classification.campaign,
  classification.story,
  classification.character,
  classification.brand,
  recognition_labels[],
  asset_type
].join(' ')
```

### Example

Given an asset with:
- Title: "Summer Campaign Hero Image"
- Description: "Main hero image for the summer sale campaign"
- Tags: ["summer", "hero", "sale", "campaign"]
- Categories: ["Marketing", "Social Media"]
- Classification: campaign="Summer Sale", brand="Acme Corp"
- Type: "image"

The search text becomes:
```
"Summer Campaign Hero Image Main hero image for the summer sale
campaign summer hero sale campaign Marketing Social Media
Summer Sale Acme Corp image"
```

---

## Search Capabilities

### Full-Text Search

PostgreSQL `ts_vector` and `ts_query` for fast text matching:

```sql
SELECT * FROM asset_search_index
WHERE user_id = $1
  AND to_tsvector('english', search_text) @@ plainto_tsquery('english', $2);
```

### Tag Filtering

Filter results by one or more tags:

```sql
SELECT asi.*, am.*
FROM asset_search_index asi
JOIN asset_metadata am ON asi.asset_id = am.asset_id
WHERE asi.user_id = $1
  AND asi.tags @> '["summer", "hero"]';
```

### Category Filtering

Filter results by category membership:

```sql
SELECT asi.*, am.*
FROM asset_search_index asi
JOIN asset_metadata am ON asi.asset_id = am.asset_id
WHERE asi.user_id = $1
  AND asi.categories @> '["Marketing"]';
```

### Asset Type Filtering

Filter by asset type using the metadata join:

```sql
SELECT asi.*, am.*
FROM asset_search_index asi
JOIN asset_metadata am ON asi.asset_id = am.asset_id
WHERE asi.user_id = $1 AND am.asset_type = 'image';
```

### Quality-Based Ranking

Results can be ranked by quality score:

```sql
SELECT asi.*, am.*, aqs.overall_score
FROM asset_search_index asi
JOIN asset_metadata am ON asi.asset_id = am.asset_id
LEFT JOIN asset_quality_score aqs ON asi.asset_id = aqs.asset_id
WHERE asi.user_id = $1
ORDER BY aqs.overall_score DESC NULLS LAST;
```

---

## Search API

### GET /api/assets/search

Search assets with full-text query and filters.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | - | Full-text search query |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page (max 100) |
| `assetType` | string | - | Filter by asset type |
| `tags` | string | - | Comma-separated tag names |
| `categories` | string | - | Comma-separated category names |
| `projectId` | string | - | Filter by project |
| `minQuality` | number | - | Minimum quality score |
| `sortBy` | string | `relevance` | Sort by: relevance, quality, created, updated |

**Response:**
```json
{
  "success": true,
  "data": {
    "assets": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Index Rebuild

The search index can be manually rebuilt to ensure consistency:

### POST /api/asset-intelligence/search/rebuild

Triggers a full index rebuild for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "indexed": 1250,
    "duration": "3.2s"
  }
}
```

### Automatic Rebuild Triggers

The index is automatically updated when:

| Event | Trigger |
|-------|---------|
| Metadata Created | New asset uploaded |
| Metadata Updated | Asset details changed |
| Tag Added/Removed | Tag assignment changes |
| Category Added/Removed | Category assignment changes |
| Classification Updated | Auto-classification runs |
| Recognition Complete | Entity recognition finishes |

---

## Performance Optimization

### Index Statistics

```sql
SELECT
  COUNT(*) as total_indexed,
  AVG(LENGTH(search_text)) as avg_text_length,
  MAX(updated_at) as last_update
FROM asset_search_index
WHERE user_id = $1;
```

### Query Performance

- Full-text search uses GIN index on `ts_vector`
- Tag/category queries use JSONB containment operators with GIN indexes
- User scoping via B-tree index on `user_id`
- Pagination uses efficient offset/limit with indexed ordering

---

## Search Quality Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Recall | >90% | Relevant assets returned |
| Precision | >80% | Returned assets are relevant |
| Latency | <200ms | P95 query response time |
| Index Freshness | <5s | Time from change to searchable |
