# AI Orchestrator - Database Design

## Overview

The AI Orchestrator uses 8 PostgreSQL tables managed via Drizzle ORM. All tables are defined in `src/lib/db/schema/orchestrator.ts`.

## Entity-Relationship Diagram

```
orchestrator_pipeline (1) ---< (N) orchestrator_pipeline_step
orchestrator_pipeline (1) ---< (N) orchestrator_execution
orchestrator_execution (1) ---< (N) orchestrator_task
orchestrator_task (1) ---< (1) orchestrator_queue
orchestrator_template (standalone)
orchestrator_rule (standalone)
orchestrator_settings (one per user, standalone)
```

## Table 1: orchestrator_pipeline

Stores pipeline definitions.

| Field          | Type         | Nullable | Default       | Description                          |
|----------------|--------------|----------|---------------|--------------------------------------|
| `id`           | text (PK)    | no       | -             | `pipe_{ts}_{random}`                 |
| `userId`       | text         | no       | -             | Owner user ID                        |
| `name`         | varchar(200) | no       | -             | Display name                         |
| `description`  | text         | yes      | null          | Optional description                 |
| `type`         | varchar(100) | no       | -             | Pipeline type (intent type)          |
| `status`       | varchar(50)  | no       | `"draft"`     | draft, active, paused, archived      |
| `triggerType`  | varchar(50)  | yes      | null          | manual, scheduled, event, template   |
| `triggerConfig`| jsonb        | no       | `{}`          | Trigger configuration                |
| `config`       | jsonb        | no       | `{}`          | Pipeline-level configuration         |
| `tags`         | jsonb        | no       | `[]`          | Classification tags (string array)   |
| `isTemplate`   | boolean      | no       | `false`       | Whether this is a reusable template  |
| `isActive`     | boolean      | no       | `true`        | Soft delete flag                     |
| `metadata`     | jsonb        | no       | `{}`          | Extensible metadata                  |
| `createdAt`    | timestamp    | no       | `now()`       | Creation timestamp                   |
| `updatedAt`    | timestamp    | no       | `now()`       | Last update timestamp (auto)         |

**Indexes:**
- `orch_pipeline_user_idx` on `userId`
- `orch_pipeline_type_idx` on `type`
- `orch_pipeline_status_idx` on `status`

## Table 2: orchestrator_pipeline_step

Stores ordered steps within pipelines.

| Field          | Type            | Nullable | Default | Description                          |
|----------------|-----------------|----------|---------|--------------------------------------|
| `id`           | text (PK)       | no       | -       | `step_{ts}_{random}`                 |
| `pipelineId`   | text            | no       | -       | Parent pipeline FK                   |
| `name`         | varchar(200)    | no       | -       | Display name                         |
| `moduleType`   | varchar(100)    | no       | -       | Target AI module type                |
| `action`       | varchar(100)    | no       | -       | Module action                        |
| `order`        | integer         | no       | -       | Execution order (0-indexed)          |
| `config`       | jsonb           | no       | `{}`    | Module-specific config               |
| `inputMapping` | jsonb           | no       | `{}`    | Maps context keys to input keys      |
| `outputKey`    | varchar(100)    | yes      | null    | Key for output in context            |
| `conditions`   | jsonb           | no       | `{}`    | Execution conditions                 |
| `retryConfig`  | jsonb           | no       | `{}`    | Retry configuration                  |
| `timeoutMs`    | integer         | yes      | null    | Step timeout in milliseconds         |
| `isActive`     | boolean         | no       | `true`  | Can be deactivated                   |
| `metadata`     | jsonb           | no       | `{}`    | Extensible metadata                  |
| `createdAt`    | timestamp       | no       | `now()` | Creation timestamp                   |
| `updatedAt`    | timestamp       | no       | `now()` | Last update timestamp (auto)         |

**Indexes:**
- `orch_step_pipeline_idx` on `pipelineId`
- `orch_step_order_idx` on `order`

## Table 3: orchestrator_execution

Stores runtime execution instances.

| Field                | Type         | Nullable | Default       | Description                          |
|----------------------|--------------|----------|---------------|--------------------------------------|
| `id`                 | text (PK)    | no       | -             | `exec_{ts}_{random}`                 |
| `userId`             | text         | no       | -             | Owner user ID                        |
| `pipelineId`         | text         | no       | -             | Parent pipeline FK                   |
| `status`             | varchar(50)  | no       | `"pending"`   | pending, running, completed, failed, cancelled |
| `triggerType`        | varchar(50)  | yes      | null          | How execution was initiated          |
| `input`              | jsonb        | no       | `{}`          | Execution input parameters           |
| `output`             | jsonb        | no       | `{}`          | Aggregated output                    |
| `error`              | text         | yes      | null          | Error message on failure             |
| `progress`           | integer      | no       | `0`           | 0-100 completion percentage          |
| `currentStep`        | varchar(200) | yes      | null          | Currently executing step name        |
| `completedSteps`     | integer      | no       | `0`           | Number of completed steps            |
| `totalSteps`         | integer      | no       | `0`           | Total steps in pipeline              |
| `creditsUsed`        | integer      | no       | `0`           | Actual credits consumed              |
| `storageUsed`        | integer      | no       | `0`           | Storage bytes consumed               |
| `estimatedCredits`   | integer      | no       | `0`           | Pre-execution estimate               |
| `estimatedDurationMs`| integer      | no       | `0`           | Pre-execution estimate               |
| `startedAt`          | timestamp    | yes      | null          | When execution began                 |
| `completedAt`        | timestamp    | yes      | null          | When execution finished              |
| `metadata`           | jsonb        | no       | `{}`          | Extensible metadata                  |
| `createdAt`          | timestamp    | no       | `now()`       | Creation timestamp                   |
| `updatedAt`          | timestamp    | no       | `now()`       | Last update timestamp (auto)         |

