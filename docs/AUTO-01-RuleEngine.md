# AUTO-01: Rule Engine

## Overview

The Rule Engine is the central component of the Intelligent Automation Center. It manages the full lifecycle of automation rules -- from creation to evaluation to execution. The Rule Engine is implemented in `src/core/automation/rule-engine.service.ts`.

## Rule Structure

An automation rule consists of four main parts:

### 1. Metadata

```typescript
{
  id: string;           // Prefixed ID: "arule_xxx"
  userId: string;       // Owner (user isolation)
  name: string;         // Human-readable name (max 200 chars)
  description?: string; // Optional description
  status: string;       // "draft" | "active" | "paused" | "completed"
  priority: string;     // "low" | "normal" | "high"
  tags: string[];       // Categorization tags
  isEnabled: boolean;   // Toggle for activation
}
```

### 2. Trigger Configuration

Defines what initiates the rule. Stored as JSONB in `triggerConfig`.

```typescript
interface TriggerConfig {
  type: TriggerType;                    // The trigger type
  config: Record<string, unknown>;      // Type-specific configuration
}
```

### 3. Conditions

Optional array of conditions that must be satisfied for actions to execute.

```typescript
interface Condition {
  field: string;                        // Dot-notation field path (e.g., "data.project.type")
  operator: ConditionOperator;          // Comparison operator
  value: unknown;                       // Value to compare against
  logicalOperator?: "AND" | "OR";      // How to combine with next condition
  group?: Condition[];                  // Nested condition group
}
```

### 4. Actions

Ordered list of actions to execute when conditions are met.

```typescript
interface Action {
  type: ActionType;                     // The action type
  config: Record<string, unknown>;      // Type-specific configuration
  order: number;                        // Execution order (lower = first)
  skipOnError?: boolean;               // Continue if this action fails
}
```

## Rule Evaluation Flow

```
1. Rule triggered (event / schedule / manual)
    |
2. Check if rule.isEnabled === true
    |--- [No] --> Skip rule
    |
3. Retrieve conditions array
    |--- [Empty] --> All conditions pass (proceed to actions)
    |
4. Evaluate conditions via evaluateConditions()
    |
5. For each condition:
    |--- Has group? --> Recursively evaluate group
    |--- No group? --> Evaluate single condition
    |
6. Combine results using logicalOperator (AND/OR)
    |
7. Final result: true (execute actions) / false (skip)
```

## Condition Operators

| Operator | Description | Example |
|---|---|---|
| `equals` | Exact match | `status === "completed"` |
| `not_equals` | Non-match | `status !== "failed"` |
| `contains` | String contains | `"hello world".includes("hello")` |
| `not_contains` | String does not contain | `!"hello".includes("xyz")` |
| `greater_than` | Numeric greater than | `credits > 100` |
| `less_than` | Numeric less than | `credits < 50` |
| `in` | Value in array | `[1,2,3].includes(value)` |
| `not_in` | Value not in array | `![1,2,3].includes(value)` |
| `and` | Logical AND (group) | Both groups must be true |
| `or` | Logical OR (group) | Either group can be true |

### Field Evaluation

Fields are evaluated using dot-notation paths against the context object:

```typescript
// Context: { data: { project: { type: "video" } } }
// Field: "data.project.type"
// Result: "video"
```

The `getNestedValue()` method splits the path by `.` and traverses the object hierarchy.

## Nested Condition Groups

Conditions support nested groups for complex logic:

```typescript
[
  {
    field: "data.status",
    operator: "equals",
    value: "completed",
    logicalOperator: "AND",
    group: [
      {
        field: "data.credits",
        operator: "greater_than",
        value: 100,
        logicalOperator: "OR",
        group: [
          {
            field: "data.priority",
            operator: "equals",
            value: "high"
          }
        ]
      }
    ]
  }
]
```

Evaluation logic:
- Top-level conditions are combined with their `logicalOperator`
- Default logical operator is `AND` if not specified
- Nested groups are evaluated recursively and their boolean result replaces the group
- Empty conditions array returns `true`

## Action Types

| Action Type | Description | Target Module |
|---|---|---|
| `create_project` | Create a new project | Project System |
| `generate_images` | Generate images | Image Generation |
| `generate_videos` | Generate videos | Video Generation |
| `generate_story` | Generate story content | Story Generation |
| `generate_affiliate` | Generate affiliate content | Affiliate Generator |
| `generate_thumbnail` | Generate thumbnail | Thumbnail Generator |
| `generate_captions` | Generate captions | Caption Generator |
| `generate_hashtags` | Generate hashtags | Hashtag Generator |
| `run_workflow` | Execute a workflow | Workflow Engine |
| `publish_content` | Publish content | Publishing Module |
| `schedule_publishing` | Schedule publishing | Publishing Scheduler |
| `analyze_performance` | Analyze performance | Analytics Module |
| `run_optimizer` | Run content optimizer | Content Optimizer |
| `archive_project` | Archive a project | Project System |
| `backup_project` | Backup a project | Project System |
| `send_notification` | Send notification | Notification System |
| `send_email` | Send email | Email System |
| `update_memory` | Update creative memory | Creative Memory |
| `wait` | Wait for duration | System |
| `delay` | Delay next action | System |
| `stop` | Stop execution | System |

## Action Execution

Actions are executed sequentially in the order specified by `action.order`:

1. Actions are sorted by `order` (ascending)
2. Each action is executed via `executeSingleAction()`
3. On success: result is recorded with `success: true`
4. On failure: error is recorded; if `skipOnError` is false, execution halts
5. Results and errors are returned as an aggregated response

### Skip on Error

When `skipOnError: true`, a failed action does not halt the entire execution. The error is logged, and the next action in sequence is attempted. When `skipOnError: false` (default), a failed action stops all subsequent actions.

## CRUD Operations

| Method | Description |
|---|---|
| `listRules(userId, filters?)` | List rules with pagination, filtering by status, isEnabled, search |
| `createRule(userId, data)` | Create a new rule |
| `getRule(id)` | Get a single rule by ID |
| `updateRule(id, data)` | Update a rule |
| `deleteRule(id)` | Delete a rule |
| `toggleRule(id, isEnabled)` | Enable or disable a rule |
| `getStats(userId)` | Get rule and execution statistics |

## Execution Recording

| Method | Description |
|---|---|
| `recordExecution(userId, data)` | Record a new execution |
| `updateExecution(id, data)` | Update execution status/progress |
| `getExecution(id)` | Get a single execution |
| `listExecutions(userId, filters?)` | List executions with pagination |

## Event Recording

| Method | Description |
|---|---|
| `recordEvent(userId, data)` | Record an automation event |
| `listEvents(userId, filters?)` | List events with pagination |
