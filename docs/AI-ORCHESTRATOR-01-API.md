# AI Orchestrator - API Endpoints

## Overview

The AI Orchestrator REST API is implemented as Next.js App Router route handlers under `src/app/api/orchestrator/`. All endpoints require user authentication via the `userAuthentication()` middleware. The API follows standard REST conventions with JSON request/response bodies.

## Base URL

```
/api/orchestrator
```

## Authentication

All endpoints require a valid user session. The `userAuthentication()` middleware extracts the user ID from the session token. Unauthenticated requests receive:

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Unauthorized"
}
```

HTTP Status: `401`

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
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### Error Response

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

## Endpoint Reference

### 1. Intent Analysis

#### `POST /api/orchestrator/analyze`

Analyze natural language input to determine intent.

**Request Body:**
```json
{
  "input": "Create a TikTok video campaign for my product"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "intent": "video_creation",
    "confidence": 42,
    "suggestedTemplateId": "tmpl_xxx",
    "extractedParameters": {
      "platform": "tiktok"
    },
    "recommendedModules": ["project_studio", "video_studio", "image_studio", "publishing_hub"]
  }
}
```

---

### 2. Pipelines

#### `GET /api/orchestrator`

List pipelines with pagination and filtering.

**Query Parameters:**
| Parameter | Type   | Default | Description                    |
|-----------|--------|---------|--------------------------------|
| `page`    | number | 1       | Page number                    |
| `limit`   | number | 20      | Items per page                 |
| `status`  | string | -       | Filter by status               |
| `type`    | string | -       | Filter by type                 |

**Response (200):** Paginated list of pipeline objects.

#### `POST /api/orchestrator`

Create a new pipeline.

**Request Body:**
```json
{
  "name": "Product Launch Campaign",
  "type": "affiliate_campaign",
  "description": "Campaign for Q4 product launch",
  "triggerType": "manual",
  "config": { "targetPlatforms": ["instagram", "tiktok"] },
  "tags": ["product-launch", "q4"]
}
```

**Required Fields:** `name`, `type`

**Response (201):** Created pipeline object.

#### `GET /api/orchestrator/[id]`

Get a pipeline with its steps.

**Response (200):** Pipeline object with embedded `steps` array.

#### `PUT /api/orchestrator/[id]`

Update a pipeline.

**Request Body:** Partial pipeline fields to update.

**Response (200):** Updated pipeline object.

#### `DELETE /api/orchestrator/[id]`

Delete a pipeline and its steps.

**Response (200):**
```json
{ "success": true, "data": { "deleted": true } }
```

---

### 3. Pipeline Steps

#### `GET /api/orchestrator/[id]/steps`

List steps for a pipeline, ordered by `order`.

**Response (200):** Array of step objects.

#### `POST /api/orchestrator/[id]/steps`

Add a step to a pipeline.

**Request Body:**
```json
{
  "name": "Generate Product Images",
  "moduleType": "image_generation",
  "action": "generate",
  "order": 0,
  "config": { "style": "modern" },
  "inputMapping": { "productImages": "images" },
  "outputKey": "generatedImages",
  "timeoutMs": 60000
}
```

**Required Fields:** `name`, `moduleType`, `action`, `order`

**Response (201):** Created step object.

#### `PUT /api/orchestrator/[id]/steps/[stepId]`

Update a pipeline step.

**Request Body:** Partial step fields to update.

**Response (200):** Updated step object.

#### `DELETE /api/orchestrator/[id]/steps/[stepId]`

Delete a pipeline step.

**Response (200):**
```json
{ "success": true, "data": { "deleted": true } }
```

---

### 4. Executions

#### `GET /api/orchestrator/executions`

List executions for the current user.

**Query Parameters:**
| Parameter   | Type   | Default | Description              |
|-------------|--------|---------|--------------------------|
| `page`      | number | 1       | Page number              |
| `limit`     | number | 20      | Items per page           |
| `status`    | string | -       | Filter by status         |
| `pipelineId`| string | -       | Filter by pipeline       |

**Response (200):** Paginated list of execution objects.

#### `GET /api/orchestrator/executions/[id]`

Get an execution with its tasks.

**Response (200):** Execution object with embedded `tasks` array.

#### `POST /api/orchestrator/[id]/execute`

Create an execution for a pipeline.

**Request Body:**
```json
{
  "triggerType": "manual",
  "input": { "product": "Widget Pro", "platform": "instagram" }
}
```

**Response (201):** Created execution object with estimated credits and duration.

#### `POST /api/orchestrator/executions/[id]/cancel`

Cancel a running execution.

**Response (200):** Updated execution object with `status: "cancelled"`.

---

### 5. Tasks

#### `GET /api/orchestrator/tasks`

List tasks for the current user.

**Query Parameters:**
| Parameter     | Type   | Default | Description              |
|---------------|--------|---------|--------------------------|
| `page`        | number | 1       | Page number              |
| `limit`       | number | 20      | Items per page           |
| `status`      | string | -       | Filter by status         |
| `executionId` | string | -       | Filter by execution      |

**Response (200):** Paginated list of task objects.

#### `GET /api/orchestrator/tasks/[id]`

Get a specific task.

**Response (200):** Task object.

#### `PUT /api/orchestrator/tasks/[id]`

Update a task.

**Request Body:** Partial task fields to update.

**Response (200):** Updated task object.

#### `POST /api/orchestrator/tasks/[id]/retry`

Retry a failed task.

**Response (200):** Task object with `status: "pending"` and incremented `attempts`.

#### `POST /api/orchestrator/tasks/[id]/cancel`

Cancel a task.

**Response (200):** Task object with `status: "cancelled"`.

---

### 6. Queue

#### `GET /api/orchestrator/queue`

List queue items for the current user.

**Query Parameters:**
| Parameter | Type   | Default | Description        |
|-----------|--------|---------|--------------------|
| `page`    | number | 1       | Page number        |
| `limit`   | number | 20      | Items per page     |
| `status`  | string | -       | Filter by status   |

**Response (200):** Paginated list of queue items.

#### `POST /api/orchestrator/queue`

Enqueue a task.

**Request Body:**
```json
{
  "taskId": "task_xxx",
  "priority": "high",
  "estimatedCredits": 10
}
```

**Required Fields:** `taskId`

**Response (201):** Created queue item.

#### `DELETE /api/orchestrator/queue/[id]`

Remove an item from the queue.

**Response (200):**
```json
{ "success": true, "data": { "deleted": true } }
```

#### `PUT /api/orchestrator/queue/[id]/priority`

Update the priority of a queue item.

**Request Body:**
```json
{ "priority": "critical" }
```

**Required Fields:** `priority`

**Response (200):** Updated queue item.

---

### 7. Templates

#### `GET /api/orchestrator/templates`

List templates, optionally filtered by category.

**Query Parameters:**
| Parameter  | Type   | Description              |
|------------|--------|--------------------------|
| `category` | string | Filter by category       |

**Response (200):** Array of template objects, ordered by usage count.

#### `POST /api/orchestrator/templates`

Create a new template.

**Request Body:**
```json
{
  "name": "Affiliate Campaign Starter",
  "type": "affiliate_campaign",
  "category": "marketing",
  "pipelineConfig": { "targetPlatforms": ["instagram"] },
  "steps": [...],
  "estimatedCredits": 25,
  "estimatedDurationMs": 120000,
  "tags": ["affiliate", "starter"]
}
```

**Required Fields:** `name`, `type`

**Response (201):** Created template object.

#### `GET /api/orchestrator/templates/[id]`

Get a specific template.

**Response (200):** Template object.

#### `PUT /api/orchestrator/templates/[id]`

Update a template.

**Request Body:** Partial template fields to update.

**Response (200):** Updated template object.

#### `DELETE /api/orchestrator/templates/[id]`

Delete a template.

**Response (200):**
```json
{ "success": true, "data": { "deleted": true } }
```

#### `POST /api/orchestrator/templates/[id]/execute`

Execute a template, creating a pipeline and execution.

**Request Body:**
```json
{
  "input": { "product": "Widget Pro" }
}
```

**Response (201):** Created execution object.

---

### 8. Automation Rules

#### `GET /api/orchestrator/rules`

List rules for the current user.

**Query Parameters:**
| Parameter     | Type    | Default | Description              |
|---------------|---------|---------|--------------------------|
| `page`        | number  | 1       | Page number              |
| `limit`       | number  | 20      | Items per page           |
| `triggerType` | string  | -       | Filter by trigger type   |
| `isEnabled`   | boolean | -       | Filter by enabled state  |

**Response (200):** Paginated list of rule objects.

#### `POST /api/orchestrator/rules`

Create a new automation rule.

**Request Body:**
```json
{
  "name": "Auto-publish on completion",
  "triggerType": "pipeline_complete",
  "conditions": [
    { "field": "execution.status", "operator": "eq", "value": "completed" }
  ],
  "actions": [
    { "type": "execute_pipeline", "config": { "templateId": "tmpl_xxx" } }
  ]
}
```

**Required Fields:** `name`, `triggerType`

**Response (201):** Created rule object.

#### `GET /api/orchestrator/rules/[id]`

Get a specific rule.

**Response (200):** Rule object.

#### `PUT /api/orchestrator/rules/[id]`

Update a rule.

**Request Body:** Partial rule fields to update.

**Response (200):** Updated rule object.

#### `DELETE /api/orchestrator/rules/[id]`

Delete a rule.

**Response (200):**
```json
{ "success": true, "data": { "deleted": true } }
```

#### `POST /api/orchestrator/rules/[id]/toggle`

Toggle a rule's enabled state.

**Response (200):** Updated rule object with flipped `isEnabled`.

---

### 9. Resource Estimation

#### `POST /api/orchestrator/estimate`

Estimate resources for a pipeline.

**Request Body:**
```json
{
  "pipelineId": "pipe_xxx"
}
```

**Required Fields:** `pipelineId`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCredits": 42,
    "totalDurationMs": 185000,
    "stepCount": 5,
    "steps": [
      {
        "stepId": "step_xxx",
        "name": "Generate Images",
        "moduleType": "image_generation",
        "action": "generate",
        "estimatedCredits": 5,
        "estimatedDurationMs": 30000
      }
    ]
  }
}
```

