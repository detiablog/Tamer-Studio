# AI Orchestrator - Performance

## Overview

The AI Orchestrator is designed for efficient execution of multi-step AI workflows. This document covers the performance characteristics, optimization strategies, and areas for improvement across parallel execution, queue management, caching, and background processing.

## Parallel Execution Optimization

### Current Model

The orchestrator supports limited parallelism through the `maxConcurrentExecutions` user setting:

```
User Setting: maxConcurrentExecutions = 3

Execution A (Slot 1): [Task 1: running] [Task 2: waiting] [Task 3: waiting]
Execution B (Slot 2): [Task 1: running] [Task 2: waiting]
Execution C (Slot 3): [Task 1: running]
```

### Parallelism Boundaries

| Level             | Current Support | Notes                                  |
|-------------------|-----------------|----------------------------------------|
| Inter-execution   | Limited         | Controlled by `maxConcurrentExecutions`|
| Intra-execution   | Sequential      | Steps execute in order by `order` field|
| Inter-task        | Limited         | Independent tasks across executions    |

### Optimization Opportunities

1. **Step-level parallelism**: Steps without dependencies could execute concurrently
2. **Dynamic concurrency**: Adjust `maxConcurrentExecutions` based on system load
3. **Work stealing**: Idle execution slots could process tasks from other executions

## Queue Management

### Queue Performance Characteristics

| Operation    | Complexity | Notes                              |
|--------------|------------|-------------------------------------|
| Enqueue      | O(1)       | Append to end with position counter |
| Dequeue      | O(n)       | Requires position-based ordering    |
| Priority update | O(1)    | Direct field update                 |
| Remove       | O(1)       | Direct delete by ID                 |
| List         | O(n)       | Full scan with position ordering    |

### Queue Bottlenecks

The queue uses position-based ordering, which requires sequential position assignment. Under high concurrency:

- Multiple enqueue operations may produce non-sequential positions
- Position gaps can occur after removals
- Reordering is not currently implemented

### Optimization Recommendations

1. **Position compaction**: Periodically compact queue positions to remove gaps
2. **Priority queue index**: Add a composite index on (userId, priority, position)
3. **Batch dequeue**: Process multiple queue items in a single transaction

## Caching Strategies

### Current State

The orchestrator does not implement explicit caching. All operations hit the database directly. This is appropriate for the current scale but becomes a bottleneck under load.

### Recommended Caching Layers

#### 1. Template Cache

Templates are read frequently but change infrequently:

```
Cache Key: orch:template:{templateId}
TTL: 5 minutes
Invalidation: On template update/delete
```

#### 2. User Settings Cache

Settings are read on every authenticated request:

```
Cache Key: orch:settings:{userId}
TTL: 10 minutes
Invalidation: On settings upsert
```

#### 3. Pipeline Step Cache

Pipeline steps are read during execution planning:

```
Cache Key: orch:pipeline:{pipelineId}:steps
TTL: 2 minutes
Invalidation: On step add/update/delete
```

#### 4. Statistics Cache

Aggregate statistics are expensive to compute:

```
Cache Key: orch:stats
TTL: 1 minute
Invalidation: On any pipeline/execution/task change
```

### Cache Implementation Options

| Option        | Use Case                    | Trade-offs                    |
|---------------|-----------------------------|-------------------------------|
| In-memory     | Single-server deployment    | No persistence, no sharing    |
| Redis         | Multi-server deployment     | External dependency, fast     |
| Database      | Simple caching              | Slower, persistent            |
| HTTP headers  | Client-side caching         | Limited control, browser-only |

## Background Workers

### Current State

The orchestrator relies on API-triggered execution. Background processing is not yet implemented. Tasks are created and enqueued synchronously within API request handlers.

### Recommended Background Workers

#### 1. Task Executor Worker

