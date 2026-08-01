# AUTO-01: Automation Center Design

## Central Automation Role

The Automation Center serves as the orchestration hub for all automated workflows within Tamer Studio. It acts as the bridge between system events and the execution of AI-powered content creation tasks. Rather than requiring manual intervention for every action, the Automation Center enables users to define rules that respond to events, schedules, and conditions automatically.

The center occupies a central position in the system architecture, connecting the event layer (system events, webhooks, schedules) to the execution layer (AI modules, workflows, publishing).

## Relationship with Workflow Engine

The Automation Center and Workflow Engine operate as complementary systems:

- **Automation Center** defines *what* triggers and *what conditions* must be met
- **Workflow Engine** defines *how* multi-step tasks are orchestrated

When an automation rule contains a `run_workflow` action, the Automation Center delegates execution to the Workflow Engine. The Workflow Engine then manages the step-by-step execution of the workflow, reporting back status and results.

Conversely, the Workflow Engine can emit events (e.g., `workflow_finished`) that the Automation Center consumes as triggers for other rules.

```
Automation Center                    Workflow Engine
    |                                     |
    |--- run_workflow action ------------->|
    |                                     |-- execute steps
    |<-- workflow_finished event ----------|
    |                                     |
    |-- triggers next rule if needed -->  |
```

## Relationship with AI Orchestrator

The AI Orchestrator provides a higher-level orchestration layer that the Automation Center can leverage:

- The Automation Center can invoke orchestrator pipelines through the `run_workflow` action
- The orchestrator's own rule system (`orchestratorRule` in `src/core/orchestrator/automation-rules.service.ts`) operates at the pipeline level
- The Automation Center operates at the action level, providing more granular control

The two systems are independent but can be composed for complex automation scenarios.

## Automation Lifecycle

### 1. Rule Definition

A user creates an automation rule with:
- A name and description
- A trigger configuration (what initiates the rule)
- Optional conditions (when the rule should execute)
- Actions (what the rule does)

Rules are stored in the `automation_rule` table with a status of `draft` and `isEnabled` defaulting to `true`.

### 2. Rule Activation

When a rule is toggled on (`isEnabled: true`), it becomes eligible for execution. Rules can be filtered by status (`draft`, `active`, `paused`, `completed`) and enabled state.

### 3. Event Reception

Events arrive through multiple channels:
- **System events**: Emitted by AI modules when tasks complete (e.g., `image_generated`, `publishing_completed`)
- **Schedule triggers**: The Scheduling Engine detects due schedules and triggers the associated rule
- **Manual triggers**: Users explicitly execute a rule through the API
- **Webhooks**: External systems send HTTP requests to trigger rules

### 4. Condition Evaluation

When an event matches a rule's trigger type, the Condition Engine evaluates the rule's conditions against the current context:
- Empty conditions always pass (all rules execute if no conditions defined)
- Nested groups are evaluated recursively
- AND/OR logical operators control evaluation flow

### 5. Action Execution

If conditions are satisfied, the Action Engine executes the rule's actions:
- Actions are sorted by `order` field and executed sequentially
- Each action receives the current context and produces results
- Failed actions can be skipped (`skipOnError: true`) or halt execution
- Results are aggregated and stored

### 6. Execution Recording

Each execution is recorded in the `automation_execution` table with:
- Status tracking (`pending`, `running`, `completed`, `failed`)
- Progress percentage
- Credit usage
- Error details
- Timestamps for started/completed

### 7. Reporting

The Report Engine aggregates execution data to produce:
- Success/failure rates
- Credit consumption analysis
- Performance trends over time

## Event-Driven Architecture

The Automation Center implements an event-driven architecture:

### Event Sources

| Source | Example Events |
|---|---|
| Image Generation | `image_generated` |
| Video Generation | `video_generated` |
| Story Generation | `story_generated` |
| Publishing Module | `publishing_completed`, `publishing_failed` |
| Campaign System | `campaign_completed` |
| Credit System | `credits_low` |
| Storage System | `storage_low` |
| Subscription System | `subscription_changed` |
| Workflow Engine | `workflow_finished` |
| Project System | `project_created` |
| External | `webhook` |
| Manual | `manual` |

### Event Processing Flow

1. Event is recorded in the `automation_event` table via `recordEvent()`
2. System matches event type to enabled rules with matching trigger types
3. For each matched rule, conditions are evaluated against event context
4. Matching rules are enqueued for execution
5. Queue Manager processes executions based on priority
6. Action Engine executes the rule's actions
7. Execution results are recorded
8. Reports are updated

### Event Guarantees

- Events are persisted before processing (at-least-once delivery)
- Failed executions can be retried through the Queue Manager
- Duplicate events are handled through idempotency in action execution
