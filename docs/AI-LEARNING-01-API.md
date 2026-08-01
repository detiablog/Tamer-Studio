# AI-LEARNING-01 - API

## Overview

The Continuous Learning Engine exposes 20 API routes under `/api/learning/`. All endpoints require authentication and follow RESTful conventions with JSON request/response bodies.

## API Routes

### Events

#### GET /api/learning/events

Returns learning events for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by event type
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "evt_123",
      "type": "content.create",
      "category": "behavior",
      "description": "Created a new story",
      "metadata": {},
      "timestamp": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/learning/events

Creates a new learning event.

**Request Body:**
```json
{
  "type": "content.create",
  "category": "behavior",
  "description": "Created a new story",
  "metadata": { "contentId": "story_456" }
}
```

**Response:**
```json
{
  "data": {
    "id": "evt_123",
    "type": "content.create",
    "category": "behavior",
    "description": "Created a new story",
    "metadata": { "contentId": "story_456" },
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

### Patterns

#### GET /api/learning/patterns

Returns discovered patterns for the authenticated user.

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `minConfidence` (optional): Minimum confidence threshold

**Response:**
```json
{
  "data": [
    {
      "id": "pat_123",
      "name": "Evening Content Creator",
      "description": "You tend to create content between 7PM-10PM",
      "category": "behavior",
      "confidence": 0.85,
      "occurrences": 45,
      "status": "active",
      "discoveredAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/learning/patterns/detect

Triggers pattern detection for the authenticated user.

**Response:**
```json
{
  "data": {
    "jobId": "job_123",
    "status": "started",
    "message": "Pattern detection started"
  }
}
```

#### DELETE /api/learning/patterns/[id]

Deletes a specific pattern.

**Response:**
```json
{
  "data": {
    "id": "pat_123",
    "deleted": true
  }
}
```

### Preferences

#### GET /api/learning/preferences

Returns inferred preferences for the authenticated user.

**Query Parameters:**
- `source` (optional): Filter by source (behavioral, explicit, feedback)
- `key` (optional): Filter by preference key

**Response:**
```json
{
  "data": [
    {
      "id": "pref_123",
      "key": "content.preferredFormat",
      "value": "video",
      "source": "behavioral",
      "confidence": 0.72,
      "overridden": false,
      "inferredAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/learning/preferences/override

Sets an explicit override for a preference.

**Request Body:**
```json
{
  "id": "pref_123",
  "value": "image"
}
```

**Response:**
```json
{
  "data": {
    "id": "pref_123",
    "value": "image",
    "overridden": true
  }
}
```

#### DELETE /api/learning/preferences/[id]

Deletes a specific preference.

**Response:**
```json
{
  "data": {
    "id": "pref_123",
    "deleted": true
  }
}
```

### Recommendations

#### GET /api/learning/recommendations

Returns recommendations for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (pending, accepted, ignored)
- `type` (optional): Filter by type
- `priority` (optional): Filter by priority

**Response:**
```json
{
  "data": [
    {
      "id": "rec_123",
      "title": "Try keyboard shortcuts",
      "description": "You could save time with keyboard shortcuts",
      "type": "workflow",
      "priority": "medium",
      "confidence": 0.68,
      "status": "pending",
      "reasoning": "Based on your frequent edit actions",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/learning/recommendations

Creates a new recommendation (admin only).

**Request Body:**
```json
{
  "title": "Try keyboard shortcuts",
  "description": "You could save time with keyboard shortcuts",
  "type": "workflow",
  "priority": "medium",
  "confidence": 0.68,
  "reasoning": "Based on frequent edit actions"
}
```

#### GET /api/learning/recommendations/[id]

Returns a specific recommendation.

**Response:**
```json
{
  "data": {
    "id": "rec_123",
    "title": "Try keyboard shortcuts",
    "description": "You could save time with keyboard shortcuts",
    "type": "workflow",
    "priority": "medium",
    "confidence": 0.68,
    "status": "pending",
    "reasoning": "Based on your frequent edit actions",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

#### PUT /api/learning/recommendations/[id]

Updates a specific recommendation.

**Request Body:**
```json
{
  "status": "accepted"
}
```

#### DELETE /api/learning/recommendations/[id]

Deletes a specific recommendation.

**Response:**
```json
{
  "data": {
    "id": "rec_123",
    "deleted": true
  }
}
```

#### PUT /api/learning/recommendations/[id]/status

Updates the status of a recommendation.

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Response:**
```json
{
  "data": {
    "id": "rec_123",
    "status": "accepted",
    "updatedAt": "2026-01-15T10:30:00Z"
  }
}
```

### Feedback

#### GET /api/learning/feedback

Returns feedback submitted by the authenticated user.

**Query Parameters:**
- `category` (optional): Filter by category

**Response:**
```json
{
  "data": [
    {
      "id": "fb_123",
      "rating": 5,
      "comment": "The recommendations are very helpful",
      "category": "general",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/learning/feedback

Submits new feedback.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "The recommendations are very helpful",
  "category": "general"
}
```

**Response:**
```json
{
  "data": {
    "id": "fb_123",
    "rating": 5,
    "comment": "The recommendations are very helpful",
    "category": "general",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

#### DELETE /api/learning/feedback/[id]

Deletes a specific feedback entry.

**Response:**
```json
{
  "data": {
    "id": "fb_123",
    "deleted": true
  }
}
```

### Goals

#### GET /api/learning/goals

Returns learning goals for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (active, completed, abandoned)

**Response:**
```json
{
  "data": [
    {
      "id": "goal_123",
      "title": "Create 50 stories",
      "description": "Improve story creation skills",
      "targetValue": 50,
      "currentValue": 32,
      "unit": "count",
      "deadline": "2026-06-01T00:00:00Z",
      "status": "active",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/learning/goals

Creates a new learning goal.

**Request Body:**
```json
{
  "title": "Create 50 stories",
  "description": "Improve story creation skills",
  "targetValue": 50,
  "unit": "count",
  "deadline": "2026-06-01T00:00:00Z"
}
```

#### GET /api/learning/goals/[id]

Returns a specific goal.

#### PUT /api/learning/goals/[id]

Updates a specific goal.

**Request Body:**
```json
{
  "title": "Create 100 stories",
  "status": "active"
}
```

#### DELETE /api/learning/goals/[id]

Deletes a specific goal.

**Response:**
```json
{
  "data": {
    "id": "goal_123",
    "deleted": true
  }
}
```

#### PUT /api/learning/goals/[id]/progress

Updates the progress of a goal.

**Request Body:**
```json
{
  "currentValue": 35
}
```

**Response:**
```json
{
  "data": {
    "id": "goal_123",
    "currentValue": 35,
    "progress": 0.70
  }
}
```

### History

#### GET /api/learning/history

Returns learning history timeline for the authenticated user.

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "hist_123",
      "event": "New pattern detected: Evening Content Creator",
      "category": "pattern",
      "details": "Pattern discovered with 0.85 confidence",
      "timestamp": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### Reports

#### GET /api/learning/reports

Returns generated reports for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by report type

**Response:**
```json
{
  "data": [
    {
      "id": "rpt_123",
      "title": "Monthly Learning Summary",
      "type": "summary",
      "summary": "Overview of learning activity for January 2026",
      "metrics": {
        "totalEvents": 245,
        "patternsDiscovered": 8,
        "acceptanceRate": 0.72
      },
      "generatedAt": "2026-01-31T23:59:59Z"
    }
  ]
}
```

#### POST /api/learning/reports

Generates a new learning report.

**Request Body:**
```json
{
  "type": "summary"
}
```

#### GET /api/learning/reports/[id]

Returns a specific report.

#### DELETE /api/learning/reports/[id]

Deletes a specific report.

**Response:**
```json
{
  "data": {
    "id": "rpt_123",
    "deleted": true
  }
}
```

### Settings

#### GET /api/learning/settings

Returns learning settings for the authenticated user.

**Response:**
```json
{
  "data": {
    "learningEnabled": true,
    "learningPaused": false,
    "privacyMode": false,
    "anonymousData": false,
    "shareInsights": false,
    "retentionDays": 90,
    "confidenceThreshold": 0.7,
    "autoRecommendations": true,
    "maxPatterns": 1000,
    "maxPreferences": 500,
    "processingInterval": 30
  }
}
```

#### POST /api/learning/settings

Updates learning settings.

**Request Body:**
```json
{
  "learningEnabled": true,
  "privacyMode": true,
  "retentionDays": 60
}
```

#### DELETE /api/learning/settings

Resets learning data (admin only).

**Request Body:**
```json
{
  "resetType": "patterns"
}
```

**Reset Types:** `patterns`, `preferences`, `recommendations`, `all`

### Stats

#### GET /api/learning/stats

Returns aggregated learning statistics.

**Response:**
```json
{
  "data": {
    "totalEvents": 245,
    "totalPatterns": 12,
    "totalPreferences": 8,
    "totalRecommendations": 15,
    "totalGoals": 3,
    "totalFeedback": 7,
    "avgConfidence": 0.72,
    "acceptanceRate": 0.65,
    "goalProgress": 0.58,
    "eventsByType": [
      { "type": "content.create", "count": 89 },
      { "type": "content.edit", "count": 67 }
    ],
    "patternsByCategory": [
      { "category": "behavior", "count": 5 },
      { "category": "content", "count": 3 }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INTERNAL_ERROR` | 500 | Server error |
