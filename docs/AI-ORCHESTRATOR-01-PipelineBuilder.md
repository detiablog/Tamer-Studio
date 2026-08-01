# AI Orchestrator - Pipeline Builder

## Overview

The Pipeline Builder is the largest service in the orchestrator system. It manages the full lifecycle of pipelines, pipeline steps, executions, and templates. It provides CRUD operations, pagination, filtering, template instantiation, and statistics aggregation.

- Source: `src/core/orchestrator/pipeline-builder.service.ts`
- API: See [API Endpoints](AI-ORCHESTRATOR-01-API.md)

## Pipeline Structure

A pipeline is a named, typed workflow definition containing an ordered sequence of steps.

```
Pipeline
  |-- id: string           (pipe_{timestamp}_{random})
  |-- userId: string       (owner)
  |-- name: string         (display name, max 200 chars)
  |-- description: text    (optional)
  |-- type: string         (e.g., "affiliate_campaign", "video_creation")
  |-- status: string       ("draft" | "active" | "paused" | "archived")
  |-- triggerType: string  (optional: "manual" | "scheduled" | "event" | "template")
  |-- triggerConfig: JSON  (trigger-specific configuration)
  |-- config: JSON         (pipeline-level configuration)
  |-- tags: string[]       (classification tags)
  |-- isTemplate: boolean  (true if this pipeline is a reusable template)
  |-- isActive: boolean    (soft delete flag)
  |-- metadata: JSON       (extensible metadata)
  |
  +-- Steps[]              (ordered step definitions)
  +-- Executions[]         (runtime execution instances)
```

### ID Generation

Pipeline IDs follow the format `pipe_{Date.now()}_{random7chars}`:
```typescript
const id = `pipe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
```

### Status Flow

```
draft -> active -> paused -> archived
  |       |
  v       v
deleted   (via deletePipeline)
```

## Step Configuration

Each pipeline step defines a single unit of work within the pipeline.

```
Step
  |-- id: string           (step_{timestamp}_{random})
  |-- pipelineId: string   (parent pipeline)
  |-- name: string         (display name, max 200 chars)
  |-- moduleType: string   (target AI module, e.g., "image_generation")
  |-- action: string       (specific action within the module)
  |-- order: integer       (execution order, 0-indexed)
  |-- config: JSON         (module-specific configuration)
  |-- inputMapping: JSON   (maps pipeline context keys to step input keys)
  |-- outputKey: string    (key to store this step's output under)
  |-- conditions: JSON     (execution conditions - skip if not met)
  |-- retryConfig: JSON    (retry configuration: maxAttempts, delay, backoff)
  |-- timeoutMs: integer   (step timeout in milliseconds)
  |-- isActive: boolean    (can be deactivated without deletion)
  |-- metadata: JSON       (extensible metadata)
```

### Input Mapping

The `inputMapping` field maps keys from the pipeline's accumulated context to the step's input parameters:

```json
{
  "productImages": "images",
  "trendData": "trends"
}
```

This means: pass the pipeline context's `productImages` as `images` to this step, and `trendData` as `trends`.

### Output Key

The `outputKey` field determines where the step's output is stored in the pipeline context for downstream steps:

```json
"outputKey": "processedImages"
```

### Conditions

The `conditions` field supports conditional step execution:

```json
{
  "requiredModules": ["image_generation"],
  "minConfidence": 50,
  "paramExists": "platform"
}
```

## Template System

Templates are reusable pipeline blueprints stored in the `orchestrator_template` table.

```
Template
  |-- id: string           (tmpl_{timestamp}_{random})
  |-- name: string         (display name)
  |-- description: text    (optional)
  |-- type: string         (intent type this template serves)
  |-- category: string     (organizational category)
  |-- icon: string         (UI icon identifier)
  |-- pipelineConfig: JSON (default pipeline configuration)
  |-- steps: JSON[]        (step definitions array)
  |-- estimatedCredits: integer  (pre-calculated cost)
  |-- estimatedDurationMs: integer (pre-calculated duration)
  |-- tags: string[]       (classification tags)
  |-- isSystem: boolean    (system templates cannot be deleted)
  |-- isActive: boolean    (visibility flag)
  |-- usageCount: integer  (incremented on each use)
  |-- metadata: JSON       (extensible metadata)
```

### Template Execution Flow

When a template is executed via `executeTemplate()`:

1. Template is retrieved from the database
2. Template's `usageCount` is incremented
3. A new pipeline is created from the template's `pipelineConfig`
4. A new execution is created with `triggerType: "template"`
5. The execution record includes the template's estimated credits and duration

```typescript
async executeTemplate(templateId: string, userId: string, input?: Record<string, unknown>) {
  // 1. Get template
  // 2. Increment usageCount
  // 3. Create pipeline from template
  // 4. Create execution from pipeline
}
```

## Pipeline Execution Flow

### Creating an Execution

```typescript
async createExecution(userId, pipelineId, data) {
  // 1. Load pipeline steps to get totalSteps count
  // 2. Generate execution ID: exec_{timestamp}_{random}
  // 3. Insert execution record with:
  //    - totalSteps from step count
  //    - triggerType, input, estimatedCredits, estimatedDurationMs
  // 4. Return created execution
}
```

### Execution Record Fields

| Field                  | Type    | Description                                   |
|------------------------|---------|-----------------------------------------------|
| `id`                   | string  | `exec_{timestamp}_{random}`                   |
| `userId`               | string  | Owner of the execution                        |
| `pipelineId`           | string  | Parent pipeline reference                     |
| `status`               | string  | pending, running, completed, failed, cancelled|
| `triggerType`          | string  | How the execution was initiated               |
| `input`                | JSON    | Input parameters for the execution            |
| `output`               | JSON    | Aggregated output from completed tasks        |
| `error`                | text    | Error message if failed                       |
| `progress`             | integer | 0-100 percentage                              |
| `currentStep`          | string  | Name of the currently executing step          |
| `completedSteps`       | integer | Number of completed steps                     |
| `totalSteps`           | integer | Total steps in the pipeline                   |
| `creditsUsed`          | integer | Actual credits consumed                       |
| `storageUsed`          | integer | Storage bytes consumed                        |
| `estimatedCredits`     | integer | Pre-execution estimate                        |
| `estimatedDurationMs`  | integer | Pre-execution estimate                        |
| `startedAt`            | timestamp | When execution began                        |
| `completedAt`          | timestamp | When execution finished                      |

## Step Dependencies

Steps within a pipeline are ordered by the `order` field (integer). The execution engine processes steps sequentially from lowest to highest order. Dependencies are implicit through:

1. **Order-based sequencing**: Step with `order: 0` runs before `order: 1`
2. **Input mapping**: Later steps can reference output of earlier steps via `inputMapping`
3. **Output key propagation**: Each step's output is stored under its `outputKey` and available to subsequent steps
4. **Conditional execution**: Steps with `conditions` may be skipped based on context

### Deletion Cascade

When a pipeline is deleted, all its steps are deleted first:

```typescript
async deletePipeline(id: string) {
  await db.delete(orchestratorPipelineStep).where(eq(orchestratorPipelineStep.pipelineId, id));
  await db.delete(orchestratorPipeline).where(eq(orchestratorPipeline.id, id));
}
```

## Statistics

The `getStats()` method provides aggregate metrics:

```typescript
async getStats() {
  return {
    totalPipelines,    // All pipelines
    activePipelines,   // Pipelines with status "active"
    totalExecutions,   // All executions
    runningExecutions, // Executions with status "running"
    totalSteps,        // All steps across all pipelines
    templates,         // Total templates
  };
}
```
