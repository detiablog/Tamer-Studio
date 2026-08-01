# AI Orchestrator - Overall Architecture

## System Overview

The AI Orchestrator is the central coordination layer of the Tamer Studio platform. It manages the lifecycle of multi-step AI workflows by analyzing user intent, constructing execution pipelines, scheduling tasks, managing queues, estimating resource costs, and enforcing automation rules. The system provides a unified REST API for creating, executing, monitoring, and canceling AI-driven pipelines across all integrated AI modules.

## Architecture Diagram

```
+------------------------------------------------------------------+
|                         Client (Browser)                          |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      Next.js API Layer                            |
|            src/app/api/orchestrator/**                            |
+------------------------------------------------------------------+
        |         |         |         |         |         |
        v         v         v         v         v         v
+-----------+ +-------+ +--------+ +-------+ +-------+ +--------+
|  Intent   | |Pipeline| |  Task  | | Queue | | Auto- | |Resource|
|  Analyzer | |Builder | |Scheduler| |Manager| |mation | |Estimator|
|           | |        | |        | |       | |Rules  | |        |
+-----------+ +-------+ +--------+ +-------+ +-------+ +--------+
        |         |         |         |         |         |
        v         v         v         v         v         v
+------------------------------------------------------------------+
|                    Orchestrator Settings Service                   |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    PostgreSQL (Drizzle ORM)                        |
|           8 tables: pipeline, pipelineStep, execution,            |
|           task, queue, template, rule, settings                   |
+------------------------------------------------------------------+
```

## Core Components

### 1. Intent Analyzer (`intent-analyzer.service.ts`)

Analyzes natural language user input to determine the intended workflow type. Uses keyword-based matching to classify intent across 10 domain types and recommends appropriate modules and pipeline templates.

- Source: `src/core/orchestrator/intent-analyzer.service.ts`
- API: `POST /api/orchestrator/analyze`

### 2. Pipeline Builder (`pipeline-builder.service.ts`)

Manages the CRUD lifecycle of pipelines, pipeline steps, executions, and templates. Provides pagination, filtering, and template-based pipeline instantiation. This is the largest service, handling pipelines, steps, executions, templates, and statistics.

- Source: `src/core/orchestrator/pipeline-builder.service.ts`
- API: `GET/POST /api/orchestrator`, `GET/PUT/DELETE /api/orchestrator/[id]`, and nested step/execution/template endpoints

### 3. Task Scheduler (`task-scheduler.service.ts`)

Manages individual task lifecycle within an execution. Supports status tracking, priority management, retry logic, and cancellation. Tasks represent the atomic units of work dispatched to specific AI modules.

- Source: `src/core/orchestrator/task-scheduler.service.ts`
- API: `GET /api/orchestrator/tasks`, `GET/PUT /api/orchestrator/tasks/[id]`, `POST .../retry`, `POST .../cancel`

### 4. Queue Manager (`queue-manager.service.ts`)

Manages the execution queue with priority-based ordering and positional tracking. Provides enqueue/dequeue operations, priority adjustment, and queue statistics per user.

- Source: `src/core/orchestrator/queue-manager.service.ts`
- API: `GET/POST /api/orchestrator/queue`, `DELETE /api/orchestrator/queue/[id]`, `PUT .../priority`

### 5. Automation Rules (`automation-rules.service.ts`)

Manages event-driven automation rules with trigger/condition/action patterns. Supports rule creation, toggling, and execution tracking.

- Source: `src/core/orchestrator/automation-rules.service.ts`
- API: `GET/POST /api/orchestrator/rules`, `GET/PUT/DELETE /api/orchestrator/rules/[id]`, `POST .../toggle`

### 6. Resource Estimator (`resource-estimator.service.ts`)

Provides pre-execution cost estimation for pipelines. Calculates estimated credits and duration based on module type cost tables. Used before execution to validate resource requirements.

- Source: `src/core/orchestrator/resource-estimator.service.ts`
- API: `POST /api/orchestrator/estimate`

### 7. Settings Service (`settings.service.ts`)

Manages per-user orchestrator configuration including concurrency limits, retry policies, notification preferences, and credit thresholds. Uses upsert pattern for single-settings-per-user constraint.

- Source: `src/core/orchestrator/settings.service.ts`
- API: `GET/POST /api/orchestrator/settings`

## Data Flow

