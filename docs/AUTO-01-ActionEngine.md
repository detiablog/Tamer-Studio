# AUTO-01: Action Engine

## Overview

The Action Engine executes the actions defined in an automation rule when conditions are satisfied. Actions are executed sequentially in the order specified by the `order` field, with support for skip-on-error behavior.

## Supported Action Types

The system supports 21 action types organized by target module:

### Content Generation Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `generate_images` | Generate AI images | Image Generation | prompt, style, count, dimensions |
| `generate_videos` | Generate AI videos | Video Generation | prompt, style, duration, resolution |
| `generate_story` | Generate story content | Story Generation | prompt, genre, length, format |
| `generate_thumbnail` | Generate video/image thumbnail | Thumbnail Generator | title, style, overlay |
| `generate_captions` | Generate content captions | Caption Generator | platform, tone, length, hashtags |
| `generate_hashtags` | Generate hashtags | Hashtag Generator | platform, count, niche, trending |
| `generate_affiliate` | Generate affiliate content | Affiliate Generator | product, platform, style |

### Workflow Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `run_workflow` | Execute a workflow | Workflow Engine | workflowId, parameters |
| `create_project` | Create a new project | Project System | name, type, template, settings |

### Publishing Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `publish_content` | Publish content immediately | Publishing Module | platform, content, schedule |
| `schedule_publishing` | Schedule future publishing | Publishing Scheduler | platform, content, scheduledAt |

### Analytics Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `analyze_performance` | Analyze content performance | Analytics Module | projectId, metrics, period |
| `run_optimizer` | Run content optimizer | Content Optimizer | projectId, strategy |

### Project Management Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `archive_project` | Archive a project | Project System | projectId |
| `backup_project` | Backup a project | Project System | projectId, destination |

### Notification Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `send_notification` | Send in-app notification | Notification System | title, message, type, channels |
| `send_email` | Send email notification | Email System | to, subject, body, template |

### Memory Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `update_memory` | Update creative memory | Creative Memory | key, value, category |

### Control Actions

| Action Type | Description | Target Module | Config Fields |
|---|---|---|---|
| `wait` | Wait for a duration | System | durationMs |
| `delay` | Delay before next action | System | delayMs |
| `stop` | Stop execution | System | reason |

## Action Structure

```typescript
interface Action {
  type: ActionType;
  config: Record<string, unknown>;
  order: number;
  skipOnError?: boolean;
}
```

### Fields

- `type`: One of the 21 supported action types
- `config`: Type-specific configuration object
- `order`: Integer determining execution order (lower = first)
- `skipOnError`: If `true`, continue to next action on failure (default: `false`)

## Action Execution Flow

```
1. Retrieve actions array from rule
    |
2. Sort actions by order (ascending)
    |
3. For each action in sorted order:
    |
    3a. Execute action via executeSingleAction()
    |    |
    |    3b. [Success] --> Record result with success: true
    |    |
    |    3c. [Failure] --> Record error
    |         |
    |         3d. Check skipOnError
    |              |
    |              [false] --> BREAK (stop all subsequent actions)
    |              [true]  --> CONTINUE to next action
    |
4. Return aggregated results and errors
```

### Implementation

```typescript
async executeActions(actions: Action[], context: Record<string, unknown>) {
  const results: Record<string, unknown>[] = [];
  const errors: string[] = [];

  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  for (const action of sortedActions) {
    try {
      const result = await this.executeSingleAction(action, context);
      results.push({ action: action.type, result, success: true });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${action.type}: ${errorMsg}`);
      if (!action.skipOnError) {
        break;
      }
    }
  }

  return { results, errors };
}
```

## Skip on Error

The `skipOnError` flag controls fault tolerance per action:

| skipOnError | Behavior on Failure |
|---|---|
| `false` (default) | Execution halts; all subsequent actions are skipped |
| `true` | Error is logged; execution continues with the next action |

### Example

```json
[
  { "type": "generate_images", "order": 1, "skipOnError": false },
  { "type": "generate_captions", "order": 2, "skipOnError": true },
  { "type": "publish_content", "order": 3, "skipOnError": false }
]
```

If `generate_images` fails, the entire execution halts. If `generate_captions` fails, `publish_content` still executes. If `publish_content` fails, the execution halts.

## Action Ordering

Actions are sorted by the `order` field before execution:

```typescript
const sortedActions = [...actions].sort((a, b) => a.order - b.order);
```

- Order values are integers
- Lower order values execute first
- Actions with the same order value maintain their relative insertion order
- Recommended: Use sequential integers (1, 2, 3...) for clarity

## Module Integration

Each action type maps to a specific module in the Tamer Studio system. The `executeSingleAction()` method dispatches to the appropriate module based on action type.

### Integration Pattern

```typescript
private async executeSingleAction(action: Action, context: Record<string, unknown>) {
  // In production, this dispatches to the appropriate module
  // Currently returns execution metadata
  return {
    type: action.type,
    config: action.config,
    context,
    executed: true,
    timestamp: new Date().toISOString()
  };
}
```

### Module Map

| Action Category | Modules |
|---|---|
| Content Generation | Image AI, Video AI, Story AI, Thumbnail AI, Caption AI, Hashtag AI, Affiliate AI |
| Workflow | Workflow Engine, Project System |
| Publishing | Publishing Module, Publishing Scheduler |
| Analytics | Analytics Module, Content Optimizer |
| Management | Project System, Creative Memory |
| Notification | Notification System, Email System |
| Control | System (wait, delay, stop) |

## Return Value

```typescript
{
  results: Array<{
    action: string;      // Action type
    result: object;      // Action-specific result
    success: boolean;    // Always true for successful actions
  }>;
  errors: string[];      // Error messages for failed actions
}
```
