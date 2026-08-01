# AUTO-01: Intelligent Automation Center -- Architecture

## System Overview

The Intelligent Automation Center is a core subsystem within Tamer Studio that provides event-driven automation capabilities for AI-powered content creation workflows. It enables users to define rules that automatically trigger actions in response to system events, schedules, or manual invocations.

The system follows a modular, engine-based architecture where each engine handles a specific concern (rules, triggers, conditions, actions, scheduling, queuing, reporting, settings, and templates). All engines share a common database schema and are exposed through a unified REST API.

## Purpose

- Automate repetitive content creation tasks (image generation, video generation, publishing, etc.)
- Enable event-driven workflows across all AI modules
- Provide scheduling capabilities for time-based automation
- Offer queue-based execution with priority management
- Track execution history, credit usage, and performance metrics

## Architecture Diagram

```
+------------------------------------------------------------------+
|                         Client Layer                              |
|   Admin Panel  |  Dashboard  |  External Integrations (Webhooks) |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                         API Layer (24 endpoints)                  |
|  /api/automation/*                                                 |
|  Authentication | Validation | Error Mapping | Pagination         |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      Engine Layer                                  |
|  +----------------+  +----------------+  +------------------+     |
|  | Rule Engine    |  | Trigger Engine |  | Condition Engine |     |
|  | (CRUD, eval)   |  | (15 types)    |  | (operators,      |     |
|  +----------------+  +----------------+  |  nested groups)  |     |
|  +----------------+  +----------------+  +------------------+     |
|  | Action Engine  |  | Scheduling    |  | Queue Manager    |     |
|  | (21 types)     |  | Engine (7     |  | (priority,       |     |
|  +----------------+  | schedule      |  |  retry)          |     |
|  +----------------+  | types)        |  +------------------+     |
|  | Report Engine  |  +----------------+                           |
|  | (analytics)    |  +----------------+  +------------------+     |
|  +----------------+  | Template      |  | Settings Service |     |
|                      | Engine        |  | (per-user config)|     |
|                      +----------------+  +------------------+     |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    Data Layer (Drizzle ORM / PostgreSQL)           |
|  automation_rule | automation_template | automation_execution      |
|  automation_queue | automation_schedule | automation_event          |
|  automation_report | automation_settings                           |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                   Integration Layer                                |
|  AI Orchestrator | Workflow Engine | AI Modules (Image, Video,    |
|  Story, Thumbnail, Captions, Hashtags, Publishing, Analytics)     |
+------------------------------------------------------------------+
```

## Core Components

### 1. Rule Engine (`rule-engine.service.ts`)

The central component responsible for rule lifecycle management and condition evaluation.

- **CRUD operations** for automation rules (create, read, update, delete, toggle)
- **Condition evaluation** with nested AND/OR logic groups
- **Action execution** with ordered sequencing and skip-on-error support
- **Execution recording** with progress tracking and credit accounting
- **Event recording** for event sourcing

### 2. Trigger Engine (integrated in Rule Engine + API layer)

Defines what initiates an automation rule execution.

- 15 supported trigger types covering system events, manual invocations, schedules, and webhooks
- Configuration stored as JSONB in `automation_rule.trigger_config`

### 3. Condition Engine (integrated in Rule Engine)

Evaluates whether a rule's actions should execute based on context data.

- 10 condition operators (equals, not_equals, contains, greater_than, etc.)
- Nested condition groups with AND/OR logical operators
- Dot-notation field access for nested context objects

### 4. Action Engine (integrated in Rule Engine)

Executes the actions defined in a rule when conditions are satisfied.

- 21 action types spanning all AI modules and system operations
- Ordered execution based on `action.order`
- Skip-on-error flag per action for fault tolerance
- Integration points with all AI modules

### 5. Scheduling Engine (`scheduling-engine.service.ts`)

Manages time-based rule execution.

- 7 schedule types: once, daily, weekly, monthly, yearly, interval, cron
- Next-run calculation based on schedule type
- Max-runs limit with automatic deactivation
- Timezone-aware scheduling

### 6. Queue Engine (`queue-engine.service.ts`)

Manages execution queue with priority-based processing.

