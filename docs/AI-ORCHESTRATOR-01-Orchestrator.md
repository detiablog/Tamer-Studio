# AI Orchestrator - Central Coordination Design

## Central Coordination Role

The AI Orchestrator serves as the single coordination point for all AI module interactions within the Tamer Studio platform. No AI module communicates directly with another module. Instead, all inter-module communication flows through the orchestrator layer, which manages:

- **Intent Resolution**: Translating user requests into structured workflow definitions
- **Pipeline Construction**: Assembling ordered sequences of module operations
- **Task Dispatch**: Breaking pipelines into atomic tasks and distributing them to modules
- **Queue Management**: Controlling execution order and concurrency
- **Resource Accounting**: Tracking credit consumption and estimating costs
- **State Management**: Maintaining execution state across the full lifecycle

## Module Communication Pattern

```
                +-----------+
                |  Module A  |
                +-----+-----+
                      |
                      v
+-----------+   +-----------+   +-----------+
|  Module B | <-- | Orchestrator | --> |  Module C |
+-----------+   +-----------+   +-----------+
                      ^
                      |
                +-----------+
                |  Module D  |
                +-----------+
```

### Key Principle: No Direct Module-to-Module Communication

Modules do not call each other. When a pipeline requires output from Module A to be used as input for Module C:

1. Module A completes execution and writes output to the orchestrator task record
2. The orchestrator reads the output via the `outputKey` and `inputMapping` fields on the pipeline step
3. The orchestrator passes the mapped output as input to Module C's task
4. Module C never has a reference to Module A

This pattern provides:

- **Isolation**: Modules are decoupled and can be updated independently
- **Security**: Modules cannot access each other's internal state
- **Auditability**: All data flow is recorded in the orchestrator's execution and task tables
- **Retry Safety**: Failed module calls can be retried without cascading side effects

## Execution Lifecycle

### 1. Request Phase

```
POST /api/orchestrator/analyze  (optional)
    -> IntentAnalyzerService.analyzeIntent()
    -> Returns intent type, suggested template, parameters

POST /api/orchestrator  or  POST /api/orchestrator/[id]/execute
    -> PipelineBuilderService.createPipeline() or createExecution()
    -> ResourceEstimatorService.estimatePipeline()
    -> Execution record created with status "pending"
```

### 2. Planning Phase

```
Pipeline Builder reads pipeline steps
    -> Each step has: moduleType, action, order, config, inputMapping, outputKey
    -> Steps are ordered by the `order` field
    -> Conditions on steps determine if they execute

Task Scheduler creates tasks for each step
    -> Each task gets: executionId, stepId, moduleType, action, priority
    -> Tasks start in "pending" status
```

### 3. Queue Phase

```
Queue Manager enqueues tasks
    -> Position is assigned based on current queue length
    -> Priority determines processing order (critical > high > normal > low)
    -> Concurrency limits from user settings control parallelism
```

### 4. Execution Phase

```
Tasks are dequeued and dispatched to AI modules
    -> Module executes the action with the provided input
    -> Output is written back to the task record
    -> Execution progress is updated (completedSteps, progress %)
    -> Credits are tracked in creditsUsed
```

### 5. Completion Phase

```
All tasks complete or one fails
    -> Execution status updated to "completed", "failed", or "cancelled"
    -> completedAt timestamp recorded
    -> Output aggregated from all task outputs
    -> Analytics data recorded
    -> Creative Memory updated with learnings
```

## Error Handling Strategy

### Task-Level Error Handling

Each task has built-in retry capability:

- `attempts` field tracks the number of execution attempts
- `maxAttempts` defaults to 3 (configurable per step via `retryConfig`)
- On failure, the task stores the error message in the `error` field
- Manual retry via `POST /api/orchestrator/tasks/[id]/retry` resets the task to "pending" status and increments the attempt counter
- After max attempts, the task remains in "failed" status

### Execution-Level Error Handling

- If any task in an execution fails, the execution can be manually cancelled via `POST /api/orchestrator/executions/[id]/cancel`
- The execution records both `estimatedCredits` and `actual creditsUsed` for cost analysis
- Error messages are stored in the execution's `error` field
- The `progress` field provides a percentage-based view of completion

### Pipeline-Level Error Handling

- Individual steps can have `conditions` that control whether they execute
- Steps can be deactivated via `isActive: false` without deleting them
- Pipeline deletion cascades to delete all associated steps first

### User Settings Controls

Per-user settings provide configurable safeguards:

| Setting                    | Default | Purpose                                      |
|----------------------------|---------|----------------------------------------------|
| `maxConcurrentExecutions`  | 3       | Limits simultaneous pipeline executions      |
| `maxRetries`               | 3       | Default retry count for failed tasks         |
| `autoRetry`                | true    | Enables automatic retry on failure           |
| `creditWarningThreshold`   | 100     | Warns when credit estimate exceeds threshold |
| `notificationsEnabled`     | true    | Sends notifications on completion/failure    |
