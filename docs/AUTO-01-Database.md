# AUTO-01: Database Design

## Overview

The Automation Center uses 8 PostgreSQL tables managed through Drizzle ORM. All tables share a common pattern with `id`, `userId`, `createdAt`, and `updatedAt` fields. The schema is defined in `src/lib/db/schema/automation.ts`.

## Tables

### 1. `automation_rule`

Stores automation rule definitions.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `arule_xxx`) |
| `user_id` | text | - | No | Owner user ID |
| `name` | varchar(200) | - | No | Rule name |
| `description` | text | - | Yes | Rule description |
| `status` | varchar(50) | `"draft"` | No | Rule status |
| `priority` | varchar(50) | `"normal"` | No | Execution priority |
| `trigger_config` | jsonb | `{}` | No | Trigger configuration |
| `conditions` | jsonb | `[]` | No | Condition array |
| `actions` | jsonb | `[]` | No | Action array |
| `schedule_config` | jsonb | `{}` | No | Schedule configuration |
| `retry_config` | jsonb | `{}` | No | Retry configuration |
| `tags` | jsonb | `[]` | No | Categorization tags |
| `is_enabled` | boolean | `true` | No | Enabled state |
| `execution_count` | integer | `0` | No | Total executions |
| `success_count` | integer | `0` | No | Successful executions |
| `failure_count` | integer | `0` | No | Failed executions |
| `last_triggered_at` | timestamp | - | Yes | Last trigger time |
| `last_status` | varchar(50) | - | Yes | Last execution status |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |
| `updated_at` | timestamp | `now()` | No | Last update timestamp |

**Indexes:**
- `auto_rule_user_idx` on `user_id`
- `auto_rule_status_idx` on `status`
- `auto_rule_enabled_idx` on `is_enabled`

### 2. `automation_template`

Stores pre-configured automation templates.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `atmpl_xxx`) |
| `name` | varchar(200) | - | No | Template name |
| `description` | text | - | Yes | Template description |
| `category` | varchar(100) | - | Yes | Template category |
| `type` | varchar(100) | - | No | Template type |
| `icon` | varchar(100) | - | Yes | UI icon identifier |
| `trigger_config` | jsonb | `{}` | No | Trigger configuration |
| `conditions` | jsonb | `[]` | No | Condition array |
| `actions` | jsonb | `[]` | No | Action array |
| `schedule_config` | jsonb | `{}` | No | Schedule configuration |
| `retry_config` | jsonb | `{}` | No | Retry configuration |
| `estimated_credits` | integer | `0` | No | Estimated credit cost |
| `estimated_duration_ms` | integer | `0` | No | Estimated execution time |
| `tags` | jsonb | `[]` | No | Categorization tags |
| `is_system` | boolean | `false` | No | System template flag |
| `is_active` | boolean | `true` | No | Active state |
| `usage_count` | integer | `0` | No | Times used to create rules |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |
| `updated_at` | timestamp | `now()` | No | Last update timestamp |

**Indexes:**
- `auto_template_type_idx` on `type`
- `auto_template_category_idx` on `category`

### 3. `automation_execution`

Tracks automation rule execution history.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `aexec_xxx`) |
| `user_id` | text | - | No | Owner user ID |
| `rule_id` | text | - | Yes | Associated rule ID |
| `template_id` | text | - | Yes | Associated template ID |
| `status` | varchar(50) | `"pending"` | No | Execution status |
| `trigger_type` | varchar(100) | - | Yes | Trigger type that initiated execution |
| `trigger_data` | jsonb | `{}` | No | Trigger-specific data |
| `conditions_result` | jsonb | `{}` | No | Condition evaluation results |
| `actions_result` | jsonb | `{}` | No | Action execution results |
| `current_action` | varchar(200) | - | Yes | Currently executing action |
| `completed_actions` | integer | `0` | No | Number of completed actions |
| `total_actions` | integer | `0` | No | Total action count |
| `progress` | integer | `0` | No | Progress percentage (0-100) |
| `error` | text | - | Yes | Error message if failed |
| `credits_used` | integer | `0` | No | Credits consumed |
| `started_at` | timestamp | - | Yes | Execution start time |
| `completed_at` | timestamp | - | Yes | Execution end time |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |
| `updated_at` | timestamp | `now()` | No | Last update timestamp |

**Indexes:**
- `auto_exec_user_idx` on `user_id`
- `auto_exec_rule_idx` on `rule_id`
- `auto_exec_status_idx` on `status`

### 4. `automation_queue`

Manages execution queue with priorities.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `aque_xxx`) |
| `user_id` | text | - | No | Owner user ID |
| `execution_id` | text | - | No | Associated execution ID |
| `status` | varchar(50) | `"waiting"` | No | Queue item status |
| `priority` | varchar(50) | `"normal"` | No | Processing priority |
| `position` | integer | - | No | FIFO position |
| `scheduled_at` | timestamp | - | Yes | Future execution time |
| `started_at` | timestamp | - | Yes | Processing start time |
| `completed_at` | timestamp | - | Yes | Processing end time |
| `estimated_credits` | integer | `0` | No | Estimated credit cost |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |
| `updated_at` | timestamp | `now()` | No | Last update timestamp |