```
Responsibility: Dequeue tasks and dispatch to AI modules
Concurrency: Respects maxConcurrentExecutions per user
Retry: Handles failed tasks with exponential backoff
Monitoring: Reports progress back to execution/task records
```

#### 2. Queue Processor Worker

```
Responsibility: Monitor queue and trigger task execution
Frequency: Polling interval (1-5 seconds) or event-driven
Scaling: Horizontal scaling with distributed lock
```

#### 3. Cleanup Worker

```
Responsibility: Archive old executions, compact queue positions
Frequency: Daily or weekly
Retention: Configurable (e.g., keep 90 days of execution history)
```

#### 4. Analytics Aggregator Worker

```
Responsibility: Aggregate execution metrics for dashboard
Frequency: Near-real-time or batch (hourly)
Output: Pre-aggregated statistics for fast dashboard queries
```

### Worker Communication Pattern

```
API Layer                     Background Workers
   |                                |
   +-- Create Pipeline              |
   +-- Create Execution -->         |
   +-- Create Tasks --->            +-- Dequeue Tasks
   |                                +-- Execute Modules
   |                                +-- Update Task Status
   |                                +-- Update Execution Progress
   +-- Read Progress <--            |
```

## Database Performance

### Index Coverage

All queries are supported by appropriate indexes:

| Query Pattern                      | Index                                  |
|------------------------------------|----------------------------------------|
| Pipeline by user                   | `orch_pipeline_user_idx`               |
| Pipeline by type                   | `orch_pipeline_type_idx`               |
| Pipeline by status                 | `orch_pipeline_status_idx`             |
| Steps by pipeline                  | `orch_step_pipeline_idx`               |
| Steps by order                     | `orch_step_order_idx`                  |
| Execution by user                  | `orch_exec_user_idx`                   |
| Execution by pipeline              | `orch_exec_pipeline_idx`               |
| Execution by status                | `orch_exec_status_idx`                 |
| Task by execution                  | `orch_task_exec_idx`                   |
| Task by user                       | `orch_task_user_idx`                   |
| Task by status                     | `orch_task_status_idx`                 |
| Task by priority                   | `orch_task_priority_idx`               |
| Queue by user                      | `orch_queue_user_idx`                  |
| Queue by status                    | `orch_queue_status_idx`                |
| Queue by priority                  | `orch_queue_priority_idx`              |
| Queue by position                  | `orch_queue_position_idx`              |
| Template by type                   | `orch_template_type_idx`               |
| Template by category               | `orch_template_category_idx`           |
| Rule by user                       | `orch_rule_user_idx`                   |
| Rule by trigger type               | `orch_rule_trigger_idx`                |
| Rule by enabled                    | `orch_rule_enabled_idx`                |
| Settings by user (unique)          | `orch_settings_user_idx` + unique      |

### Query Performance Notes

1. **Paginated queries** use `LIMIT` + `OFFSET` with count queries
2. **Aggregate statistics** run 6 separate count queries (potential for materialized views)
3. **Execution details** require 2 queries (execution + tasks)
4. **Template suggestions** use `ORDER BY usageCount DESC LIMIT 1`

### Scaling Considerations

| Metric              | Current Capacity | Breaking Point (est.) |
|---------------------|------------------|------------------------|
| Pipelines per user  | Unlimited        | 10,000+ (query perf)   |
| Steps per pipeline  | Unlimited        | 100+ (execution time)  |
| Executions per user | Unlimited        | 1,000+ (storage)       |
| Tasks per execution | Unlimited        | 50+ (execution time)   |
| Queue items per user| 50 (configurable)| 1,000+ (query perf)    |

## Performance Monitoring Recommendations

1. **Execution duration tracking**: Compare `estimatedDurationMs` vs actual
2. **Credit accuracy**: Compare `estimatedCredits` vs actual `creditsUsed`
3. **Queue wait time**: Track time between enqueue and processing start
4. **Retry rate**: Monitor `attempts` field across tasks
5. **Error rate**: Track failed executions vs total executions
