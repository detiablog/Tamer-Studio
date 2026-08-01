# AUTO-01: Trigger Engine

## Overview

The Trigger Engine defines what initiates an automation rule execution. Triggers are configured as part of a rule's `triggerConfig` and determine when the Rule Engine should evaluate conditions and execute actions.

## Trigger Types

The system supports 15 trigger types across four categories:

### System Event Triggers

| Trigger Type | Description | Typical Use Case |
|---|---|---|
| `project_created` | Fired when a new project is created | Auto-assign template, generate initial content |
| `workflow_finished` | Fired when a workflow completes | Trigger next workflow, send notification |
| `image_generated` | Fired when image generation completes | Auto-generate captions, schedule publishing |
| `video_generated` | Fired when video generation completes | Generate thumbnails, create social posts |
| `story_generated` | Fired when story generation completes | Generate companion media, publish |
| `publishing_completed` | Fired when content is published successfully | Track analytics, trigger follow-up |
| `publishing_failed` | Fired when publishing fails | Retry, notify user, log error |
| `campaign_completed` | Fired when a campaign finishes | Generate report, archive assets |
| `credits_low` | Fired when credit balance is low | Pause automations, send warning |
| `storage_low` | Fired when storage is low | Archive old projects, send warning |
| `subscription_changed` | Fired when subscription status changes | Update automation limits, notify |

### Manual Triggers

| Trigger Type | Description | Typical Use Case |
|---|---|---|
| `manual` | Explicitly triggered by user action | On-demand content generation, testing |

### Schedule-Based Triggers

| Trigger Type | Description | Typical Use Case |
|---|---|---|
| `specific_date` | Fires once at a specific date/time | One-time scheduled task |
| `recurring_schedule` | Fires on a recurring schedule | Daily content generation, weekly reports |

### External Triggers

| Trigger Type | Description | Typical Use Case |
|---|---|---|
| `webhook` | Fired by external HTTP request | Integration with third-party services |

## Trigger Configuration

Each trigger type has a specific configuration format stored in `triggerConfig.config`:

```typescript
interface TriggerConfig {
  type: TriggerType;
  config: Record<string, unknown>;
}
```

### System Event Configuration

```typescript
{
  type: "image_generated",
  config: {
    // Optional: filter by specific entity
    entityType: "project",
    // Optional: filter by specific source
    source: "ai-module"
  }
}
```

### Manual Trigger Configuration

```typescript
{
  type: "manual",
  config: {}
}
```

### Schedule Trigger Configuration

```typescript
{
  type: "recurring_schedule",
  config: {
    scheduleType: "daily",       // once | daily | weekly | monthly | yearly | interval | cron
    intervalMs: 86400000,        // For interval type
    cronExpression: "0 9 * * *", // For cron type
    timezone: "UTC"
  }
}
```

### Webhook Trigger Configuration

```typescript
{
  type: "webhook",
  config: {
    secret: "webhook-secret-for-validation",
    methods: ["POST"],
    path: "/custom-webhook-path"
  }
}
```

## Event-Driven Triggers

System event triggers operate through the event flow:

1. An AI module or system component emits an event via `recordEvent()`
2. The event is persisted in the `automation_event` table
3. The system matches the event type against enabled rules' trigger configurations
4. Matched rules have their conditions evaluated against the event context
5. Matching rules are queued for execution

### Event Data Structure

```typescript
{
  eventType: string;              // e.g., "image_generated"
  source?: string;                // e.g., "image-ai-module"
  entityId?: string;              // e.g., project ID
  entityType?: string;            // e.g., "project"
  data?: Record<string, unknown>; // Event-specific payload
}
```

## Schedule-Based Triggers

Schedule triggers work through the Scheduling Engine:

1. User creates a rule with a schedule-based trigger
2. A corresponding schedule is created in the `automation_schedule` table
3. The Scheduling Engine calculates the next run time
4. At the scheduled time, the rule is triggered automatically
5. The schedule's `runCount` is incremented and next run is calculated

### Schedule Types

| Type | Behavior |
|---|---|
| `once` | Executes once at the specified time |
| `daily` | Executes once per day at midnight |
| `weekly` | Executes once per week (7-day intervals) |
| `monthly` | Executes once per month (1st of month) |
| `yearly` | Executes once per year (January 1st) |
| `interval` | Executes at fixed millisecond intervals |
| `cron` | Executes based on cron expression (future enhancement) |

## Manual Triggers

Manual triggers allow users to execute a rule on-demand:

1. User sends POST to `/api/automation/{id}/execute`
2. The system creates an execution record
3. Conditions are evaluated against the provided context
4. If conditions pass, actions are executed immediately
5. Results are returned to the user

## Webhook Triggers

Webhook triggers enable external systems to initiate automations:

1. External system sends HTTP request to the webhook endpoint
2. The system validates the request (secret, method)
3. An event is recorded with the webhook payload
4. Matching rules are triggered and executed

## Trigger Priority

When multiple triggers fire simultaneously, rules are processed based on:
1. Rule priority (`high` > `normal` > `low`)
2. Queue position (FIFO within same priority)
3. Enabled state (only enabled rules are processed)
