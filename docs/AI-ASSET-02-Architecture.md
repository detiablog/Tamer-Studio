# Smart Asset Intelligence System - Overall Architecture

## System Overview and Purpose

The Smart Asset Intelligence System is an intelligent asset organization and content discovery engine for Tamer Studio. It provides automated metadata extraction, classification, tagging, duplicate detection, quality scoring, relationship mapping, and search indexing across all asset types (images, videos, storyboards, scripts, captions, thumbnails, audio, and references).

### Core Objectives

1. **Automated Organization**: Reduce manual asset management through AI-powered tagging, classification, and metadata extraction
2. **Content Discovery**: Enable fast, accurate search and filtering across large asset libraries
3. **Quality Assessment**: Score asset quality across multiple dimensions (resolution, sharpness, composition, lighting, brand consistency)
4. **Relationship Mapping**: Discover and link related assets through automatic relationship detection
5. **Duplicate Detection**: Identify exact, near-duplicate, and similar assets to reduce redundancy
6. **User Isolation**: Enforce strict data isolation per user with no cross-user data leakage

---

## Architecture Diagram

```
+---------------------+
|    User Activity     |
| (upload, edit, tag,  |
|  search, browse)    |
+----------+----------+
           |
           v
+----------+----------+     +-------------------+
|  API Layer          |     |  PostgreSQL DB    |
|  (25 endpoints)     |<--->|  (11 tables)      |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+
|  Metadata Engine    |
| (extraction,        |
|  indexing, search)  |
+----------+----------+
           |
           v
+----------+----------+     +-------------------+
|  Classification     |<--->|  Category System   |
|  Engine             |     |  (hierarchical)   |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+
|  Recognition Engine |
| (character, brand,  |
|  object detection)  |
+----------+----------+
           |
           v
+----------+----------+
|  Relationship       |
|  Engine             |
| (auto-linking,      |
|  strength scoring)  |
+----------+----------+
           |
           v
+----------+----------+
|  Duplicate Detection|
| (exact, near-dup,   |
|  similarity)        |
+----------+----------+
           |
           v
+----------+----------+
|  Quality Scoring    |
|  Engine             |
| (resolution, sharp, |
|  composition, etc.) |
+----------+----------+
           |
           v
+----------+----------+
|  Search Engine      |
| (full-text, tag,    |
|  category, filters) |
+----------+----------+
           |
           v
+----------+----------+
|  Analytics &        |
|  Dashboard          |
| (stats, insights)   |
+---------------------+
```

---

## Core Components

### 1. Metadata Engine

- **Schema**: `src/lib/db/schema/asset-intelligence.ts` (assetMetadata table)
- **Responsibility**: Extract, store, and manage comprehensive metadata for every asset
- **Key Capabilities**: Dimensions, resolution, duration, aspect ratio, file size, format, language, dominant colors, project linkage, AI model/provider tracking, extraction status management

### 2. Classification Engine

- **Schema**: `assetClassification`, `assetCategory` tables
- **Responsibility**: Automatically classify assets into campaigns, stories, characters, brands, platforms, content types, media types, styles, themes, and genres
- **Key Capabilities**: Hierarchical categories, confidence scoring, multi-dimensional classification

### 3. Tagging System

- **Schema**: `assetTag`, `assetTagAssignment` tables
- **Responsibility**: Create, manage, and auto-assign tags to assets
- **Key Capabilities**: Auto/manual tagging, tag locking, tag categories, usage counting, system tags

### 4. Recognition Engine

- **Schema**: `assetRecognition` table
- **Responsibility**: Detect and label characters, brands, objects, and other entities within assets
- **Key Capabilities**: Bounding box detection, confidence scoring, recognition type categorization

### 5. Relationship Engine

- **Schema**: `assetRelationship` table
- **Responsibility**: Discover and map relationships between assets
- **Key Capabilities**: Relationship type classification, strength scoring, auto-relationship generation

### 6. Duplicate Detection Engine

- **Schema**: `assetDuplicate` table
- **Responsibility**: Identify exact duplicates, near-duplicates, and similar compositions
- **Key Capabilities**: Similarity scoring, match type classification, resolution workflow

### 7. Quality Scoring Engine

- **Schema**: `assetQualityScore` table
- **Responsibility**: Evaluate asset quality across multiple dimensions
- **Key Capabilities**: Resolution, sharpness, composition, lighting, brand consistency, technical quality scoring, overall score calculation

### 8. Collection System

- **Schema**: `assetCollection`, `assetCollectionItem` tables
- **Responsibility**: Group assets into curated or automatic collections
- **Key Capabilities**: Manual/auto collections, pinning, rules-based membership, ordering

### 9. Search Engine

- **Schema**: `assetSearchIndex` table
- **Responsibility**: Index asset content for fast full-text search and filtered queries
- **Key Capabilities**: Full-text search, tag-based filtering, category filtering, search index rebuild

### 10. Settings Manager

- **Schema**: `assetSettings` table
- **Responsibility**: Manage user-level preferences for all intelligence features
- **Key Capabilities**: Toggle auto-tagging, auto-classification, duplicate detection, quality scoring, auto-relationships, auto-indexing, minimum quality score threshold

---

## Data Flow

### Primary Flow: Asset Ingestion

```
Asset Upload
    |
    v
Metadata Extraction -> asset_metadata (dimensions, format, colors, etc.)
    |
    v
Auto Tagging -> asset_tag + asset_tag_assignment
    |
    v
Auto Classification -> asset_classification
    |
    v
Quality Scoring -> asset_quality_score
    |
    v
Duplicate Detection -> asset_duplicate
    |
    v
Relationship Discovery -> asset_relationship
    |
    v
Search Indexing -> asset_search_index
    |
    v
Dashboard Update -> aggregated stats
```

### Search Flow

```
User Query
    |
    v
Search Engine -> asset_search_index (full-text match)
    |
    v
Apply Filters -> tags, categories, asset type, quality, duplicates
    |
    v
Rank Results -> relevance score + quality score
    |
    v
Return Results -> paginated asset list
```

---

## Integration Points

### Asset Management

- Consumes metadata from the core asset system
- Provides enrichment data for asset display and filtering
- Shares quality scores for asset approval workflows

### Creative Memory

- Uses recognition data (characters, brands) for contextual memory
- Provides asset quality history for learning patterns

### AI Runtime

- Receives AI model and provider information from generation pipeline
- Feeds quality scores back for model performance evaluation

### Publishing

- Uses classification data (platform, content type) for publish readiness
- Provides asset collections for batch publishing workflows

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL via Drizzle ORM |
| API Framework | Next.js API Routes |
| Search | PostgreSQL full-text search |
| Image Analysis | AI-powered color extraction, quality scoring |
| Duplicate Detection | Perceptual hashing + AI similarity |
| Relationship Detection | AI-powered entity recognition + clustering |

---

## File Structure

```
src/
  lib/db/schema/
    asset-intelligence.ts          # All 11 table definitions
  app/api/asset-intelligence/
    metadata/                      # Metadata CRUD
    tags/                          # Tag management
    categories/                    # Category management
    classifications/               # Auto-classification
    recognition/                   # Entity recognition
    relationships/                 # Asset relationships
    duplicates/                    # Duplicate detection
    quality/                       # Quality scoring
    collections/                   # Collection management
    search/                        # Search index (via assets/search)
    settings/                      # User settings (via assets)
```
