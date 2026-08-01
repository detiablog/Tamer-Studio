# AI Quality Assurance - Performance

## Overview

The AI QA system is optimized for throughput and latency through parallel validation, efficient database queries, and proper indexing.

## Parallel Validation

### Validator Execution

Validators are executed sequentially in the current implementation, but each is independent and could be parallelized:

```typescript
if (request.assetType === "image") {
  validators.image = await imageValidatorService.validateImage(request.asset);
}
if (request.assetType === "video") {
  validators.video = await videoValidatorService.validateVideo(request.asset);
}
```

### Best-Effort Validation

Each validator is wrapped in try/catch to prevent one validator from blocking others:

```typescript
try {
  validators.brand = await brandValidatorService.validateBrand(request.userId, request.asset);
} catch {
  validators.brand = { overallBrandScore: 60, issues: [], recommendations: [] };
}
```

This ensures partial results are available even when individual validators fail.

## Database Indexes

### Report Table Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_report_user_idx | userId | User-scoped queries |
| quality_report_project_idx | projectId | Project filtering |
| quality_report_asset_idx | assetId | Asset lookup |
| quality_report_type_idx | assetType | Type filtering |
| quality_report_status_idx | status | Status filtering |

### Score Table Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_score_report_idx | reportId | Report association |
| quality_score_user_idx | userId | User isolation |

### Validation Table Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_validation_report_idx | reportId | Report association |
| quality_validation_user_idx | userId | User isolation |

### Recommendation Table Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_rec_report_idx | reportId | Report association |
| quality_rec_user_idx | userId | User isolation |

### Retry History Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_retry_report_idx | reportId | Report association |
| quality_retry_user_idx | userId | User isolation |

### Rule Table Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_rule_user_idx | userId | User-scoped queries |
| quality_rule_category_idx | category | Category filtering |

### Audit Log Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| quality_audit_user_idx | userId | User-scoped queries |
| quality_audit_report_idx | reportId | Report association |

## Query Optimization

### Parallel Database Queries

The report service uses `Promise.all` for concurrent database reads:

```typescript
const [scores, validations, recommendations, retries] = await Promise.all([
  db.select().from(qualityScore).where(eq(qualityScore.reportId, id)),
  db.select().from(qualityValidation).where(eq(qualityValidation.reportId, id)),
  db.select().from(qualityRecommendation).where(eq(qualityRecommendation.reportId, id)),
  db.select().from(qualityRetryHistory).where(eq(qualityRetryHistory.reportId, id)),
]);
```

### Statistics Aggregation

Stats queries use SQL aggregation functions (`count`, `avg`) directly in the database:

```typescript
const [totalReports] = await db.select({ count: sql<number>`count(*)` })
  .from(qualityReport)
  .where(eq(qualityReport.userId, userId));
```

### Pagination

List endpoints support pagination with configurable limits:

```typescript
const page = filters?.page || 1;
const limit = Math.min(filters?.limit || 20, 100);
const offset = (page - 1) * limit;
```

Reports: max 100 per page. Rules: max 200 per page.

### Count + Data Parallel

List queries fetch data and total count concurrently:

```typescript
const [data, total] = await Promise.all([
  db.select().from(qualityReport).where(where).orderBy(desc(qualityReport.createdAt)).limit(limit).offset(offset),
  db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(where),
]);
```

## Caching Opportunities

Currently, the system does not implement response caching. Potential caching targets:

- User settings (change infrequently)
- Brand profiles (stable between updates)
- Threshold configurations (global, rarely changed)
- Statistics (could use materialized views for large datasets)

## Performance Considerations

### Validation Latency

- Each validator reads asset metadata in-memory (no network calls for image/video analysis)
- Brand validator makes one database query to load the brand profile
- Total validation latency is dominated by database writes for report persistence

### Scalability Limits

- Reports table will grow unboundedly without archival
- Analytics queries with date ranges scan all matching rows
- Statistics queries aggregate across all user reports

### Recommended Optimizations

1. Add database-level pagination for large result sets
2. Implement read replicas for analytics queries
3. Add report archival for data older than 90 days
4. Use database materialized views for dashboard statistics
5. Consider Redis caching for user settings and brand profiles
