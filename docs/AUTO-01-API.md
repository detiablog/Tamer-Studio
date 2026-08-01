# AUTO-01: API Endpoints

## Overview

The Automation Center exposes 24 REST API endpoints under `/api/automation/*`. All endpoints require authentication via the `userAuthentication` middleware. Responses follow the standard Tamer Studio response format.

## Authentication

All endpoints require a valid user session. The `userAuthentication` middleware extracts the user ID from the session token. Unauthenticated requests receive a 401 response.

```
Authorization: Bearer <session_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name and triggerConfig are required"
  }
}
```

## Endpoints

### Rules

#### GET /api/automation

List automation rules with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `isEnabled` | boolean | Filter by enabled state |
| `search` | string | Search by name |
| `status` | string | Filter by status |

**Response:** Paginated list of rules.

---

#### POST /api/automation

Create a new automation rule.

**Request Body:**

```json
{
  "name": "Auto-publish images",
  "description": "Automatically publish generated images",
  "status": "draft",
  "priority": "normal",
  "triggerConfig": {
    "type": "image_generated",
    "config": {}
  },
  "conditions": [
    { "field": "data.status", "operator": "equals", "value": "completed" }
  ],
  "actions": [
    { "type": "publish_content", "config": { "platform": "instagram" }, "order": 1 }
  ],
  "tags": ["auto-publish"],
  "isEnabled": true
}
```

**Required Fields:** `name`, `triggerConfig`

**Response:** Created rule (201).

---

#### GET /api/automation/[id]

Get a single automation rule.

**Response:** Rule object.

---

#### PUT /api/automation/[id]

Update an automation rule.

**Request Body:** Partial rule data.

**Response:** Updated rule.

---

#### DELETE /api/automation/[id]

Delete an automation rule.

**Response:** Success confirmation.

---

#### POST /api/automation/[id]/toggle

Toggle a rule's enabled state.

**Request Body:**

```json
{
  "isEnabled": true
}
```

**Response:** Updated rule.

---

#### POST /api/automation/[id]/execute

Execute a rule manually.

**Request Body:**

```json
{
  "context": {
    "data": { "project": { "type": "video" } }
  }
}
```

**Response:** Execution record.

---

### Conditions

#### POST /api/automation/evaluate

Evaluate conditions against a context.

**Request Body:**

```json
{
  "conditions": [
    { "field": "data.status", "operator": "equals", "value": "completed" }
  ],
  "context": {
    "data": { "status": "completed" }
  }
}
```

**Required Fields:** `conditions`

**Response:**

```json
{
  "success": true,
  "data": { "result": true }
}
```

---

### Events

#### GET /api/automation/events

List automation events.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `eventType` | string | Filter by event type |
| `processed` | boolean | Filter by processing state |

**Response:** Paginated list of events.

---

#### POST /api/automation/events

Record an automation event.

**Request Body:**

```json
{
  "eventType": "image_generated",
  "source": "image-ai-module",
  "entityId": "proj_123",
  "entityType": "project",
  "data": { "imageUrl": "..." }
}
```

**Required Fields:** `eventType`

**Response:** Created event (201).

---

### Executions

#### GET /api/automation/executions

List execution records.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | Filter by status |
| `ruleId` | string | Filter by rule ID |

**Response:** Paginated list of executions.

---

#### GET /api/automation/executions/[id]

Get a single execution record.

**Response:** Execution object.

---

#### POST /api/automation/executions/[id]/cancel

Cancel a running execution.

**Response:** Updated execution.

---

### Queue

#### GET /api/automation/queue

List queue items.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `status` | string | Filter by status |

**Response:** Paginated list of queue items.

---

#### POST /api/automation/queue

Enqueue an execution.

**Request Body:**

```json
{
  "executionId": "aexec_xxx",
  "priority": "high",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "estimatedCredits": 50
}
```

**Response:** Created queue item (201).

---

#### DELETE /api/automation/queue/[id]

Remove a queue item.

**Response:** Success confirmation.

---

#### POST /api/automation/queue/[id]/retry

Retry a failed queue item.

**Response:** Updated queue item.

---

