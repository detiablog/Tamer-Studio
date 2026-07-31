# WEB-WORKFLOW-01 — Architecture

## Execution Flow

```
User Request → Workflow API → Workflow Engine → Node Execution → AI Runtime → Assets → Notification
```

## Components

### Workflow Engine (`workflow-engine.ts`)
- Topological sort for execution order
- Node type dispatch (AI, Logic, Processing, Output)
- Variable resolution with `{{variable}}` syntax
- Condition evaluation (equals, contains, gt, lt)
- Credit tracking per run

### Node Types
- **Input**: Prompt, Variable
- **AI**: Image, Video, Storyboard (delegates to ProviderRouter)
- **Processing**: Storage, Resize, Convert
- **Logic**: Condition, Delay, Merge, Split
- **Output**: Notification, Publish

### Variable System
- Workflow-scoped variables
- System variables (auto-populated)
- Dynamic expressions with `{{var}}` syntax
- Type validation

### Scheduling
- Cron-based scheduling
- Timezone support
- Automatic next-run calculation

### Versioning
- Every save creates a version snapshot
- Version history viewable
- Compare and restore

## Database Schema
7 new tables added to `workflows.ts`:
- workflowNode, workflowConnection, workflowVariable
- workflowRun, workflowRunLog
- workflowTemplate, workflowSchedule

All integrated with existing `workflow` and `workflowExecution` tables.