```
User Request (natural language or direct API call)
    |
    v
Intent Analyzer
    - Classifies intent type
    - Suggests template
    - Extracts parameters
    - Recommends modules
    |
    v
Pipeline Builder
    - Creates or retrieves pipeline
    - Defines steps with module/action pairs
    - Stores input mappings and conditions
    |
    v
Resource Estimator
    - Calculates total credits
    - Estimates duration per step
    - Validates against user settings
    |
    v
Execution Creation
    - Records pipeline ID, input, estimates
    - Sets initial status to "pending"
    |
    v
Task Scheduler
    - Creates tasks for each pipeline step
    - Assigns priority and retry config
    - Tracks attempt count
    |
    v
Queue Manager
    - Enqueues tasks with position tracking
    - Orders by priority and position
    - Manages concurrency constraints
    |
    v
AI Modules (Project Studio, Image Studio, Video Studio, etc.)
    - Executes module-specific actions
    - Returns output payloads
    - Reports progress updates
    |
    v
Publishing Hub
    - Distributes content to target platforms
    - Schedules publication timing
    |
    v
Analytics
    - Tracks execution metrics
    - Records credit consumption
    - Monitors performance
    |
    v
Creative Memory
    - Stores learned preferences
    - Updates brand DNA
    - Feeds back to future intent analysis
```

## Integration Points with AI Modules

| Module Type            | Orchestrator Role                          | Credit Cost | Duration Estimate |
|------------------------|--------------------------------------------|-------------|-------------------|
| `image_generation`     | Image generation and manipulation          | 5           | 30,000ms          |
| `video_generation`     | Video creation and editing                 | 25          | 120,000ms         |
| `text_generation`      | Text content creation                      | 2           | 10,000ms          |
| `audio_generation`     | Audio/speech synthesis                     | 10          | 60,000ms          |
| `trend_analysis`       | Market trend data collection               | 3           | 15,000ms          |
| `content_optimization` | SEO and conversion optimization            | 4           | 20,000ms          |
| `publishing`           | Content distribution to platforms          | 1           | 5,000ms           |
| `data_collection`      | External data gathering                    | 2           | 10,000ms          |
| `analytics`            | Performance metrics and reporting          | 2           | 8,000ms           |

## Intent-to-Module Mapping

| Intent Type            | Recommended Modules                                                             |
|------------------------|---------------------------------------------------------------------------------|
| `affiliate_campaign`   | project_studio, trend_analyzer, image_studio, video_studio, affiliate_studio, publishing_hub, analytics |
| `drama_series`         | story_engine, drama_studio, image_studio, video_studio, publishing_hub, analytics |
| `product_images`       | project_studio, image_studio, thumbnail_studio                                  |
| `marketing_assets`     | project_studio, image_studio, video_studio, publishing_hub                      |
| `video_creation`       | project_studio, video_studio, image_studio, publishing_hub                      |
| `content_repurpose`    | project_studio, image_studio, video_studio, publishing_hub                      |
| `optimize_content`     | conversion_optimizer, analytics, creative_memory                                |
| `publish_campaign`     | publishing_hub, analytics, conversion_optimizer                                 |
| `story_creation`       | story_engine, creative_memory                                                   |
| `thumbnail_generation` | image_studio, creative_memory                                                   |

## Service Layer Architecture

All orchestrator services follow a singleton pattern, exported as both class and pre-instantiated service:

```typescript
// Class available for DI or testing
export class PipelineBuilderService { ... }

// Pre-instantiated singleton for direct use
export const pipelineBuilderService = new PipelineBuilderService();
```

Services are re-exported from `src/core/orchestrator/index.ts` for centralized imports.

### Service Dependencies

```
IntentAnalyzerService
    -> orchestratorTemplate (DB read for template matching)

PipelineBuilderService
    -> orchestratorPipeline (CRUD)
    -> orchestratorPipelineStep (CRUD)
    -> orchestratorExecution (CRUD)
    -> orchestratorTask (read)
    -> orchestratorTemplate (CRUD + usage tracking)

TaskSchedulerService
    -> orchestratorTask (CRUD + retry)

QueueManagerService
    -> orchestratorQueue (CRUD + position)
    -> orchestratorTask (read)

ResourceEstimatorService
    -> orchestratorPipelineStep (read for estimation)

AutomationRulesService
    -> orchestratorRule (CRUD + toggle)

OrchestratorSettingsService
    -> orchestratorSettings (get + upsert)
```

## Database Schema Overview

The system uses 8 PostgreSQL tables managed via Drizzle ORM:

1. **orchestrator_pipeline** - Pipeline definitions with type, status, trigger config
2. **orchestrator_pipeline_step** - Ordered steps within pipelines with module/action config
3. **orchestrator_execution** - Runtime execution instances tracking progress and costs
4. **orchestrator_task** - Atomic work units within executions with retry and priority
5. **orchestrator_queue** - Priority queue with positional ordering per user
6. **orchestrator_template** - Reusable pipeline blueprints with usage tracking
7. **orchestrator_rule** - Event-driven automation rules with trigger/condition/action
8. **orchestrator_settings** - Per-user configuration (one row per user)

See [Database Design](AI-ORCHESTRATOR-01-Database.md) for complete schema details.

## API Layer

The REST API is implemented as Next.js App Router route handlers under `src/app/api/orchestrator/`. All endpoints require user authentication via the `userAuthentication()` middleware.

See [API Endpoints](AI-ORCHESTRATOR-01-API.md) for complete endpoint documentation.
