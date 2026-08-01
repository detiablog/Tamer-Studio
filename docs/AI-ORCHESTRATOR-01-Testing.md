# AI Orchestrator - Testing Guide

## Overview

This document outlines the testing strategy for the AI Orchestrator system, covering test coverage areas, API endpoint testing, service layer testing, and recommended test patterns.

## Test Configuration

The project uses Vitest as the test framework (configured in `vitest.config.ts`). Tests are located under `src/test/`.

## Test Coverage Areas

### 1. Intent Analyzer Service

**File:** `src/core/orchestrator/intent-analyzer.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `analyzeIntent - affiliate campaign`   | Verify affiliate-related keywords produce correct intent |
| `analyzeIntent - video creation`       | Verify video-related keywords produce correct intent |
| `analyzeIntent - unknown intent`       | Verify unrelated input returns "unknown" with 0% confidence |
| `analyzeIntent - confidence calculation` | Verify confidence = (matches / total) * 100, capped at 95 |
| `analyzeIntent - platform extraction`  | Verify regex extracts tiktok, instagram, youtube, etc. |
| `analyzeIntent - count extraction`     | Verify regex extracts "5 images" -> {count: 5, contentType: "image"} |
| `analyzeIntent - template suggestion`  | Verify most-used matching template is suggested |
| `analyzeIntent - recommended modules`  | Verify correct module list for each intent type |
| `getIntentLabel`                       | Verify human-readable labels for all intent types |

### 2. Pipeline Builder Service

**File:** `src/core/orchestrator/pipeline-builder.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `createPipeline`                       | Verify pipeline creation with required fields    |
| `listPipelines - pagination`           | Verify page/limit pagination works correctly     |
| `listPipelines - status filter`        | Verify status filtering returns correct subset   |
| `listPipelines - type filter`          | Verify type filtering returns correct subset     |
| `getPipeline`                          | Verify retrieval by ID returns correct pipeline  |
| `getPipeline - not found`              | Verify null return for nonexistent ID            |
| `updatePipeline`                       | Verify partial updates preserve existing fields  |
| `deletePipeline`                       | Verify cascade delete of steps                   |
| `addStep`                              | Verify step creation with order, moduleType, action |
| `listSteps - ordering`                 | Verify steps returned in `order` ascending       |
| `updateStep`                           | Verify step field updates                        |
| `deleteStep`                           | Verify step removal from pipeline                |
| `createExecution`                      | Verify execution creation with correct totalSteps|
| `listExecutions - pagination`          | Verify paginated execution list                  |
| `getExecution - with tasks`            | Verify execution includes associated tasks       |
| `cancelExecution`                      | Verify status set to "cancelled" with timestamps |
| `getStats`                             | Verify aggregate counts are correct              |
| `listTemplates`                        | Verify templates ordered by usageCount           |
| `createTemplate`                       | Verify template creation                         |
| `executeTemplate`                      | Verify pipeline + execution creation from template|
| `executeTemplate - usageCount`         | Verify usageCount incremented on execution       |

### 3. Task Scheduler Service

**File:** `src/core/orchestrator/task-scheduler.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `listTasks - pagination`               | Verify paginated task list                       |
| `listTasks - status filter`            | Verify status filtering                          |
| `listTasks - executionId filter`       | Verify execution-scoped filtering                |
| `getTask`                              | Verify task retrieval by ID                      |
| `updateTask`                           | Verify field updates                             |
| `retryTask`                            | Verify status reset, attempts increment, error cleared |
| `retryTask - not found`                | Verify null return for nonexistent ID            |
| `cancelTask`                           | Verify status set to "cancelled"                 |

### 4. Queue Manager Service

**File:** `src/core/orchestrator/queue-manager.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `enqueue`                              | Verify position assignment and task linking      |
| `listQueue - position ordering`        | Verify items ordered by position ascending       |
| `listQueue - status filter`            | Verify status filtering                          |
| `removeFromQueue`                      | Verify hard delete of queue item                 |
| `updatePriority`                       | Verify priority field update                     |
| `getStats`                             | Verify total/waiting/processing counts           |

### 5. Automation Rules Service

