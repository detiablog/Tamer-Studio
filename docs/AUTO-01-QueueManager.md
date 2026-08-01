# AUTO-01: Queue Manager

## Overview

The Queue Manager handles execution queue management with priority-based processing, retry mechanisms, and status tracking. It ensures orderly execution of automation tasks while supporting concurrent processing.

## Queue Architecture

The queue operates as a persistent, database-backed message queue using the `automation_queue` table:

```
+------------------+     +------------------+     +------------------+
|   Enqueue        |     |   Queue Storage  |     |   Dequeue        |
|   (API/Engine)   | --> |   (PostgreSQL)   | --> |   (Worker)       |
+------------------+     +------------------+     +------------------+
                               |
                               v
                        +------------------+
                        |   Execution      |
                        |   (Rule Engine)  |
                        +------------------+
```

## Priority System

Queue items are processed based on priority level:

| Priority | Sort Order | Description |
|---|---|---|
| `high` | 0 | Processed first |
| `normal` | 1 | Default priority |
| `low` | 2 | Processed last |

Within the same priority level, items are processed in FIFO order (by `position`).

### Dequeue Ordering

```sql
ORDER BY
  CASE priority
    WHEN 'high' THEN 0
    WHEN 'normal' THEN 1
    WHEN 'low' THEN 2
  END,
  position ASC
```

## Queue Item Structure

```typescript
{
  id: string;                // Prefixed ID: "aque_xxx"
  userId: string;            // Owner
  executionId: string;       // References automation_execution
  status: QueueStatus;       // Current status
  priority: string;          // "high" | "normal" | "low"
  position: number;          // FIFO position within user's queue
  scheduledAt?: Date;        // Future execution time (optional)
  startedAt?: Date;          // When processing started
  completedAt?: Date;        // When processing completed
  estimatedCredits: number;  // Estimated credit cost
}
```

### Queue Statuses

| Status | Description |
|---|---|
| `waiting` | Awaiting processing |
| `running` | Currently being processed |
| `completed` | Successfully completed |
| `failed` | Processing failed |
| `cancelled` | Cancelled by user or system |

## Enqueue/Dequeue Operations

### Enqueue

```typescript
async enqueue(
  executionId: string,
  userId: string,
  priority = "normal",
  scheduledAt?: Date,
  estimatedCredits = 0
)
```

- Assigns the next position in the user's queue
- Position is calculated as `MAX(position) + 1` for the user
- If `scheduledAt` is provided, the item waits until that time before dequeuing

### Dequeue

```typescript
async dequeue(userId: string)
```

- Selects the highest-priority, oldest waiting item
- Respects `scheduledAt` (only dequeues items where `scheduledAt IS NULL OR scheduledAt <= NOW()`)
- Atomically updates status to `running` and sets `startedAt`
- Returns `null` if no items are available

### Acknowledge (ack)

```typescript
async ack(queueId: string)
```

- Marks item as `completed`
- Sets `completedAt` timestamp

### Negative Acknowledge (nack)

```typescript
async nack(queueId: string)
```

- Marks item as `failed`
- Sets `completedAt` timestamp

## Retry Strategy

### Manual Retry

```typescript
async retry(queueId: string)
```

- Resets status to `waiting`
- Clears `startedAt` and `completedAt`
- Item re-enters the queue at its original position

### Automatic Retry

Automatic retry is configured through the automation settings:

```typescript
{
  maxRetries: 3,           // Maximum retry attempts
  retryDelayMs: 5000,      // Delay between retries
  autoRetry: true          // Enable automatic retry
}
```

When `autoRetry` is enabled, failed items are automatically retried up to `maxRetries` times with `retryDelayMs` between attempts.

## Queue Status Tracking

```typescript
async getQueueStatus(userId: string)
```

Returns:

```typescript
{
  waiting: number;        // Items waiting to be processed
  running: number;        // Items currently being processed
  completed: number;      // Successfully completed items
  failed: number;         // Failed items
  total: number;          // waiting + running
  estimatedCredits: number; // Total estimated credits for waiting/running items
}
```

## Additional Operations

### Reprioritize

```typescript
async reprioritize(queueId: string, priority: string)
```

Changes the priority of a waiting or running queue item.

### Cancel

```typescript
async cancel(queueId: string)
```

Marks a queue item as `cancelled`.

### Remove from Queue

```typescript
async removeFromQueue(queueId: string)
```

Permanently deletes a queue item.

### Clear Queue

```typescript
async clearQueue(userId: string, status?: string)
```

Deletes all queue items for a user, optionally filtered by status.

## CRUD Operations

| Method | Description |
|---|---|
| `enqueue(executionId, userId, priority?, scheduledAt?, estimatedCredits?)` | Add item to queue |
| `dequeue(userId)` | Get next item to process |
| `ack(queueId)` | Mark as completed |
| `nack(queueId)` | Mark as failed |
| `retry(queueId)` | Reset to waiting |
| `cancel(queueId)` | Cancel item |
| `removeFromQueue(queueId)` | Delete item |
| `listQueue(userId, filters?)` | List queue items with pagination |
| `getQueueStatus(userId)` | Get queue statistics |
| `reprioritize(queueId, priority)` | Change item priority |
| `clearQueue(userId, status?)` | Clear queue items |
