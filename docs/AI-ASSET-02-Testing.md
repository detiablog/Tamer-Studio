# Smart Asset Intelligence System - Testing Guide

## Test Coverage Areas

### Database Schema Tests

| Area | Coverage |
|------|----------|
| Table Creation | All 13 tables created with correct columns |
| Column Types | Correct data types for all columns |
| Default Values | Default values applied correctly |
| Nullability | Nullable columns accept null |
| Unique Constraints | Unique constraints enforced |
| Index Creation | All indexes created successfully |
| JSONB Columns | JSONB columns accept valid JSON |

### Service Layer Tests

| Area | Service | Coverage |
|------|---------|----------|
| Metadata CRUD | AssetIntelligenceService | Create, read, update, delete metadata |
| Tag Management | AssetIntelligenceService | Tag CRUD, assignment, auto-tagging |
| Category Management | AssetIntelligenceService | Category CRUD, hierarchy |
| Classification | AssetIntelligenceService | Classification CRUD, auto-classification |
| Recognition | AssetIntelligenceService | Recognition CRUD, entity detection |
| Duplicate Detection | AssetIntelligenceService | Detection, status management |
| Relationships | AssetIntelligenceService | CRUD, auto-discovery |
| Quality Scoring | AssetIntelligenceService | Scoring, threshold management |
| Collections | AssetIntelligenceService | Collection CRUD, asset membership |
| Search Index | AssetIntelligenceService | Index build, search, rebuild |
| Settings | AssetIntelligenceService | User settings CRUD |

---

## API Endpoint Tests

### Authentication Tests

| Test Case | Expected Result |
|-----------|----------------|
| No session cookie | 401 Unauthorized |
| Expired session | 401 Unauthorized |
| Valid session | 200/201 with data |

### Validation Tests

| Test Case | Expected Result |
|-----------|----------------|
| Missing required fields | 400 Bad Request |
| Invalid field types | 400 Bad Request |
| String too long | 400 Bad Request |
| Number out of range | 400 Bad Request |
| Invalid JSONB | 400 Bad Request |

### CRUD Tests

| Test Case | Expected Result |
|-----------|----------------|
| Create with valid data | 201 Created |
| Read existing resource | 200 OK with data |
| Update existing resource | 200 OK with updated data |
| Delete existing resource | 200 OK |
| Read non-existent resource | 404 Not Found |
| Update non-existent resource | 404 Not Found |
| Delete non-existent resource | 404 Not Found |

### User Isolation Tests

| Test Case | Expected Result |
|-----------|----------------|
| Read another user's metadata | 404 Not Found |
| Update another user's metadata | 404 Not Found |
| Delete another user's metadata | 404 Not Found |
| Search returns only own assets | Correct scoping |
| Collections scoped to user | Correct scoping |
| Relationships scoped to user | Correct scoping |

### Pagination Tests

| Test Case | Expected Result |
|-----------|----------------|
| Default pagination | 20 items, page 1 |
| Custom page/limit | Correct items returned |
| Page beyond total | Empty array |
| Limit exceeds max (100) | Capped at 100 |

---

## Metadata Engine Tests

| Test Case | Coverage |
|-----------|----------|
| Create metadata with all fields | All fields persisted |
| Create metadata with minimal fields | Defaults applied |
| Update title only | Only title changes |
| Update dominant colors | JSONB updated correctly |
| List by asset type filter | Correct filtering |
| List by project filter | Correct filtering |
| List by extraction status | Correct filtering |
| Delete metadata | Record removed |

---

## Tagging System Tests

| Test Case | Coverage |
|-----------|----------|
| Create tag | Tag persisted with correct name |
| Create duplicate tag for same user | Unique constraint enforced |
| Create same tag for different users | Allowed |
| Assign tag to asset | Assignment created |
| Remove tag from asset | Assignment removed |
| Auto-tag assignment | is_auto=true |
| Manual tag assignment | is_auto=false |
| Lock tag | is_locked=true prevents removal |
| Tag use count increment | Count updated on assignment |
| Tag use count decrement | Count updated on removal |

---

## Classification Tests

