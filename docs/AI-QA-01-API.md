# AI Quality Assurance - API Endpoints

## Overview

All endpoints are under `/api/quality/` and require authenticated user sessions via `userAuthentication()` middleware.

**Response Format:** All responses use `successResponse(data)` or `errorResponse(code, message)`.

## Endpoints

### 1. List Reports

**Route:** `GET /api/quality`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| projectId | string | Filter by project |
| assetType | string | Filter by asset type |
| moduleType | string | Filter by module type |
| status | string | Filter by status |
| passed | boolean | Filter by pass/fail |
| search | string | Search in summary and assetId |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20, max: 100) |

**Response:**

```json
{
  "data": {
    "data": [...reports],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### 2. Create Report

**Route:** `POST /api/quality`

**Request Body:**

```json
{
  "projectId": "optional-project-id",
  "assetId": "optional-asset-id",
  "assetType": "image",
  "moduleType": "video-studio",
  "status": "pending",
  "overallScore": 0,
  "passed": false,
  "requiresReview": false,
  "summary": "Optional summary",
  "scores": {},
  "metadata": {}
}
```

**Response:** `201 Created` with report object.

### 3. Run Validation

**Route:** `POST /api/quality/validate`

**Request Body:**

```json
{
  "projectId": "optional-project-id",
  "assetId": "optional-asset-id",
  "assetType": "image | video | story | affiliate | drama | publishing | prompt",
  "moduleType": "module-name",
  "asset": {
    "width": 1024,
    "height": 1024,
    "hasLogo": true,
    "hasWatermark": false,
    "colors": ["#FF0000", "#0000FF"],
    "tone": "professional",
    "typography": "sans-serif",
    "preferredCta": "shop-now",
    "technicalScore": 85
  },
  "minScore": 70
}
```

**Required Fields:** `assetType`, `moduleType`, `asset`

**Response:** `201 Created`

```json
{
  "data": {
    "reportId": "qrep_xxx",
    "overallScore": 78,
    "passed": true,
    "minScore": 70,
    "scores": {
      "image": 82,
      "brand": 75,
      "technical": 85
    },
    "validators": {
      "image": { "overallScore": 82, "issues": [], "recommendations": [] },
      "brand": { "overallBrandScore": 75, "issues": [], "recommendations": [] }
    },
    "recommendations": [...],
    "recovery": {
      "action": "approve",
      "reason": "Score 78 meets minimum 70"
    }
  }
}
```

### 4. Get Full Report

**Route:** `GET /api/quality/[id]`

**Response:**

```json
{
  "data": {
    "id": "qrep_xxx",
    "userId": "user-id",
    "assetType": "image",
    "overallScore": 78,
    "passed": true,
    "scores": [...quality_score records],
    "validations": [...quality_validation records],
    "recommendations": [...quality_recommendation records],
    "retries": [...quality_retry_history records]
  }
}
```

Returns `404` if report not found.

### 5. Delete Report

**Route:** `DELETE /api/quality/[id]`

Cascading delete: removes all associated scores, validations, recommendations, and retry history.

**Response:** `{ "data": { "deleted": true } }`

### 6. Update Recommendation Status

**Route:** `PUT /api/quality/[id]/recommendations/[recId]`

**Request Body:**

```json
{
  "status": "resolved | dismissed | open"
}
```

**Response:** Updated recommendation object. Returns `404` if not found.

### 7. Get Statistics

**Route:** `GET /api/quality/stats`

**Response:**

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
    "typeBreakdown": [...]
  }
}
```

### 8. Get Analytics

**Route:** `GET /api/quality/analytics`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | ISO date | Filter from date |
| endDate | ISO date | Filter to date |

**Response:** Same as stats plus `dailyTrend` array.

### 9. List Rules

**Route:** `GET /api/quality/rules`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| isEnabled | boolean | Filter by enabled status |
| search | string | Search in rule name |
| page | number | Page number |
| limit | number | Results per page (max: 200) |

### 10. Create Rule

**Route:** `POST /api/quality/rules`

**Request Body:**

```json
{
  "name": "My Rule",
  "description": "Rule description",
  "category": "image",
  "minScore": 80,
  "autoRetryThreshold": 60,
  "maxRetryCount": 5,
  "ignoredValidators": [],
  "mode": "strict",
  "isDefault": false
}
```

**Required Fields:** `name`

### 11. Get/Update/Delete Rule

**Route:** `GET/PUT/DELETE /api/quality/rules/[id]`

**PUT Request Body:** Any subset of rule fields.

### 12. Toggle Rule

**Route:** `POST /api/quality/rules/[id]/toggle`

Toggles the `isEnabled` state of a rule. No request body required.

### 13. Get/Update Settings

**Route:** `GET/POST /api/quality/settings`

**POST Request Body:**

```json
{
  "strictMode": false,
  "autoRetryEnabled": true,
  "autoRetryThreshold": 50,
  "maxRetryCount": 3,
  "defaultMinScore": 70,
  "skipValidation": false,
  "notifyOnPass": false,
  "notifyOnFail": true,
  "enabledValidators": ["image", "brand"]
}
```

### 14. List Thresholds

**Route:** `GET /api/quality/thresholds`

**Response:** Array of threshold objects.

## Error Responses

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| VALIDATION_ERROR | 400 | Missing required fields |
| NOT_FOUND | 404 | Resource not found |