**Indexes:**
- `auto_queue_user_idx` on `user_id`
- `auto_queue_status_idx` on `status`
- `auto_queue_scheduled_idx` on `scheduled_at`

### 5. `automation_schedule`

Manages time-based automation schedules.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `asched_xxx`) |
| `user_id` | text | - | No | Owner user ID |
| `rule_id` | text | - | Yes | Associated rule ID |
| `name` | varchar(200) | - | No | Schedule name |
| `type` | varchar(50) | - | No | Schedule type |
| `cron_expression` | varchar(100) | - | Yes | Cron expression |
| `interval_ms` | integer | - | Yes | Interval in milliseconds |
| `start_time` | timestamp | - | Yes | Schedule start time |
| `end_time` | timestamp | - | Yes | Schedule end time |
| `timezone` | varchar(50) | `"UTC"` | No | Timezone |
| `last_run_at` | timestamp | - | Yes | Last execution time |
| `next_run_at` | timestamp | - | Yes | Next execution time |
| `run_count` | integer | `0` | No | Execution count |
| `max_runs` | integer | - | Yes | Maximum execution limit |
| `is_active` | boolean | `true` | No | Active state |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |
| `updated_at` | timestamp | `now()` | No | Last update timestamp |

**Indexes:**
- `auto_sched_user_idx` on `user_id`
- `auto_sched_rule_idx` on `rule_id`
- `auto_sched_next_idx` on `next_run_at`

### 6. `automation_event`

Tracks system events for automation triggers.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `aevt_xxx`) |
| `user_id` | text | - | No | Owner user ID |
| `event_type` | varchar(100) | - | No | Event type identifier |
| `source` | varchar(100) | - | Yes | Event source module |
| `entity_id` | text | - | Yes | Related entity ID |
| `entity_type` | varchar(50) | - | Yes | Related entity type |
| `data` | jsonb | `{}` | No | Event-specific data |
| `processed` | boolean | `false` | No | Processing state |
| `processed_at` | timestamp | - | Yes | Processing timestamp |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |

**Indexes:**
- `auto_event_user_idx` on `user_id`
- `auto_event_type_idx` on `event_type`
- `auto_event_processed_idx` on `processed`

### 7. `automation_report`

Stores generated analytics reports.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `arep_xxx`) |
| `user_id` | text | - | No | Owner user ID |
| `report_type` | varchar(100) | - | No | Report type identifier |
| `period` | varchar(50) | - | Yes | Time period |
| `data` | jsonb | `{}` | No | Detailed report data |
| `summary` | jsonb | `{}` | No | Aggregated summary |
| `generated_at` | timestamp | `now()` | No | Generation timestamp |
| `metadata` | jsonb | `{}` | No | Additional metadata |

**Indexes:**
- `auto_report_user_idx` on `user_id`
- `auto_report_type_idx` on `report_type`

### 8. `automation_settings`

Per-user automation configuration.

| Column | Type | Default | Nullable | Description |
|---|---|---|---|---|
| `id` | text | - | No | Primary key (prefixed: `aset_xxx`) |
| `user_id` | text | - | No | Owner user ID (unique) |
| `max_concurrent_executions` | integer | `5` | No | Max parallel executions |
| `max_queue_size` | integer | `100` | No | Max queue items |
| `max_retries` | integer | `3` | No | Max retry attempts |
| `retry_delay_ms` | integer | `5000` | No | Delay between retries |
| `auto_retry` | boolean | `true` | No | Enable auto-retry |
| `notifications_enabled` | boolean | `true` | No | Enable notifications |
| `credit_warning_threshold` | integer | `100` | No | Credit warning level |
| `default_priority` | varchar(50) | `"normal"` | No | Default queue priority |
| `allowed_modules` | jsonb | `[]` | No | Allowed AI modules |
| `excluded_modules` | jsonb | `[]` | No | Excluded AI modules |
| `metadata` | jsonb | `{}` | No | Additional metadata |
| `created_at` | timestamp | `now()` | No | Creation timestamp |
| `updated_at` | timestamp | `now()` | No | Last update timestamp |

**Indexes:**
- `auto_settings_user_idx` on `user_id`
- `auto_settings_user_unique` on `user_id` (unique constraint)

## Relations

### Rule Relations

```
automation_rule (1) ---> (many) automation_execution
automation_rule (1) ---> (many) automation_schedule
```

### Execution Relations

```
automation_execution (many) <--- (1) automation_rule
```

### Queue Relations

```
automation_queue (many) <--- (1) automation_execution
```

### Schedule Relations

```
automation_schedule (many) <--- (1) automation_rule
```

### Standalone Tables

- `automation_template` - No foreign key relations
- `automation_event` - No foreign key relations
- `automation_report` - No foreign key relations
- `automation_settings` - No foreign key relations

## ID Prefixes

| Table | Prefix | Example |
|---|---|---|
| `automation_rule` | `arule_` | `arule_abc123` |
| `automation_template` | `atmpl_` | `atmpl_xyz789` |
| `automation_execution` | `aexec_` | `aexec_def456` |
| `automation_queue` | `aque_` | `aque_ghi012` |
| `automation_schedule` | `asched_` | `asched_jkl345` |
| `automation_event` | `aevt_` | `aevt_mno678` |
| `automation_report` | `arep_` | `arep_pqr901` |
| `automation_settings` | `aset_` | `aset_stu234` |
