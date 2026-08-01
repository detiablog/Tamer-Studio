# AI Quality Assurance - Database Design

## Overview

The AI QA system uses 9 PostgreSQL tables managed via Drizzle ORM. All tables include `userId` for user isolation and `createdAt`/`updatedAt` timestamps.

**Schema File:** `src/lib/db/schema/quality-assurance.ts`

## Tables

### 1. quality_report

Central table storing quality validation reports.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qrep_*) |
| userId | text | NOT NULL | Owner user ID |
| projectId | text | null | Associated project |
| assetId | text | null | Associated asset |
| assetType | varchar(50) | NOT NULL | Asset type (image/video/story/affiliate/drama/publishing/prompt) |
| moduleType | varchar(100) | NOT NULL | Module source type |
| status | varchar(50) | "pending" | Report status |
| overallScore | integer | 0 | Final weighted score (0-100) |
| passed | boolean | false | Whether asset passed validation |
| requiresReview | boolean | false | Whether manual review is needed |
| summary | text | null | Human-readable summary |
| scores | jsonb | {} | Category scores as JSON map |
| metadata | jsonb | {} | Additional metadata as JSON |
| createdAt | timestamp | now() | Creation timestamp |
| updatedAt | timestamp | now() | Last update timestamp |

**Indexes:** userId, projectId, assetId, assetType, status

### 2. quality_score

Individual category scores within a report.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qsc_*) |
| reportId | text | NOT NULL | Parent report ID |
| userId | text | NOT NULL | Owner user ID |
| category | varchar(100) | NOT NULL | Score category name |
| score | integer | NOT NULL | Category score (0-100) |
| explanation | text | null | Human-readable explanation |
| weight | real | 1 | Category weight |
| details | jsonb | {} | Raw score details as JSON |
| createdAt | timestamp | now() | Creation timestamp |

**Indexes:** reportId, userId

### 3. quality_validation

Individual validation check results.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qval_*) |
| reportId | text | NOT NULL | Parent report ID |
| userId | text | NOT NULL | Owner user ID |
| validatorType | varchar(100) | NOT NULL | Validator type (image/video/brand/story/publishing) |
| name | varchar(200) | NOT NULL | Validation check name |
| passed | boolean | false | Whether check passed |
| severity | varchar(50) | "info" | Issue severity |
| message | text | null | Validation message |
| details | jsonb | {} | Additional details as JSON |
| createdAt | timestamp | now() | Creation timestamp |

**Indexes:** reportId, userId

### 4. quality_recommendation

Actionable improvement suggestions.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qrec_*) |
| reportId | text | NOT NULL | Parent report ID |
| userId | text | NOT NULL | Owner user ID |
| type | varchar(100) | NOT NULL | Recommendation type |
| title | varchar(200) | NOT NULL | Short title |
| description | text | null | Detailed description |
| severity | varchar(50) | "info" | Severity level |
| status | varchar(50) | "open" | Current status (open/resolved/dismissed) |
| impact | integer | 0 | Impact score (0-100) |
| action | varchar(100) | null | Suggested action |
| metadata | jsonb | {} | Additional metadata as JSON |
| createdAt | timestamp | now() | Creation timestamp |
| updatedAt | timestamp | now() | Last update timestamp |

**Indexes:** reportId, userId

### 5. quality_retry_history

Records of retry attempts for failed validations.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qauto_*) |
| reportId | text | NOT NULL | Parent report ID |
| userId | text | NOT NULL | Owner user ID |
| assetId | text | null | Asset being retried |
| retryCount | integer | 1 | Attempt number |
| reason | text | null | Retry reason |
| status | varchar(50) | "started" | Retry status |
| provider | varchar(100) | null | AI provider used |
| model | varchar(200) | null | AI model used |
| scoreBefore | integer | 0 | Score before retry |
| scoreAfter | integer | 0 | Score after retry |
| metadata | jsonb | {} | Additional metadata as JSON |
| createdAt | timestamp | now() | Creation timestamp |

**Indexes:** reportId, userId

### 6. quality_rule

User-defined quality rules.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qrule_*) |
| userId | text | NOT NULL | Owner user ID |
| name | varchar(200) | NOT NULL | Rule name |
| description | text | null | Rule description |
| category | varchar(100) | null | Rule category |
| minScore | integer | 70 | Minimum passing score |
| autoRetryThreshold | integer | 50 | Score triggering retry |
| maxRetryCount | integer | 3 | Maximum retry attempts |
| ignoredValidators | jsonb | [] | Validators to skip |
| mode | varchar(50) | "balanced" | Validation mode |
| isEnabled | boolean | true | Whether rule is active |
| isDefault | boolean | false | Whether this is a default rule |
| metadata | jsonb | {} | Additional metadata as JSON |
| createdAt | timestamp | now() | Creation timestamp |
| updatedAt | timestamp | now() | Last update timestamp |

**Indexes:** userId, category

### 7. quality_threshold

Global scoring thresholds per category.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qthr_*) |
| category | varchar(100) | NOT NULL | Threshold category |
| name | varchar(200) | NOT NULL | Threshold name |
| minValue | integer | 60 | Minimum acceptable value |
| maxValue | integer | 100 | Maximum acceptable value |
| weight | real | 1 | Category weight |
| isEnabled | boolean | true | Whether threshold is active |
| metadata | jsonb | {} | Additional metadata as JSON |
| createdAt | timestamp | now() | Creation timestamp |
| updatedAt | timestamp | now() | Last update timestamp |

### 8. quality_settings

Per-user QA configuration.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (qset_*) |
| userId | text (UNIQUE) | NOT NULL | Owner user ID |
| strictMode | boolean | false | Enable strict validation |
| autoRetryEnabled | boolean | true | Allow automatic retries |
| autoRetryThreshold | integer | 50 | Score triggering retry |
| maxRetryCount | integer | 3 | Maximum retry attempts |
| defaultMinScore | integer | 70 | Default minimum passing score |
| skipValidation | boolean | false | Skip all validation |
| notifyOnPass | boolean | false | Notify on pass |
| notifyOnFail | boolean | true | Notify on failure |
| enabledValidators | jsonb | [] | Specific validators to enable |
| metadata | jsonb | {} | Additional metadata as JSON |
| createdAt | timestamp | now() | Creation timestamp |
| updatedAt | timestamp | now() | Last update timestamp |

### 9. quality_audit_log

Audit trail for QA actions.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | text (PK) | - | Unique identifier (quad_*) |
| userId | text | NOT NULL | Owner user ID |
| action | varchar(100) | NOT NULL | Action performed |
| reportId | text | null | Associated report |
| assetId | text | null | Associated asset |
| details | jsonb | {} | Action details as JSON |
| createdAt | timestamp | now() | Creation timestamp |

**Indexes:** userId, reportId

## Relations

```
quality_report (1) ---< (N) quality_score
quality_report (1) ---< (N) quality_validation
quality_report (1) ---< (N) quality_recommendation
quality_report (1) ---< (N) quality_retry_history
```

All child tables reference `reportId` as a foreign key to `quality_report.id`.

## ID Generation

All IDs use the `generateId()` function with prefixed identifiers:

| Table | Prefix |
|-------|--------|
| quality_report | qrep_ |
| quality_score | qsc_ |
| quality_validation | qval_ |
| quality_recommendation | qrec_ |
| quality_retry_history | qauto_ |
| quality_rule | qrule_ |
| quality_threshold | qthr_ |
| quality_settings | qset_ |
| quality_audit_log | quad_ |
