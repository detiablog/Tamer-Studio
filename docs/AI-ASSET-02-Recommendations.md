# Smart Asset Intelligence System - Asset Recommendations

## Overview

The Asset Recommendations engine suggests related assets, tags, categories, and collections based on asset metadata, recognition data, classification history, and user behavior patterns. Recommendations surface relevant content to help users discover assets they may have missed or forgotten.

---

## Architecture

```
+---------------------+
|  Asset Library      |
|  User History       |
+----------+----------+
           |
           v
+----------+----------+
|  Recommendation     |
|  Engine             |
| - content-based     |
| - collaborative     |
| - metadata-based    |
| - recency-based     |
+----------+----------+
           |
           v
+----------+----------+
|  Recommendation     |
|  Service            |
| (generate, rank,    |
|  cache)             |
+----------+----------+
           |
           v
+----------+----------+
|  Dashboard/API      |
| (display, interact) |
+---------------------+
```

---

## Recommendation Types

### 1. Related Assets

Suggests assets that are related to a given asset through:

| Signal | Weight | Description |
|--------|--------|-------------|
| Same character | 25% | Recognized characters match |
| Same brand | 20% | Recognized brands match |
| Visual similarity | 20% | Similar color palette, composition |
| Same project | 15% | Belong to same project |
| Same campaign | 10% | Same marketing campaign |
| Same style/theme | 10% | Matching style or theme |

### 2. Tag Suggestions

Recommends tags based on:

- Tags commonly applied to similar assets
- Tags from assets in the same project/campaign
- Tags from recently used tag sets
- Auto-generated tags from recognition data

### 3. Category Suggestions

Recommends categories based on:

- Categories of similar assets
- User's category usage patterns
- Asset classification data
- Project-level category standards

### 4. Collection Suggestions

Recommends assets for existing collections based on:

- Collection rules (auto-collections)
- Asset metadata matching collection criteria
- User's collection patterns

### 5. Duplicate Suggestions

Surfaces potential duplicates for review:

- Exact duplicates with high similarity scores
- Near-duplicates that may benefit from consolidation
- Similar compositions that could be alternatives

---

## Recommendation Scoring

Each recommendation receives a relevance score (0-100):

```
relevance_score = (
  content_similarity * 0.30 +
  metadata_match * 0.25 +
  recency_factor * 0.20 +
  user_affinity * 0.15 +
  diversity_bonus * 0.10
)
```

| Factor | Weight | Description |
|--------|--------|-------------|
| Content Similarity | 30% | How similar the content is |
| Metadata Match | 25% | How many metadata fields align |
| Recency Factor | 20% | More recent assets score higher |
| User Affinity | 15% | Based on user interaction history |
| Diversity Bonus | 10% | Bonus for dissimilar suggestions |

---

## Recommendation Flow

```
User Request (asset detail, dashboard, search)
    |
    v
Context Assembly -> Gather asset metadata, tags, classification
    |
    v
Candidate Generation -> Query related assets, tags, categories
    |
    v
Scoring -> Apply weighted scoring algorithm
    |
    v
Ranking -> Sort by relevance score
    |
    v
Diversity Filter -> Ensure variety in suggestions
    |
    v
Cache Results -> Store for subsequent requests
    |
    v
Return Recommendations -> Paginated list
```

---

## Dashboard Recommendations

### Library View

| Section | Description |
|---------|-------------|
| Recently Added | Last 10 assets added to the library |
| Similar to Last Viewed | Assets similar to the most recently viewed |
| Low Quality Alerts | Assets with quality scores below threshold |
| Missing Metadata | Assets without complete metadata |
| Unresolved Duplicates | Detected duplicates pending review |

### Asset Detail View

| Section | Description |
|---------|-------------|
| Related Assets | Assets with recognized commonalities |
| Duplicate Candidates | Potential duplicates of this asset |
| Suggested Tags | Tags commonly applied to similar assets |
| Suggested Categories | Categories that fit this asset |

---

## API Endpoints

### GET /api/assets/[id]/recommendations

Get recommendations for a specific asset.

**Response:**
```json
{
  "success": true,
  "data": {
    "relatedAssets": [...],
    "suggestedTags": [...],
    "suggestedCategories": [...],
    "duplicateCandidates": [...]
  }
}
```

### GET /api/assets/recommendations/dashboard

Get dashboard-level recommendations.

**Response:**
```json
{
  "success": true,
  "data": {
    "recentlyAdded": [...],
    "lowQuality": [...],
    "missingMetadata": [...],
    "unresolvedDuplicates": [...],
    "topTags": [...],
    "topCategories": [...]
  }
}
```

---

## Caching Strategy

| Recommendation Type | Cache TTL | Description |
|--------------------|-----------|-------------|
| Related Assets | 5 minutes | Changes with recognition updates |
| Tag Suggestions | 15 minutes | Changes with tag usage patterns |
| Category Suggestions | 30 minutes | Changes infrequently |
| Dashboard | 5 minutes | Aggregated from multiple sources |

Cache is invalidated when:

- New asset is added
- Tags are modified
- Classification changes
- Recognition completes
- User explicitly requests refresh

---

## Performance Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Recommendation Latency | <100ms | P95 response time |
| Cache Hit Rate | >80% | Percentage of cached responses |
| Relevance Accuracy | >75% | User clicks on recommendations |
| Diversity Score | >0.6 | Gini coefficient of suggestions |
