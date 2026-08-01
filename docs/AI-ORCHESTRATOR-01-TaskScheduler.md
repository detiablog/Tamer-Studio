# AI Orchestrator - Task Scheduler

## Overview

The Task Scheduler manages the lifecycle of individual tasks within an execution. Each task represents an atomic unit of work dispatched to a specific AI module. The scheduler handles task retrieval, status updates, retry logic, and cancellation.

- Source: `src/core/orchestrator/task-scheduler.service.ts`
- API: `GET /api/orchestrator/tasks`, `GET/PUT /api/orchestrator/tasks/[id]`, `POST .../retry`, `POST .../cancel`

## Task Lifecycle

```
  +--------+
  | pending | <-- initial state, ready for queue
  +----+---+
       |
       v
  +-----------+
  | processing| <-- dequeued and dispatched to module
  +----+------+
       |
       +------+------+
       |             |
       v             v
  +----------+  +--------+
  | completed|  | failed |
  +----------+  +---+----+
                    |
                    v (if retries available)
               +--------+
               | pending | (retry)
               +--------+

  Any state -> cancelled (via cancelTask)
```

### Status Values

| Status       | Description                                           |
|--------------|-------------------------------------------------------|
| `pending`    | Created, waiting to be enqueued and processed         |
| `processing` | Currently being executed by an AI module              |
| `completed`  | Successfully finished                                 |
| `failed`     | Execution failed after max attempts                   |
| `cancelled`  | Manually cancelled by user                            |

## Task Record Structure

```
Task
  |-- id: string           (auto-generated)
  |-- executionId: string  (parent execution reference)
  |-- stepId: string       (optional: source pipeline step)
  |-- userId: string       (task owner)
  |-- name: string         (display name, max 200 chars)
  |-- moduleType: string   (target module, e.g., "image_generation")
  |-- action: string       (specific action to execute)
  |-- status: string       (lifecycle status)
  |-- priority: string     ("critical" | "high" | "normal" | "low")
  |-- input: JSON          (input payload for the module)
  |-- output: JSON         (output payload from the module)
  |-- error: text          (error message if failed)
  |-- progress: integer    (0-100 percentage)
  |-- attempts: integer    (number of execution attempts)
  |-- maxAttempts: integer (maximum allowed attempts, default 3)
  |-- creditsUsed: integer (credits consumed by this task)
  |-- startedAt: timestamp (when processing began)
  |-- completedAt: timestamp (when finished)
  |-- scheduledAt: timestamp (when scheduled for execution)
  |-- metadata: JSON       (extensible metadata)
```

## Parallel vs Sequential Execution

### Sequential Execution (Default)

Tasks within a single execution are typically processed sequentially based on the pipeline step `order` field:

```
Step 1 (order: 0) -> Step 2 (order: 1) -> Step 3 (order: 2)
```

Each step must complete before the next begins, as later steps may depend on output from earlier steps via `inputMapping`.

### Parallel Execution

Tasks with independent dependencies can theoretically execute in parallel when:

- They belong to different executions
- The user's `maxConcurrentExecutions` setting allows it
- The Queue Manager dequeues multiple tasks simultaneously

The `maxConcurrentExecutions` setting (default: 3) controls how many tasks can run simultaneously across all of a user's executions.

## Dependency Resolution

Task dependencies are resolved at the pipeline level through:

1. **Order field**: Steps are sorted by `order` before task creation
2. **Input mapping**: Tasks reference outputs from earlier steps
3. **Execution context**: The execution record accumulates outputs from completed tasks
4. **Conditional steps**: Steps with unmet conditions are skipped, creating implicit dependencies

### Dependency Graph Example

```
Pipeline: Affiliate Campaign
  Step 0: trend_analysis (no dependencies)
  Step 1: text_generation (depends on Step 0 output)
  Step 2: image_generation (depends on Step 0 output)
  Step 3: publishing (depends on Steps 1 and 2 output)
```

In this example, Steps 1 and 2 could theoretically run in parallel after Step 0 completes.

## Retry Logic

### Automatic Retry Configuration

Each task has a configurable retry mechanism:

| Field          | Default | Description                              |
|----------------|---------|------------------------------------------|
| `attempts`     | 0       | Current attempt count                    |
| `maxAttempts`  | 3       | Maximum allowed attempts                 |
| `retryConfig`  | {}      | Step-level retry configuration           |

### Retry Flow

1. Task fails (module returns error or timeout)
2. Error is stored in the task's `error` field
3. If `attempts < maxAttempts`, task can be retried
4. `retryTask()` resets the task:
   - Status -> "pending"
   - Error -> null
   - Progress -> 0
   - Attempts incremented by 1
   - startedAt -> null
   - completedAt -> null
5. Task is re-enqueued for processing

### Retry Implementation

```typescript
async retryTask(id: string) {
  const task = await this.getTask(id);
  if (!task) return null;

  const [updated] = await db
    .update(orchestratorTask)
    .set({
      status: "pending",
      error: null,
      progress: 0,
      attempts: task.attempts + 1,
      startedAt: null,
      completedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(orchestratorTask.id, id))
    .returning();
  return updated || null;
}
```

### Max Attempts Enforcement

The service increments `attempts` on each retry but does not enforce the `maxAttempts` limit directly. Enforcement is expected at the orchestrator/workflow engine layer, which checks `attempts < maxAttempts` before allowing a retry.

## Priority Management

Tasks can have one of four priority levels:

| Priority   | Value | Use Case                          |
|------------|-------|-----------------------------------|
| `critical` | 0     | Time-sensitive, must run first    |
| `high`     | 1     | Important but not blocking        |
| `normal`   | 2     | Default priority                  |
| `low`      | 3     | Background, non-urgent tasks      |

Priority is set at task creation time (defaulting to "normal") and can be updated via `PUT /api/orchestrator/tasks/[id]`.

## Task Listing and Filtering

```typescript
async listTasks(userId: string, options?: {
  page?: number;      // default 1
  limit?: number;     // default 20
  status?: string;    // filter by status
  executionId?: string; // filter by parent execution
})
```

Returns paginated results with `{ tasks, total, page, limit }`.

## Cancellation

```typescript
async cancelTask(id: string) {
  const [updated] = await db
    .update(orchestratorTask)
    .set({ status: "cancelled", updatedAt: new Date(), completedAt: new Date() })
    .where(eq(orchestratorTask.id, id))
    .returning();
  return updated || null;
}
```

Cancellation is immediate and sets the `completedAt` timestamp. The parent execution should detect the cancellation and update its own status accordingly.
