# AI Orchestrator - Automation Rules

## Overview

Automation Rules enable event-driven workflow execution without manual intervention. Rules follow a Trigger-Condition-Action pattern: when a trigger event fires and all conditions are met, the specified actions are executed. Rules are managed per-user and can be enabled/disabled.

- Source: `src/core/orchestrator/automation-rules.service.ts`
- API: `GET/POST /api/orchestrator/rules`, `GET/PUT/DELETE /api/orchestrator/rules/[id]`, `POST .../toggle`

## Rule Structure

```
Rule
  |-- id: string           (rule_{timestamp}_{random})
  |-- userId: string       (owner)
  |-- name: string         (display name, max 200 chars)
  |-- description: text    (optional explanation)
  |-- triggerType: string  (event type that activates this rule)
  |-- triggerConfig: JSON  (trigger-specific configuration)
  |-- conditions: JSON[]   (array of condition objects)
  |-- actions: JSON[]      (array of action objects)
  |-- isEnabled: boolean   (whether rule is active)
  |-- executionCount: integer (total times rule has fired)
  |-- lastTriggeredAt: timestamp (last fire time)
  |-- metadata: JSON       (extensible metadata)
```

### ID Generation

Rule IDs follow the format `rule_{Date.now()}_{random7chars}`.

## Trigger Types

Triggers define what event causes the rule to be evaluated. The `triggerType` field is a free-form string, allowing extensibility. Common trigger types include:

| Trigger Type           | Description                                |
|------------------------|--------------------------------------------|
| `pipeline_complete`    | When an execution completes successfully   |
| `pipeline_failed`      | When an execution fails                    |
| `schedule`             | Time-based trigger (cron or interval)      |
| `threshold`            | When a metric crosses a threshold          |
| `manual`               | User-initiated trigger                     |
| `webhook`              | External system callback                   |
| `content_published`    | When content is published to a platform    |

### Trigger Configuration

The `triggerConfig` field contains trigger-specific parameters:

```json
{
  "schedule": "0 9 * * 1-5",
  "threshold": { "metric": "credit_usage", "value": 100, "operator": "gte" }
}
```

## Condition Evaluation

Conditions are stored as an array of JSON objects. Each condition represents a predicate that must evaluate to true for the rule's actions to execute.

### Condition Structure

```json
{
  "field": "execution.creditsUsed",
  "operator": "gt",
  "value": 50
}
```

### Supported Operators

| Operator | Description              |
|----------|--------------------------|
| `eq`     | Equal to                 |
| `neq`    | Not equal to             |
| `gt`     | Greater than             |
| `gte`    | Greater than or equal    |
| `lt`     | Less than                |
| `lte`    | Less than or equal       |
| `in`     | Value is in array        |
| `nin`    | Value is not in array    |
| `contains` | String contains       |

### Condition Evaluation Logic

- All conditions must be true (AND logic) for the rule to fire
- An empty conditions array means the rule always fires when triggered
- Conditions are evaluated against the context data provided at trigger time

## Action Execution

Actions define what happens when the rule fires. Actions are stored as an array of JSON objects.

### Action Structure

```json
{
  "type": "execute_pipeline",
  "config": {
    "templateId": "tmpl_xxx",
    "input": { "source": "automation_rule" }
  }
}
```

### Common Action Types

| Action Type              | Description                              |
|--------------------------|------------------------------------------|
| `execute_pipeline`       | Run a pipeline (by ID or template)       |
| `send_notification`      | Send a user notification                 |
| `update_status`          | Update a pipeline or execution status    |
| `enqueue_task`           | Add a task to the queue                  |
| `log_event`              | Record an audit log entry                |

### Action Execution Flow

1. Rule is triggered by an event
2. All conditions are evaluated against the trigger context
3. If all conditions pass, each action in the `actions` array is executed sequentially
4. `executionCount` is incremented
5. `lastTriggeredAt` is updated to the current timestamp

## Rule Lifecycle

### Creation

```typescript
async createRule(userId, data) {
  // Generates ID: rule_{timestamp}_{random}
  // Inserts into orchestrator_rule table
  // Returns created rule
}
```

Required fields: `name`, `triggerType`

### Toggle (Enable/Disable)

```typescript
async toggleRule(id) {
  const rule = await this.getRule(id);
  // Flips isEnabled: !rule.isEnabled
  // Returns updated rule
}
```

This is exposed via `POST /api/orchestrator/rules/[id]/toggle` and provides a quick way to enable/disable rules without modifying their configuration.

### Update

```typescript
async updateRule(id, data) {
  // Updates any combination of fields
  // Always updates updatedAt timestamp
  // Returns updated rule
}
```

### Deletion

```typescript
async deleteRule(id) {
  // Permanently removes the rule from the database
  // No cascade behavior (rules are standalone)
}
```

### Execution Tracking

Each time a rule fires:

```typescript
// The rule's executionCount is incremented
// lastTriggeredAt is set to the current time
```

## Statistics

```typescript
async getStats(userId: string) {
  return {
    total: number,     // Total rules for user
    enabled: number,   // Rules with isEnabled = true
    disabled: number,  // Rules with isEnabled = false
  };
}
```

## Filtering

Rules can be filtered by:

- `triggerType`: Only rules with a specific trigger type
- `isEnabled`: Only enabled or disabled rules
- `page` / `limit`: Pagination control