**Indexes:**
- `orch_exec_user_idx` on `userId`
- `orch_exec_pipeline_idx` on `pipelineId`
- `orch_exec_status_idx` on `status`

## Table 4: orchestrator_task

Stores atomic work units within executions.

| Field          | Type         | Nullable | Default       | Description                          |
|----------------|--------------|----------|---------------|--------------------------------------|
| `id`           | text (PK)    | no       | -             | Auto-generated                       |
| `executionId`  | text         | no       | -             | Parent execution FK                  |
| `stepId`       | text         | yes      | null          | Source pipeline step FK              |
| `userId`       | text         | no       | -             | Owner user ID                        |
| `name`         | varchar(200) | no       | -             | Display name                         |
| `moduleType`   | varchar(100) | no       | -             | Target AI module type                |
| `action`       | varchar(100) | no       | -             | Module action                        |
| `status`       | varchar(50)  | no       | `"pending"`   | pending, processing, completed, failed, cancelled |
| `priority`     | varchar(50)  | no       | `"normal"`    | critical, high, normal, low          |
| `input`        | jsonb        | no       | `{}`          | Task input parameters                |
| `output`       | jsonb        | no       | `{}`          | Task output                          |
| `error`        | text         | yes      | null          | Error message on failure             |
| `progress`     | integer      | no       | `0`           | 0-100 completion percentage          |
| `attempts`     | integer      | no       | `0`           | Current attempt count                |
| `maxAttempts`  | integer      | no       | `3`           | Maximum allowed attempts             |
| `creditsUsed`  | integer      | no       | `0`           | Credits consumed                     |
| `startedAt`    | timestamp    | yes      | null          | When processing began                |
| `completedAt`  | timestamp    | yes      | null          | When finished                        |
| `scheduledAt`  | timestamp    | yes      | null          | When scheduled for execution         |
| `metadata`     | jsonb        | no       | `{}`          | Extensible metadata                  |
| `createdAt`    | timestamp    | no       | `now()`       | Creation timestamp                   |
| `updatedAt`    | timestamp    | no       | `now()`       | Last update timestamp (auto)         |

**Indexes:**
- `orch_task_exec_idx` on `executionId`
- `orch_task_user_idx` on `userId`
- `orch_task_status_idx` on `status`
- `orch_task_priority_idx` on `priority`

## Table 5: orchestrator_queue

Priority queue with positional ordering.

| Field              | Type         | Nullable | Default       | Description                          |
|--------------------|--------------|----------|---------------|--------------------------------------|
| `id`               | text (PK)    | no       | -             | `q_{ts}_{random}`                    |
| `userId`           | text         | no       | -             | Queue owner                          |
| `taskId`           | text         | no       | -             | Task FK                              |
| `status`           | varchar(50)  | no       | `"waiting"`   | waiting, processing, completed, failed |
| `priority`         | varchar(50)  | no       | `"normal"`    | critical, high, normal, low          |
| `position`         | integer      | no       | -             | Position in queue                    |
| `estimatedCredits` | integer      | no       | `0`           | Cost estimate                        |
| `metadata`         | jsonb        | no       | `{}`          | Extensible metadata                  |
| `createdAt`        | timestamp    | no       | `now()`       | Creation timestamp                   |
| `updatedAt`        | timestamp    | no       | `now()`       | Last update timestamp (auto)         |

**Indexes:**
- `orch_queue_user_idx` on `userId`
- `orch_queue_status_idx` on `status`
- `orch_queue_priority_idx` on `priority`
- `orch_queue_position_idx` on `position`

## Table 6: orchestrator_template

Reusable pipeline blueprints.