| Test Case | Coverage |
|-----------|----------|
| Create classification with all fields | All fields persisted |
| Create classification with partial fields | Null fields accepted |
| Update classification | Fields updated correctly |
| List by character filter | Correct filtering |
| List by brand filter | Correct filtering |
| List by project filter | Correct filtering |
| Classification confidence scoring | Score calculated correctly |

---

## Recognition Tests

| Test Case | Coverage |
|-----------|----------|
| Create recognition result | All fields persisted |
| Create with bounding box | JSONB stored correctly |
| List by recognition type | Correct filtering |
| List by minimum confidence | Correct filtering |
| Multiple recognitions per asset | All stored |
| Recognition type variety | All types supported |

---

## Duplicate Detection Tests

| Test Case | Coverage |
|-----------|----------|
| Detect exact duplicate | match_type='exact' |
| Detect near-duplicate | match_type='near_duplicate' |
| Detect similar composition | match_type='similar_composition' |
| Similarity score range | 0-100 enforced |
| Status transitions | detected -> resolved |
| Status transitions | detected -> ignored |
| List by match type filter | Correct filtering |
| List by status filter | Correct filtering |

---

## Relationship Engine Tests

| Test Case | Coverage |
|-----------|----------|
| Create relationship | All fields persisted |
| Duplicate relationship prevented | Unique constraint enforced |
| Strength score default | Default=50 |
| Strength score custom | Custom value stored |
| List by source asset | Correct filtering |
| List by target asset | Correct filtering |
| List by relationship type | Correct filtering |
| List by minimum strength | Correct filtering |
| Delete relationship | Record removed |

---

## Quality Scoring Tests

| Test Case | Coverage |
|-----------|----------|
| Create quality score | All fields persisted |
| Default scores | All default to 0 |
| Score range 0-100 | Correct for all dimensions |
| Overall score calculation | Weighted average correct |
| List by minimum score | Correct filtering |
| List by maximum score | Correct filtering |
| Update scores | Fields updated correctly |

---

## Collection Tests

| Test Case | Coverage |
|-----------|----------|
| Create manual collection | type='manual' |
| Create auto collection | type='auto' |
| Pin collection | is_pinned=true |
| Add asset to collection | Item created |
| Remove asset from collection | Item removed |
| Duplicate asset in collection | Unique constraint enforced |
| Collection asset count | Count updated correctly |
| Delete collection with items | Cascade delete |

---

## Search Engine Tests

| Test Case | Coverage |
|-----------|----------|
| Full-text search | Returns matching assets |
| Search with no results | Empty array returned |
| Tag filtering | Correct filtering |
| Category filtering | Correct filtering |
| Asset type filtering | Correct filtering |
| Combined filters | Intersection of filters |
| Index rebuild | All assets re-indexed |
| Index update on metadata change | Auto-rebuild triggered |
| Search text assembly | Correct concatenation |

---

## Settings Tests

| Test Case | Coverage |
|-----------|----------|
| Create default settings | All defaults applied |
| Update auto_tagging | Toggle works correctly |
| Update auto_classification | Toggle works correctly |
| Update duplicate_detection | Toggle works correctly |
| Update quality_scoring | Toggle works correctly |
| Update auto_relationships | Toggle works correctly |
| Update auto_indexing | Toggle works correctly |
| Update min_quality_score | Value stored correctly |
| Unique user constraint | One settings per user |

---

## Test Execution

### Running Tests

```bash
# Run all asset intelligence tests
npm test -- --grep "asset-intelligence"

# Run specific test suite
npm test -- --grep "Metadata Engine"
npm test -- --grep "Tag System"
npm test -- --grep "Classification"
npm test -- --grep "Search Engine"
```

### Test Data Setup

Each test suite creates isolated test data:

1. Creates test user session
2. Creates test assets with metadata
3. Runs test operations
4. Verifies expected results
5. Cleans up test data

### Coverage Targets

| Area | Target | Description |
|------|--------|-------------|
| API Endpoints | 100% | All endpoints tested |
| Service Methods | 95% | All public methods tested |
| Database Operations | 90% | All CRUD operations tested |
| Error Paths | 85% | Error conditions tested |
| Edge Cases | 80% | Boundary conditions tested |
