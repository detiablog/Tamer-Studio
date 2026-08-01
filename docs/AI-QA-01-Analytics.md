# AI Quality Assurance - Analytics

## Overview

The Analytics system tracks quality metrics, approval rates, score distributions, and trends over time. It provides two endpoints: a summary stats endpoint and a detailed analytics endpoint with date range filtering.

## Quality Metrics Tracked

### Report Metrics

| Metric | Description |
|--------|-------------|
| totalReports | Total quality reports for the user |
| passedReports | Reports that passed validation |
| failedReports | Reports that failed validation |
| avgOverallScore | Average overall score across all reports |
| approvalRate | Percentage of passed reports (passed/total * 100) |

### Validation Metrics

| Metric | Description |
|--------|-------------|
| totalValidations | Total individual validation checks |
| failedValidations | Validations that returned failed status |

### Recommendation Metrics

| Metric | Description |
|--------|-------------|
| totalRecommendations | Total recommendations generated |

### Retry Metrics

| Metric | Description |
|--------|-------------|
| totalRetries | Total retry attempts across all reports |

## Stats Endpoint

**Route:** `GET /api/quality/stats`

Returns user-specific quality statistics.

### Response

```json
{
  "data": {
    "totalReports": 150,
    "passedReports": 120,
    "failedReports": 30,
    "avgOverallScore": 78,
    "totalValidations": 450,
    "failedValidations": 45,
    "totalRecommendations": 90,
    "totalRetries": 15,
    "approvalRate": 80,
    "typeBreakdown": [
      { "assetType": "image", "count": 80, "avgScore": 82 },
      { "assetType": "video", "count": 50, "avgScore": 74 },
      { "assetType": "story", "count": 20, "avgScore": 76 }
    ]
  }
}
```

### Type Breakdown

Groups reports by `assetType` with count and average score per type.

## Analytics Endpoint

**Route:** `GET /api/quality/analytics`

Returns detailed analytics with optional date range filtering.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | ISO date string | Filter reports from this date |
| endDate | ISO date string | Filter reports up to this date |

### Response

```json
{
  "data": {
    "totalReports": 150,
    "passedReports": 120,
    "failedReports": 30,
    "avgOverallScore": 78,
    "totalValidations": 450,
    "failedValidations": 45,
    "totalRecommendations": 90,
    "approvalRate": 80,
    "typeBreakdown": [
      { "assetType": "image", "count": 80, "avgScore": 82 }
    ],
    "dailyTrend": [
      { "date": "2026-01-01", "count": 5 },
      { "date": "2026-01-02", "count": 8 }
    ]
  }
}
```

### Daily Trend

Groups reports by day using `date_trunc('day', created_at)`. Returns chronological order for trend visualization.

## Approval Rate Calculation

```
approvalRate = (passedReports / totalReports) * 100
```

Returns 0 when `totalReports` is 0 to avoid division by zero.

## Score Distribution

Score distributions can be derived from the type breakdown and daily trend data:

- **By type:** Compare `avgScore` across `assetType` values
- **By time:** Compare daily counts and scores over date ranges
- **Overall:** Use `avgOverallScore` as the aggregate metric

## Audit Logging

Every validation creates an audit log entry:

```typescript
await qualityReportService.logAudit(userId, {
  action: "quality.validate",
  reportId: report.id,
  assetId: request.assetId,
  details: { assetType, overallScore, passed }
});
```

Audit entries are stored in `quality_audit_log` and can be queried for compliance and debugging purposes.