---

### 10. Statistics

#### `GET /api/orchestrator/stats`

Get aggregated orchestrator statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pipelines": {
      "totalPipelines": 15,
      "activePipelines": 8,
      "totalExecutions": 42,
      "runningExecutions": 3,
      "totalSteps": 35,
      "templates": 10
    },
    "queue": {
      "total": 5,
      "waiting": 3,
      "processing": 2
    },
    "rules": {
      "total": 7,
      "enabled": 5,
      "disabled": 2
    }
  }
}
```

---

### 11. Settings

#### `GET /api/orchestrator/settings`

Get the current user's orchestrator settings.

**Response (200):** Settings object or `null` if not yet configured.

#### `POST /api/orchestrator/settings`

Create or update (upsert) orchestrator settings.

**Request Body:**
```json
{
  "maxConcurrentExecutions": 5,
  "maxQueueSize": 100,
  "maxRetries": 5,
  "autoRetry": true,
  "creditWarningThreshold": 200,
  "defaultPriority": "normal",
  "allowedModules": ["image_generation", "video_generation", "text_generation"]
}
```

**Response (201):** Created or updated settings object.

---

## Endpoint Summary

| Method | Path                                    | Description                    |
|--------|-----------------------------------------|--------------------------------|
| POST   | `/api/orchestrator/analyze`             | Analyze intent from text       |
| GET    | `/api/orchestrator`                     | List pipelines                 |
| POST   | `/api/orchestrator`                     | Create pipeline                |
| GET    | `/api/orchestrator/[id]`                | Get pipeline with steps        |
| PUT    | `/api/orchestrator/[id]`                | Update pipeline                |
| DELETE | `/api/orchestrator/[id]`                | Delete pipeline                |
| GET    | `/api/orchestrator/[id]/steps`          | List pipeline steps            |
| POST   | `/api/orchestrator/[id]/steps`          | Add step to pipeline           |
| PUT    | `/api/orchestrator/[id]/steps/[stepId]` | Update step                    |
| DELETE | `/api/orchestrator/[id]/steps/[stepId]` | Delete step                    |
| POST   | `/api/orchestrator/[id]/execute`        | Execute pipeline               |
| GET    | `/api/orchestrator/executions`          | List executions                |
| GET    | `/api/orchestrator/executions/[id]`     | Get execution with tasks       |
| POST   | `/api/orchestrator/executions/[id]/cancel` | Cancel execution           |
| GET    | `/api/orchestrator/tasks`               | List tasks                     |
| GET    | `/api/orchestrator/tasks/[id]`          | Get task                       |
| PUT    | `/api/orchestrator/tasks/[id]`          | Update task                    |
| POST   | `/api/orchestrator/tasks/[id]/retry`    | Retry task                     |
| POST   | `/api/orchestrator/tasks/[id]/cancel`   | Cancel task                    |
| GET    | `/api/orchestrator/queue`               | List queue items               |
| POST   | `/api/orchestrator/queue`               | Enqueue task                   |
| DELETE | `/api/orchestrator/queue/[id]`          | Remove from queue              |
| PUT    | `/api/orchestrator/queue/[id]/priority` | Update queue priority          |
| GET    | `/api/orchestrator/templates`           | List templates                 |
| POST   | `/api/orchestrator/templates`           | Create template                |
| GET    | `/api/orchestrator/templates/[id]`      | Get template                   |
| PUT    | `/api/orchestrator/templates/[id]`      | Update template                |
| DELETE | `/api/orchestrator/templates/[id]`      | Delete template                |
| POST   | `/api/orchestrator/templates/[id]/execute` | Execute template            |
| GET    | `/api/orchestrator/rules`               | List automation rules          |
| POST   | `/api/orchestrator/rules`               | Create rule                    |
| GET    | `/api/orchestrator/rules/[id]`          | Get rule                       |
| PUT    | `/api/orchestrator/rules/[id]`          | Update rule                    |
| DELETE | `/api/orchestrator/rules/[id]`          | Delete rule                    |
| POST   | `/api/orchestrator/rules/[id]/toggle`   | Toggle rule enabled state      |
| POST   | `/api/orchestrator/estimate`            | Estimate pipeline resources    |
| GET    | `/api/orchestrator/stats`               | Get aggregate statistics       |
| GET    | `/api/orchestrator/settings`            | Get user settings              |
| POST   | `/api/orchestrator/settings`            | Upsert user settings           |
