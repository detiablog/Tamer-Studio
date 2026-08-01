# Smart Asset Intelligence System - Performance

## Overview

The Smart Asset Intelligence system is optimized for fast queries, efficient indexing, and scalable storage. Performance targets are defined for query latency, index freshness, and concurrent user support.

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (P95) | <200ms | All read endpoints |
| Search Query Latency (P95) | <150ms | Full-text search |
| Index Update Latency | <5s | Metadata change to searchable |
| Duplicate Detection (P95) | <500ms | Per-asset detection |
| Quality Scoring (P95) | <300ms | Per-asset scoring |
| Concurrent Users | 100+ | Per workspace |
| Total Assets per User | 10,000+ | Without degradation |

---

## Database Optimization

### Indexing Strategy

Every query pattern has a corresponding index:

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| asset_metadata | `asset_meta_user_idx` | `user_id` | User scoping |
| asset_metadata | `asset_meta_asset_idx` | `asset_id` | Asset lookup |
| asset_metadata | `asset_meta_type_idx` | `asset_type` | Type filtering |
| asset_metadata | `asset_meta_project_idx` | `project_id` | Project scoping |
| asset_metadata | `asset_meta_extraction_idx` | `extraction_status` | Status queries |
| asset_tag | `asset_tag_user_idx` | `user_id` | User scoping |
| asset_tag | `asset_tag_name_idx` | `name` | Name lookup |
| asset_tag_assignment | `asset_tag_assign_asset_idx` | `asset_id` | Asset tag lookup |
| asset_tag_assignment | `asset_tag_assign_tag_idx` | `tag_id` | Tag usage lookup |
| asset_category | `asset_cat_user_idx` | `user_id` | User scoping |
| asset_category | `asset_cat_type_idx` | `type` | Type filtering |
| asset_classification | `asset_class_user_idx` | `user_id` | User scoping |
| asset_classification | `asset_class_asset_idx` | `asset_id` | Asset lookup |
| asset_classification | `asset_class_project_idx` | `project_id` | Project filtering |
| asset_classification | `asset_class_character_idx` | `character` | Character filtering |
| asset_classification | `asset_class_brand_idx` | `brand` | Brand filtering |
| asset_recognition | `asset_recog_user_idx` | `user_id` | User scoping |
| asset_recognition | `asset_recog_asset_idx` | `asset_id` | Asset lookup |
| asset_recognition | `asset_recog_type_idx` | `recognition_type` | Type filtering |
| asset_duplicate | `asset_dup_user_idx` | `user_id` | User scoping |
| asset_duplicate | `asset_dup_asset_idx` | `asset_id` | Asset lookup |
| asset_duplicate | `asset_dup_status_idx` | `status` | Status filtering |
| asset_relationship | `asset_rel_user_idx` | `user_id` | User scoping |
| asset_relationship | `asset_rel_source_idx` | `source_asset_id` | Source lookup |
| asset_relationship | `asset_rel_target_idx` | `target_asset_id` | Target lookup |
| asset_relationship | `asset_rel_type_idx` | `relationship_type` | Type filtering |
| asset_quality_score | `asset_quality_user_idx` | `user_id` | User scoping |
| asset_quality_score | `asset_quality_asset_idx` | `asset_id` | Asset lookup |
| asset_quality_score | `asset_quality_score_idx` | `overall_score` | Score ranking |
| asset_collection | `asset_coll_user_idx` | `user_id` | User scoping |
| asset_collection | `asset_coll_type_idx` | `type` | Type filtering |
| asset_collection_item | `asset_coll_item_coll_idx` | `collection_id` | Collection items |
| asset_collection_item | `asset_coll_item_asset_idx` | `asset_id` | Asset lookup |
| asset_search_index | `asset_search_user_idx` | `user_id` | User scoping |
| asset_search_index | `asset_search_asset_idx` | `asset_id` | Asset lookup |
| asset_search_index | `asset_search_text_idx` | `search_text` | Full-text search |

### Unique Constraints