- Priority system: high, normal, low
- FIFO ordering within same priority
- Scheduled execution support (future enqueue)
- Retry mechanism for failed items
- Queue status tracking with credit estimation

### 7. Report Engine (`report-engine.service.ts`)

Generates analytics and performance reports.

- Execution success/failure rate analysis
- Credit usage tracking
- Period-based reporting (daily, weekly, monthly)
- Automated summary generation

### 8. Template Engine (`template-engine.service.ts`)

Manages pre-configured automation templates.

- System and user-created templates
- Template-to-rule conversion with overrides
- Usage counting and popularity tracking
- Category and type filtering

### 9. Settings Service (`settings.service.ts`)

Per-user automation configuration management.

- Default settings auto-creation
- Upsert pattern for configuration updates
- Module allow/exclude lists

## Data Flow

```
Event Occurs (system event / webhook / schedule / manual)
    |
    v
Automation Engine receives event
    |
    v
Rule Engine matches event to enabled rules
    |
    v
Condition Engine evaluates rule conditions against context
    |
    v
[If conditions satisfied]
    |
    v
Queue Manager enqueues execution with priority
    |
    v
Action Engine dequeues and executes actions in order
    |
    v
Actions invoke AI Orchestrator / Workflow Engine / AI Modules
    |
    v
Execution results recorded in automation_execution
    |
    v
Report Engine aggregates metrics
    |
    v
Notifications sent (if configured)
```

## Integration Points

### AI Orchestrator

- Automation rules can trigger orchestrator pipelines
- `run_workflow` action type invokes the orchestrator
- Orchestrator automation rules (`orchestratorRule`) provide a separate but complementary rule system
- The orchestrator service (`automation-rules.service.ts`) manages rules at the orchestrator level

### Workflow Engine

- `run_workflow` action executes workflow sequences
- Workflow completion events (`workflow_finished`) serve as triggers
- Integration through the action engine's `executeSingleAction` method

### AI Modules

| Action Type | Target Module |
|---|---|
| `generate_images` | Image Generation |
| `generate_videos` | Video Generation |
| `generate_story` | Story Generation |
| `generate_thumbnail` | Thumbnail Generator |
| `generate_captions` | Caption Generator |
| `generate_hashtags` | Hashtag Generator |
| `generate_affiliate` | Affiliate Content |
| `analyze_performance` | Analytics Module |
| `run_optimizer` | Content Optimizer |
| `publish_content` | Publishing Module |
| `schedule_publishing` | Publishing Scheduler |
| `update_memory` | Creative Memory |

## File Structure

```
src/core/automation/
  index.ts                    # Barrel exports
  rule-engine.service.ts      # Rule Engine + Condition Engine + Action Engine
  scheduling-engine.service.ts # Scheduling Engine
  queue-engine.service.ts     # Queue Manager
  template-engine.service.ts  # Template Engine
  settings.service.ts         # Settings Service
  report-engine.service.ts    # Report Engine

src/lib/db/schema/
  automation.ts               # Database schema (8 tables)

src/app/api/automation/
  route.ts                    # GET/POST rules
  [id]/route.ts               # GET/PUT/DELETE rule
  [id]/toggle/route.ts        # Toggle rule
  [id]/execute/route.ts       # Execute rule
  evaluate/route.ts           # Evaluate conditions
  events/route.ts             # GET/POST events
  executions/route.ts         # GET executions
  executions/[id]/route.ts    # GET execution
  executions/[id]/cancel/route.ts # Cancel execution
  queue/route.ts              # GET/POST queue
  queue/[id]/route.ts         # DELETE queue item
  queue/[id]/retry/route.ts   # Retry queue item
  queue/[id]/priority/route.ts # Reprioritize queue item
  queue/status/route.ts       # GET queue status
  schedules/route.ts          # GET/POST schedules
  schedules/[id]/route.ts     # GET/PUT/DELETE schedule
  schedules/[id]/toggle/route.ts # Toggle schedule
  reports/route.ts            # GET/POST reports
  reports/[id]/route.ts       # GET/DELETE report
  settings/route.ts           # GET/PUT settings
  stats/route.ts              # GET statistics
  templates/route.ts          # GET/POST templates
  templates/[id]/route.ts     # GET/PUT/DELETE template
  templates/[id]/use/route.ts # Create rule from template
```