**File:** `src/core/orchestrator/automation-rules.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `createRule`                           | Verify rule creation with trigger/conditions/actions |
| `listRules - pagination`               | Verify paginated rule list                       |
| `listRules - triggerType filter`       | Verify trigger type filtering                    |
| `listRules - isEnabled filter`         | Verify enabled state filtering                   |
| `getRule`                              | Verify rule retrieval by ID                      |
| `updateRule`                           | Verify field updates                             |
| `deleteRule`                           | Verify permanent deletion                        |
| `toggleRule`                           | Verify isEnabled flip                            |
| `getStats`                             | Verify total/enabled/disabled counts             |

### 6. Resource Estimator Service

**File:** `src/core/orchestrator/resource-estimator.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `estimatePipeline`                     | Verify total credits = sum of step credits       |
| `estimatePipeline - duration`          | Verify total duration = sum of step durations    |
| `estimatePipeline - unknown module`    | Verify default credits (2) and duration (10000ms)|
| `estimateModuleCredits`                | Verify correct credit lookup per module type     |
| `estimateModuleDuration`               | Verify correct duration lookup per module type   |

### 7. Settings Service

**File:** `src/core/orchestrator/settings.service.ts`

| Test Case                              | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `getSettings`                          | Verify settings retrieval by userId              |
| `getSettings - not found`              | Verify null return for unconfigured user         |
| `upsertSettings - create`              | Verify new settings creation                     |
| `upsertSettings - update`              | Verify existing settings update                  |

## API Endpoint Testing

### Authentication Tests

| Test                                      | Expected Result      |
|-------------------------------------------|----------------------|
| Request without session token             | 401 Unauthorized     |
| Request with invalid session token        | 401 Unauthorized     |
| Request with valid session token          | 200/201 Success      |

### Validation Tests

| Endpoint              | Missing Required Fields | Expected Result     |
|-----------------------|-------------------------|---------------------|
| `POST /analyze`       | `input`                 | 400 Validation Error|
| `POST /`              | `name`, `type`          | 400 Validation Error|
| `POST /[id]/steps`    | `name`, `moduleType`, `action`, `order` | 400 Validation Error |
| `POST /queue`         | `taskId`                | 400 Validation Error|
| `POST /rules`         | `name`, `triggerType`   | 400 Validation Error|
| `POST /estimate`      | `pipelineId`            | 400 Validation Error|
| `PUT /queue/[id]/priority` | `priority`         | 400 Validation Error|

### CRUD Tests

Each resource endpoint should be tested for:

1. **Create**: Verify 201 response with created object
2. **Read**: Verify 200 response with correct data
3. **Update**: Verify 200 response with updated fields
4. **Delete**: Verify 200 response with `{ deleted: true }`
5. **Not Found**: Verify 404 response for nonexistent resources

### Pagination Tests

Paginated endpoints should verify:

1. Default page (1) and limit (20)
2. Custom page/limit parameters
3. Total count accuracy
4. Correct offset calculation
5. Empty results for out-of-range pages

## Test Execution

### Running Tests

```bash
# Run all tests
pnpm test

# Run orchestrator-specific tests
pnpm test -- --grep "orchestrator"

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

### Test File Organization

```
src/test/
  unit/
    orchestrator/
      intent-analyzer.test.ts
      pipeline-builder.test.ts
      task-scheduler.test.ts
      queue-manager.test.ts
      automation-rules.test.ts
      resource-estimator.test.ts
      settings.test.ts
    jobs/
      retry-queue.test.ts
      dead-letter-queue.test.ts
  integration/
    orchestrator/
      api-endpoints.test.ts
      pipeline-execution.test.ts
```

## Mocking Strategy

### Database Mocking

All services depend on `db` from `@/lib/db`. Tests should mock the database layer:

```typescript
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### Service Mocking

Services that depend on other services can be mocked:

```typescript
vi.mock("@/core/orchestrator/resource-estimator.service", () => ({
  resourceEstimatorService: {
    estimatePipeline: vi.fn().mockResolvedValue({
      totalCredits: 10,
      totalDurationMs: 60000,
      stepCount: 2,
      steps: [],
    }),
  },
}));
```

## Coverage Targets

| Component              | Target Coverage |
|------------------------|-----------------|
| Intent Analyzer        | 90%             |
| Pipeline Builder       | 85%             |
| Task Scheduler         | 90%             |
| Queue Manager          | 85%             |
| Automation Rules       | 85%             |
| Resource Estimator     | 95%             |
| Settings Service       | 90%             |
| API Endpoints          | 80%             |
| **Overall**            | **85%**         |
