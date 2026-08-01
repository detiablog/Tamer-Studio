# AI Orchestrator - Queue Manager

## Overview

The Queue Manager controls task execution ordering through a priority-based queue system. It manages task enqueueing, dequeueing, priority adjustment, and removal. Each user has an independent queue with positional ordering.

- Source: `src/core/orchestrator/queue-manager.service.ts`
- API: `GET/POST /api/orchestrator/queue`, `DELETE /api/orchestrator/queue/[id]`, `PUT .../priority`

## Queue Architecture

```
User Queue (per userId)
+----+----------+----------+--------+----------+
| #  | Task ID  | Priority | Status | Credits  |
+----+----------+----------+--------+----------+
| 1  | task_001 | normal   | waiting| 5        |
| 2  | task_002 | high     | waiting| 10       |
| 3  | task_003 | critical | waiting| 3        |
| 4  | task_004 | normal   | waiting| 8        |
| 5  | task_005 | low      | waiting| 2        |
+----+----------+----------+--------+----------+

Processing order: position (lowest first), then priority (critical > high > normal > low)
```

### Queue Record Structure

```
Queue Item
  |-- id: string           (q_{timestamp}_{random})
  |-- userId: string       (queue owner)
  |-- taskId: string       (reference to orchestrator_task)
  |-- status: string       ("waiting" | "processing" | "completed" | "failed")
  |-- priority: string     ("critical" | "high" | "normal" | "low")
  |-- position: integer    (sequential position in queue)
  |-- estimatedCredits: integer (cost estimate for this item)
  |-- metadata: JSON       (extensible metadata)
```

## Priority System

### Priority Levels

| Priority   | Description                                           |
|------------|-------------------------------------------------------|
| `critical` | Highest priority; processed before all others         |
| `high`     | High priority; processed after critical               |
| `normal`   | Default priority for new tasks                        |
| `low`      | Lowest priority; processed last                       |

### Priority Usage

- Priority is set when enqueuing a task (defaults to "normal")
- Priority can be updated after enqueueing via `PUT /api/orchestrator/queue/[id]/priority`
- The queue is ordered by `position` first, with priority as a secondary sort key
- Higher-priority items at the same position level are processed first

### Priority Update

```typescript
async updatePriority(id: string, priority: string) {
  const [updated] = await db
    .update(orchestratorQueue)
    .set({ priority, updatedAt: new Date() })
    .where(eq(orchestratorQueue.id, id))
    .returning();
  return updated || null;
}
```

## Concurrency Control

Concurrency is managed through the user's `orchestrator_settings`:

| Setting                    | Default | Effect                                      |
|----------------------------|---------|---------------------------------------------|
| `maxConcurrentExecutions`  | 3       | Max simultaneous execution threads           |
| `maxQueueSize`             | 50      | Maximum items in queue per user              |

### Concurrency Model

```
User Queue
  |
  +--> Slot 1 (execution A, task 1) -- processing
  +--> Slot 2 (execution B, task 3) -- processing
  +--> Slot 3 (execution A, task 2) -- processing
  +--> Slot 4 (waiting) -- blocked until a slot opens
  +--> Slot 5 (waiting) -- blocked until a slot opens
```

When a task completes, the next waiting task is dequeued to fill the open slot.

## Queue Operations

### Enqueue

```typescript
async enqueue(userId, data) {
  // 1. Count current queue items for user
  // 2. Assign position = count + 1
  // 3. Generate ID: q_{timestamp}_{random}
  // 4. Insert queue record
  // 5. Return created item
}
```

**Parameters:**
- `taskId` (required): Reference to the task to enqueue
- `priority` (optional): Priority level, defaults to "normal"
- `estimatedCredits` (optional): Pre-calculated cost estimate
- `metadata` (optional): Additional context

### Dequeue (Remove from Queue)

```typescript
async removeFromQueue(id: string) {
  await db.delete(orchestratorQueue).where(eq(orchestratorQueue.id, id));
}
```

Removal is a hard delete. The associated task is not deleted.

### List Queue

```typescript
async listQueue(userId, options?) {
  // Returns paginated queue items
  // Ordered by position ascending
  // Optional status filter
}
```

### Queue Statistics

```typescript
async getStats(userId: string) {
  return {
    total: number,      // All queue items for user
    waiting: number,    // Items with status "waiting"
    processing: number, // Items with status "processing"
  };
}
```

## Queue Status Flow

```
  +---------+
  | waiting | <-- initial state after enqueue
  +----+----+
       |
       v
  +-----------+
  | processing| <-- dequeued and being executed
  +----+------+
       |
       +------+------+
       |             |
       v             v
  +----------+  +--------+
  | completed|  | failed |
  +----------+  +--------+
```

### Status Values

| Status       | Description                              |
|--------------|------------------------------------------|
| `waiting`    | In queue, awaiting processing            |
| `processing` | Currently being executed by a module     |
| `completed`  | Successfully finished                    |
| `failed`     | Execution failed                         |
