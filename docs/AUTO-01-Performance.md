# AUTO-01: Performance

## Overview

The Automation Center is designed for efficient rule evaluation, queue processing, and scheduling. This document covers performance characteristics, optimization strategies, and caching approaches.

## Rule Evaluation Optimization

### Query Optimization

Rule listing queries use indexed columns for efficient filtering:

```sql
-- Indexed columns
auto_rule_user_idx    ON user_id
auto_rule_status_idx  ON status
auto_rule_enabled_idx ON is_enabled
```

### Condition Evaluation

The condition evaluation engine uses early termination:

```typescript
for (const condition of conditions) {
  let conditionResult = false;

  if (condition.group && condition.group.length > 0) {
    conditionResult = await this.evaluateConditions(condition.group, context);
  } else {
    const fieldValue = this.getNestedValue(context, condition.field);
    conditionResult = this.evaluateSingleCondition(fieldValue, condition.operator, condition.value);
  }

  // Early termination for AND logic
  if (currentLogicalOp === "AND") {
    result = result && conditionResult;
    // Short-circuit: if result is false and next op is AND, no need to continue
  } else {
    result = result || conditionResult;
    // Short-circuit: if result is true and next op is OR, no need to continue
  }

  currentLogicalOp = condition.logicalOperator || "AND";
}
```

### Pagination

All list operations use database-level pagination with `LIMIT` and `OFFSET`:

```typescript
const limit = Math.min(filters?.limit || 20, 100);
const offset = (page - 1) * limit;
```

The maximum page size is capped at 100 to prevent excessive data transfer.

### Parallel Count Queries

Rule listing executes the data query and count query in parallel:

```typescript
const [data, total] = await Promise.all([
  db.select().from(automationRule).where(where).orderBy(desc(automationRule.createdAt)).limit(limit).offset(offset),
  db.select({ count: sql<number>`count(*)` }).from(automationRule).where(where),
]);
```

## Queue Processing

### Priority-Based Dequeue

Queue dequeue uses a sorted query with priority ordering:

```sql
ORDER BY
  CASE priority
    WHEN 'high' THEN 0
    WHEN 'normal' THEN 1
    WHEN 'low' THEN 2
  END,
  position ASC
LIMIT 1
```

This ensures the highest-priority, oldest item is always dequeued first.

### Position Calculation

Queue position is calculated as `MAX(position) + 1` for the user:

```typescript
const [maxPos] = await db.select({ pos: sql<number>`coalesce(max(${automationQueue.position}), 0)` })
  .from(automationQueue)
  .where(eq(automationQueue.userId, userId));
```

This avoids position conflicts in concurrent enqueue scenarios.

### Scheduled Execution

Dequeue respects `scheduledAt` with a single query:

```sql
WHERE
  user_id = ? AND
  status = 'waiting' AND
  (scheduled_at IS NULL OR scheduled_at <= NOW())
```

## Scheduling Efficiency

### Due Schedule Detection

The scheduling engine uses a single indexed query to find due schedules:

```sql
WHERE
  is_active = true AND
  next_run_at <= NOW()
ORDER BY next_run_at
```

The `auto_sched_next_idx` index on `next_run_at` ensures efficient lookup.

### Next-Run Calculation

Next-run calculation is performed in-memory using JavaScript `Date` operations. The calculation is O(1) per schedule type.

### Max-Runs Deactivation

When a schedule reaches its `max_runs` limit, it is deactivated in the same update operation:

```typescript
return db.update(automationSchedule).set({
  lastRunAt: new Date(),
  nextRunAt: shouldContinue ? this.calculateNextRun(...) : null,
  runCount: newRunCount,
  isActive: shouldContinue,
});
```

This avoids a separate deactivation query.

## Caching Strategies

### In-Memory Caching

The system uses singleton service instances for in-memory state:

```typescript
export const ruleEngineService = new RuleEngineService();
export const schedulingEngineService = new SchedulingEngineService();
export const queueEngineService = new QueueEngineService();
```

Singleton instances avoid repeated object creation and allow for potential in-memory caching.

### Database Connection Pooling

Drizzle ORM manages database connection pooling through the `db` instance. Connection reuse reduces overhead for frequent queries.

### Query Result Caching

For high-frequency queries (e.g., queue status, statistics), the following strategies apply:

1. **Batch queries**: Multiple aggregates are fetched in parallel using `Promise.all()`
2. **Indexed queries**: All frequently filtered columns have database indexes
3. **Limited result sets**: Pagination caps prevent unbounded result growth

## Credit Estimation

Queue items store `estimatedCredits` to allow credit-aware scheduling:

```typescript
const [totalCredits] = await db.select({
  total: sql<number>`coalesce(sum(${automationQueue.estimatedCredits}), 0)`
}).from(automationQueue)
  .where(and(
    eq(automationQueue.userId, userId),
    inArray(automationQueue.status, ["waiting", "running"])
  ));
```

This enables pre-execution credit validation without running the actual actions.

## Concurrency Considerations

### Concurrent Enqueue

Position calculation uses `MAX(position) + 1` which may have race conditions under high concurrency. For most use cases, this is acceptable. For extreme concurrency, a database sequence or advisory lock could be used.

### Concurrent Dequeue

The dequeue operation atomically updates the status from `waiting` to `running`:

```typescript
await db.update(automationQueue).set({
  status: "running",
  startedAt: new Date()
}).where(eq(automationQueue.id, item.id));
```

This prevents double-dequeue of the same item.

### Max Concurrent Executions

The `automation_settings.max_concurrent_executions` field limits parallel executions per user. This is enforced at the application level before dequeue.

## Performance Metrics

The system tracks the following performance metrics:

| Metric | Source | Purpose |
|---|---|---|
| Execution count | `automation_rule.execution_count` | Rule usage frequency |
| Success/failure rates | `automation_rule.success_count` / `failure_count` | Reliability monitoring |
| Credit usage | `automation_execution.credits_used` | Cost tracking |
| Queue depth | `automation_queue` status counts | Backlog monitoring |
| Schedule utilization | `automation_schedule.run_count` | Schedule efficiency |
