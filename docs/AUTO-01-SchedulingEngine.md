# AUTO-01: Scheduling Engine

## Overview

The Scheduling Engine manages time-based automation rule execution. It handles schedule creation, next-run calculation, execution tracking, and automatic deactivation when limits are reached.

## Schedule Types

| Type | Description | Next-Run Calculation |
|---|---|---|
| `once` | Executes once | Current time + intervalMs (default: 60s) |
| `daily` | Executes once per day | Next day at midnight (00:00:00) |
| `weekly` | Executes once per week | 7 days from now at midnight |
| `monthly` | Executes once per month | 1st of next month at midnight |
| `yearly` | Executes once per year | January 1st of next year at midnight |
| `interval` | Executes at fixed intervals | Current time + intervalMs (default: 1 hour) |
| `cron` | Cron-based scheduling | Calculated from cron expression |

## Schedule Structure

```typescript
{
  id: string;              // Prefixed ID: "asched_xxx"
  userId: string;          // Owner
  ruleId?: string;         // Associated automation rule
  name: string;            // Schedule name (max 200 chars)
  type: ScheduleType;      // Schedule type
  cronExpression?: string; // For cron type
  intervalMs?: number;     // For interval/once types
  startTime?: Date;        // Optional start boundary
  endTime?: Date;          // Optional end boundary
  timezone: string;        // Timezone (default: "UTC")
  lastRunAt?: Date;        // Last execution timestamp
  nextRunAt?: Date;        // Next scheduled execution
  runCount: number;        // Number of times executed
  maxRuns?: number;        // Maximum execution limit
  isActive: boolean;       // Whether schedule is active
}
```

## Next-Run Calculation

The `calculateNextRun()` method determines when a schedule should next execute:

### Implementation

```typescript
private calculateNextRun(type: ScheduleType, intervalMs?: number, cronExpression?: string): Date {
  const now = new Date();
  switch (type) {
    case "once":
      return new Date(now.getTime() + (intervalMs || 60000));
    case "interval":
      return new Date(now.getTime() + (intervalMs || 3600000));
    case "daily":
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    case "weekly":
      const w = new Date(now);
      w.setDate(w.getDate() + 7);
      w.setHours(0, 0, 0, 0);
      return w;
    case "monthly":
      const m = new Date(now);
      m.setMonth(m.getMonth() + 1);
      m.setDate(1);
      m.setHours(0, 0, 0, 0);
      return m;
    case "yearly":
      const y = new Date(now);
      y.setFullYear(y.getFullYear() + 1);
      y.setMonth(0);
      y.setDate(1);
      y.setHours(0, 0, 0, 0);
      return y;
    default:
      return new Date(now.getTime() + 3600000);
  }
}
```

### Defaults

| Type | Default Interval |
|---|---|
| `once` | 60,000 ms (1 minute) |
| `interval` | 3,600,000 ms (1 hour) |
| `daily` | Next midnight |
| `weekly` | Next midnight + 7 days |
| `monthly` | 1st of next month |
| `yearly` | January 1st of next year |

## Timezone Support

Each schedule has a `timezone` field (default: `"UTC"`) that determines when time-based calculations are relative to. The system stores timestamps in UTC and converts based on the configured timezone.

## Max Runs Limit

The `maxRuns` field limits how many times a schedule can execute:

- `null` or `undefined`: Unlimited executions
- Positive integer: Execution stops after reaching this count

### Deactivation Logic

```typescript
async markScheduleExecuted(scheduleId: string) {
  const schedule = await this.getSchedule(scheduleId);
  const newRunCount = schedule.runCount + 1;
  const shouldContinue = !schedule.maxRuns || newRunCount < schedule.maxRuns;

  return db.update(automationSchedule).set({
    lastRunAt: new Date(),
    nextRunAt: shouldContinue
      ? this.calculateNextRun(schedule.type, schedule.intervalMs, schedule.cronExpression)
      : null,
    runCount: newRunCount,
    isActive: shouldContinue,  // Auto-deactivate when limit reached
  });
}
```

When `maxRuns` is reached:
- `isActive` is set to `false`
- `nextRunAt` is set to `null`
- The schedule stops executing

## Due Schedule Detection

The `getDueSchedules()` method identifies schedules that are ready to execute:

```typescript
async getDueSchedules() {
  const now = new Date();
  return db.select().from(automationSchedule)
    .where(and(
      eq(automationSchedule.isActive, true),
      lte(automationSchedule.nextRunAt, now)
    ))
    .orderBy(automationSchedule.nextRunAt);
}
```

A schedule is "due" when:
1. `isActive === true`
2. `nextRunAt <= now` (current time)

Due schedules are ordered by `nextRunAt` (earliest first).

## CRUD Operations

| Method | Description |
|---|---|
| `listSchedules(userId, filters?)` | List schedules with pagination |
| `createSchedule(userId, data)` | Create a new schedule |
| `getSchedule(id)` | Get a single schedule |
| `updateSchedule(id, data)` | Update a schedule |
| `deleteSchedule(id)` | Delete a schedule |
| `toggleSchedule(id, isActive)` | Enable or disable a schedule |
| `getDueSchedules()` | Get schedules ready to execute |
| `markScheduleExecuted(scheduleId)` | Record execution and calculate next run |
| `getStats(userId)` | Get schedule statistics |

## Statistics

```typescript
{
  totalSchedules: number;       // All schedules for user
  activeSchedules: number;      // Currently active schedules
  totalScheduledRuns: number;   // Sum of all runCount values
}
```