| Table | Columns | Purpose |
|-------|---------|---------|
| asset_tag | (`user_id`, `name`) | Prevent duplicate tag names per user |
| asset_tag_assignment | (`asset_id`, `tag_id`) | Prevent duplicate assignments |
| asset_relationship | (`source_asset_id`, `target_asset_id`, `relationship_type`) | Prevent duplicate relationships |
| asset_collection_item | (`collection_id`, `asset_id`) | Prevent duplicate collection items |
| asset_settings | (`user_id`) | One settings record per user |

---

## Query Optimization

### Pagination

All list endpoints use efficient offset/limit pagination:

```sql
-- Efficient pagination with indexed ordering
SELECT * FROM asset_metadata
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### JSONB Queries

JSONB containment queries use GIN indexes for fast filtering:

```sql
-- Tag filtering with GIN index
SELECT * FROM asset_search_index
WHERE user_id = $1 AND tags @> '["summer"]';
```

### Joins

Minimal joins are used. When joins are necessary, they use indexed columns:

```sql
-- Join on indexed columns only
SELECT am.*, aqs.overall_score
FROM asset_metadata am
LEFT JOIN asset_quality_score aqs ON am.asset_id = aqs.asset_id
WHERE am.user_id = $1;
```

---

## Caching Strategy

### Cache Layers

| Layer | TTL | Scope | Description |
|-------|-----|-------|-------------|
| Search Results | 5 minutes | Per user | Cached search responses |
| Recommendations | 5 minutes | Per user | Cached recommendation results |
| Dashboard Stats | 5 minutes | Per user | Aggregated dashboard data |
| Tag Suggestions | 15 minutes | Per user | Tag recommendation cache |
| Category Suggestions | 30 minutes | Per user | Category recommendation cache |

### Cache Invalidation

| Event | Cache Invalidated |
|-------|-------------------|
| Metadata created/updated | Search cache, dashboard stats |
| Tag added/removed | Tag suggestions, search cache |
| Category modified | Category suggestions, search cache |
| Classification updated | Recommendations, search cache |
| Recognition completed | Recommendations |
| Duplicate resolved | Dashboard stats |
| Collection modified | Dashboard stats |

---

## Batch Operations

### Bulk Metadata Creation

For bulk asset uploads, metadata is created in batches:

```typescript
// Batch insert (100 records per batch)
const batchSize = 100;
for (let i = 0; i < records.length; i += batchSize) {
  const batch = records.slice(i, i + batchSize);
  await db.insert(assetMetadata).values(batch);
}
```

### Bulk Search Index Update

Search index is rebuilt in batches after bulk operations:

```typescript
// Batch index rebuild
const assets = await db.select().from(assetMetadata)
  .where(eq(assetMetadata.userId, userId));

const batchSize = 200;
for (let i = 0; i < assets.length; i += batchSize) {
  const batch = assets.slice(i, i + batchSize);
  await Promise.all(batch.map(asset => updateSearchIndex(asset)));
}
```

---

## Storage Optimization

### JSONB Compression

JSONB columns use PostgreSQL's native compression:

| Column | Avg Size | Compression | Description |
|--------|----------|-------------|-------------|
| `generation_metadata` | ~2KB | 60% | Generation parameters |
| `metadata` | ~1KB | 50% | Extensible metadata |
| `dominant_colors` | ~200B | 40% | Color arrays |
| `rules` | ~500B | 50% | Collection rules |
| `bounding_box` | ~100B | 30% | Spatial coordinates |

### Index Size

Approximate index sizes for 10,000 assets:

| Index | Size | Description |
|-------|------|-------------|
| user_id indexes | ~500KB | B-tree per table |
| asset_id indexes | ~400KB | B-tree per table |
| search_text GIN | ~2MB | Full-text search index |
| JSONB GIN | ~1MB | Tag/category containment |
| **Total** | ~4MB | Per user, 10K assets |

---

## Monitoring

### Performance Metrics to Track

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| API Latency (P95) | >200ms | >500ms |
| Search Latency (P95) | >150ms | >300ms |
| Index Update Latency | >5s | >15s |
| DB Connection Pool | >80% | >95% |
| Cache Hit Rate | <80% | <60% |
| Error Rate | >1% | >5% |

### Query Performance Analysis

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%asset_%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Usage Analysis

```sql
-- Find unused indexes
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'asset_%'
  AND idx_scan = 0;
```
