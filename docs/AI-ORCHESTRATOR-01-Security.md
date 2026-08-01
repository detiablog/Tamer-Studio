# AI Orchestrator - Security

## Overview

The AI Orchestrator implements a multi-layered security model covering user authentication, data isolation, credit validation, workflow authorization, and audit logging. All API endpoints require authentication and operate within the context of a single user session.

## User Isolation

### Per-User Data Boundaries

Every database table in the orchestrator schema includes a `userId` field. All queries are scoped to the authenticated user's ID, preventing cross-user data access.

| Table                  | Isolation Field | Enforcement                     |
|------------------------|-----------------|---------------------------------|
| `orchestrator_pipeline`     | `userId`    | All CRUD operations             |
| `orchestrator_execution`    | `userId`    | All CRUD operations             |
| `orchestrator_task`         | `userId`    | All CRUD operations             |
| `orchestrator_queue`        | `userId`    | All CRUD operations             |
| `orchestrator_rule`         | `userId`    | All CRUD operations             |
| `orchestrator_settings`     | `userId`    | Unique constraint (one per user)|
| `orchestrator_template`     | N/A         | System-wide (no user scoping)   |
| `orchestrator_pipeline_step`| N/A         | Scoped via parent pipeline      |

### Query-Level Isolation

All list operations include a `userId` filter:

```typescript
const conditions = [eq(orchestratorPipeline.userId, userId)];
// ... additional filters
const pipelines = await db
  .select()
  .from(orchestratorPipeline)
  .where(and(...conditions));
```

This pattern is consistently applied across all services:
- `PipelineBuilderService.listPipelines(userId, ...)`
- `PipelineBuilderService.listExecutions(userId, ...)`
- `TaskSchedulerService.listTasks(userId, ...)`
- `QueueManagerService.listQueue(userId, ...)`
- `AutomationRulesService.listRules(userId, ...)`
- `OrchestratorSettingsService.getSettings(userId)`

### Template Exception

The `orchestrator_template` table is not user-scoped. Templates are shared across all users (system templates have `isSystem: true`). Individual users cannot delete system templates. User-created templates are visible to all users but owned by the creator.

## Authentication

### Middleware Chain

Every API endpoint runs the `userAuthentication()` middleware before processing:

```typescript
const middlewareError = await runMiddleware([userAuthentication()], ctx);
if (middlewareError) return middlewareError;

const userId = ctx.state.userSession?.userId;
if (!userId) {
  return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
}
```

### Session Validation

The middleware validates the session token and populates `ctx.state.userSession` with:
- `userId`: The authenticated user's ID
- Additional session metadata

### Unauthenticated Requests

All endpoints return `401 Unauthorized` when:
- No session token is provided
- The session token is invalid or expired
- The user ID cannot be extracted from the session

## Credit Validation

### Pre-Execution Estimation

Before executing a pipeline, the system calculates resource estimates:

```typescript
const estimate = await resourceEstimatorService.estimatePipeline(id);
```

This estimate is stored on the execution record:
- `estimatedCredits`: Total credits the execution will consume
- `estimatedDurationMs`: Total estimated duration

### Credit Tracking During Execution

Each task tracks its own credit consumption:
```typescript
task.creditsUsed = moduleCreditsConsumed;
execution.creditsUsed = sum(task.creditsUsed for all tasks);
```

### Credit Warning Threshold

The `creditWarningThreshold` setting (default: 100) alerts users when estimated credits exceed the threshold. This is enforced at the API level before execution creation.

### Module Cost Table

The Resource Estimator uses a fixed cost table:

| Module Type           | Credits |
|-----------------------|---------|
| `video_generation`    | 25      |
| `audio_generation`    | 10      |
| `image_generation`    | 5       |
| `content_optimization`| 4       |
| `trend_analysis`      | 3       |
| `text_generation`     | 2       |
| `data_collection`     | 2       |
| `analytics`           | 2       |
| `publishing`          | 1       |

## Workflow Authorization

### Pipeline Ownership

Users can only:
- View their own pipelines
- Create pipelines under their own userId
- Update their own pipelines
- Delete their own pipelines (which cascades to their steps)
- Execute their own pipelines
- View executions of their own pipelines

### Task and Queue Isolation

Tasks and queue items are scoped to the user through:
1. Direct `userId` field on task records
2. Queue items linked to user-scoped tasks
3. All list operations filter by `userId`

### Settings Isolation

Each user has exactly one settings record (enforced by unique constraint):
```sql
UNIQUE on user_id (orch_settings_user_unique)
```

The upsert pattern ensures no duplicate settings:
```typescript
const existing = await this.getSettings(userId);
if (existing) {
  // Update
} else {
  // Insert
}
```

## Audit Logging

### Execution Audit Trail

Every execution records:
- `createdAt`: When the execution was created
- `startedAt`: When processing began
- `completedAt`: When processing finished
- `triggerType`: How the execution was initiated
- `creditsUsed`: Actual resource consumption
- `error`: Failure reason (if applicable)

### Task Audit Trail

Each task records:
- `createdAt`, `startedAt`, `completedAt`: Lifecycle timestamps
- `attempts`: Number of execution attempts
- `creditsUsed`: Resource consumption
- `error`: Failure reason (if applicable)

### Rule Execution Tracking

Automation rules track:
- `executionCount`: Total times the rule has fired
- `lastTriggeredAt`: Timestamp of the last trigger

### Pipeline Versioning

All pipeline changes update the `updatedAt` timestamp, providing a basic versioning mechanism.

## Input Validation

### Required Field Validation

API endpoints validate required fields before processing:

```typescript
if (!body.name || !body.type) {
  return NextResponse.json(
    errorResponse("VALIDATION_ERROR", "name and type are required"),
    { status: 400 }
  );
}
```

### Type Validation

The database schema enforces type constraints through Drizzle ORM column definitions:
- `varchar(N)` fields enforce maximum length
- `integer` fields reject non-numeric values
- `boolean` fields accept only true/false
- `jsonb` fields accept structured data
- `NOT NULL` constraints prevent missing required data

### Error Handling

All endpoints use `mapErrorToResponse()` to convert unexpected errors into safe response objects:

```typescript
} catch (error) {
  return mapErrorToResponse(error);
}
```

This prevents internal error details from leaking to clients.

## Security Considerations

### Current Limitations

1. **No rate limiting on orchestrator endpoints**: Rate limiting is handled at the middleware level but not specific to orchestrator routes
2. **No CSRF protection on API routes**: API routes rely on session-based authentication rather than CSRF tokens
3. **Template visibility**: All templates are visible to all users, which may expose business logic
4. **No input sanitization for JSON fields**: JSON config fields accept arbitrary structures

### Recommended Enhancements

1. Add rate limiting per user for execution creation
2. Implement CSRF protection for state-changing operations
3. Add role-based access control for system templates
4. Validate JSON config schemas against known module schemas
5. Add IP-based anomaly detection for unusual execution patterns