| Field                | Type            | Nullable | Default | Description                          |
|----------------------|-----------------|----------|---------|--------------------------------------|
| `id`                 | text (PK)       | no       | -       | `tmpl_{ts}_{random}`                 |
| `name`               | varchar(200)    | no       | -       | Display name                         |
| `description`        | text            | yes      | null    | Optional description                 |
| `type`               | varchar(100)    | no       | -       | Template type (intent type)          |
| `category`           | varchar(100)    | yes      | null    | Organizational category              |
| `icon`               | varchar(100)    | yes      | null    | UI icon identifier                   |
| `pipelineConfig`     | jsonb           | no       | `{}`    | Default pipeline configuration       |
| `steps`              | jsonb           | no       | `[]`    | Step definitions array               |
| `estimatedCredits`   | integer         | no       | `0`     | Pre-calculated cost                  |
| `estimatedDurationMs`| integer         | no       | `0`     | Pre-calculated duration              |
| `tags`               | jsonb           | no       | `[]`    | Classification tags                  |
| `isSystem`           | boolean         | no       | `false` | System templates cannot be deleted   |
| `isActive`           | boolean         | no       | `true`  | Visibility flag                      |
| `usageCount`         | integer         | no       | `0`     | Incremented on each use              |
| `metadata`           | jsonb           | no       | `{}`    | Extensible metadata                  |
| `createdAt`          | timestamp       | no       | `now()` | Creation timestamp                   |
| `updatedAt`          | timestamp       | no       | `now()` | Last update timestamp (auto)         |

**Indexes:**
- `orch_template_type_idx` on `type`
- `orch_template_category_idx` on `category`

## Table 7: orchestrator_rule

Event-driven automation rules.

| Field           | Type         | Nullable | Default | Description                          |
|-----------------|--------------|----------|---------|--------------------------------------|
| `id`            | text (PK)    | no       | -       | `rule_{ts}_{random}`                 |
| `userId`        | text         | no       | -       | Rule owner                           |
| `name`          | varchar(200) | no       | -       | Display name                         |
| `description`   | text         | yes      | null    | Optional description                 |
| `triggerType`   | varchar(100) | no       | -       | Event type trigger                   |
| `triggerConfig` | jsonb        | no       | `{}`    | Trigger-specific configuration       |
| `conditions`    | jsonb        | no       | `[]`    | Array of condition objects           |
| `actions`       | jsonb        | no       | `[]`    | Array of action objects              |
| `isEnabled`     | boolean      | no       | `true`  | Whether rule is active               |
| `executionCount`| integer      | no       | `0`     | Total times rule has fired           |
| `lastTriggeredAt`| timestamp   | yes      | null    | Last fire time                       |
| `metadata`      | jsonb        | no       | `{}`    | Extensible metadata                  |
| `createdAt`     | timestamp    | no       | `now()` | Creation timestamp                   |
| `updatedAt`     | timestamp    | no       | `now()` | Last update timestamp (auto)         |

**Indexes:**
- `orch_rule_user_idx` on `userId`
- `orch_rule_trigger_idx` on `triggerType`
- `orch_rule_enabled_idx` on `isEnabled`

## Table 8: orchestrator_settings

Per-user orchestrator configuration.

| Field                      | Type         | Nullable | Default       | Description                    |
|----------------------------|--------------|----------|---------------|--------------------------------|
| `id`                       | text (PK)    | no       | -             | `set_{ts}_{random}`            |
| `userId`                   | text         | no       | -             | Owner user ID (unique)         |
| `maxConcurrentExecutions`  | integer      | no       | `3`           | Max simultaneous executions    |
| `maxQueueSize`             | integer      | no       | `50`          | Max queue items per user       |
| `maxRetries`               | integer      | no       | `3`           | Default retry count            |
| `autoRetry`                | boolean      | no       | `true`        | Enable auto-retry              |
| `autoOptimize`             | boolean      | no       | `true`        | Enable auto-optimization       |
| `notificationsEnabled`     | boolean      | no       | `true`        | Send notifications             |
| `creditWarningThreshold`   | integer      | no       | `100`         | Credit warning threshold       |
| `defaultPriority`          | varchar(50)  | no       | `"normal"`    | Default task priority          |
| `allowedModules`           | jsonb        | no       | `[]`          | Allowed module types           |
| `metadata`                 | jsonb        | no       | `{}`          | Extensible metadata            |
| `createdAt`                | timestamp    | no       | `now()`       | Creation timestamp             |
| `updatedAt`                | timestamp    | no       | `now()`       | Last update timestamp (auto)   |

**Indexes:**
- `orch_settings_user_idx` on `userId`
- `orch_settings_user_unique` UNIQUE on `userId` (enforces one settings record per user)

## Relations

| Relation                      | Parent            | Child                | Type   |
|-------------------------------|-------------------|----------------------|--------|
| `orchestratorPipelineRelations`    | pipeline          | pipelineStep         | one-to-many |
| `orchestratorPipelineStepRelations`| pipelineStep      | pipeline             | many-to-one |
| `orchestratorExecutionRelations`   | execution         | pipeline             | many-to-one |
| `orchestratorExecutionRelations`   | execution         | task                 | one-to-many |
| `orchestratorTaskRelations`        | task              | execution            | many-to-one |
| `orchestratorQueueRelations`       | queue             | task                 | many-to-one |