#### POST /api/automation/queue/[id]/priority

Change queue item priority.

**Request Body:**

```json
{
  "priority": "high"
}
```

**Response:** Updated queue item.

---

#### GET /api/automation/queue/status

Get queue status summary.

**Response:**

```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "running": 2,
    "completed": 100,
    "failed": 3,
    "total": 7,
    "estimatedCredits": 250
  }
}
```

---

### Schedules

#### GET /api/automation/schedules

List automation schedules.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `isActive` | boolean | Filter by active state |

**Response:** Paginated list of schedules.

---

#### POST /api/automation/schedules

Create a new schedule.

**Request Body:**

```json
{
  "ruleId": "arule_xxx",
  "name": "Daily content generation",
  "type": "daily",
  "timezone": "UTC",
  "maxRuns": 30
}
```

**Response:** Created schedule (201).

---

#### GET /api/automation/schedules/[id]

Get a single schedule.

**Response:** Schedule object.

---

#### PUT /api/automation/schedules/[id]

Update a schedule.

**Request Body:** Partial schedule data.

**Response:** Updated schedule.

---

#### DELETE /api/automation/schedules/[id]

Delete a schedule.

**Response:** Success confirmation.

---

#### POST /api/automation/schedules/[id]/toggle

Toggle a schedule's active state.

**Request Body:**

```json
{
  "isActive": true
}
```

**Response:** Updated schedule.

---

### Reports

#### GET /api/automation/reports

List generated reports.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `reportType` | string | Filter by report type |

**Response:** Paginated list of reports.

---

#### POST /api/automation/reports

Generate a new report.

**Request Body:**

```json
{
  "reportType": "execution_summary",
  "period": "2024-01"
}
```

**Response:** Generated report (201).

---

#### GET /api/automation/reports/[id]

Get a single report.

**Response:** Report object.

---

#### DELETE /api/automation/reports/[id]

Delete a report.

**Response:** Success confirmation.

---

### Settings

#### GET /api/automation/settings

Get automation settings for the current user.

**Response:** Settings object (auto-created with defaults if not exists).

---

#### PUT /api/automation/settings

Update automation settings.

**Request Body:**

```json
{
  "maxConcurrentExecutions": 10,
  "maxRetries": 5,
  "autoRetry": true,
  "notificationsEnabled": true,
  "creditWarningThreshold": 200,
  "defaultPriority": "normal",
  "allowedModules": ["image", "video", "story"],
  "excludedModules": []
}
```

**Response:** Updated settings.

---

### Statistics

#### GET /api/automation/stats

Get automation statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRules": 15,
    "activeRules": 10,
    "totalExecutions": 500,
    "completedExecutions": 450,
    "failedExecutions": 50,
    "totalCreditsUsed": 25000,
    "totalEvents": 750,
    "successRate": 90
  }
}
```

---

### Templates

#### GET /api/automation/templates

List automation templates.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `type` | string | Filter by type |
| `category` | string | Filter by category |
| `search` | string | Search by name |

**Response:** Paginated list of templates.

---

#### POST /api/automation/templates

Create a new template.

**Request Body:**

```json
{
  "name": "Daily Image Generator",
  "description": "Generate images daily",
  "category": "content",
  "type": "image_generation",
  "estimatedCredits": 100,
  "estimatedDurationMs": 60000,
  "isSystem": false
}
```

**Response:** Created template (201).

---

#### GET /api/automation/templates/[id]

Get a single template.

**Response:** Template object.

---

#### PUT /api/automation/templates/[id]

Update a template.

**Request Body:** Partial template data.

**Response:** Updated template.

---

#### DELETE /api/automation/templates/[id]

Delete a template.

**Response:** Success confirmation.

---

#### POST /api/automation/templates/[id]/use

Create a rule from a template.

**Request Body:**

```json
{
  "name": "My Custom Rule",
  "description": "Created from template"
}
```

**Response:** Created rule (201).

## Error Codes

| Code | Description |
|---|---|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `VALIDATION_ERROR` | Invalid request body or parameters |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

All endpoints are subject to the global rate limiting middleware. Rate limit headers are included in responses.
