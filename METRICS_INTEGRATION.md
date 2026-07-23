# Production Metrics Integration Guide

This guide explains how to integrate production metrics recording, collaborative editing, and cron aggregation into your Tamer Studio setup.

## Overview

### Three Components

1. **Metrics Recording** – Captures production execution data (cost, time, tokens)
2. **Collaborative Editing** – Real-time multi-user editing on production pages
3. **Cron Aggregation** – Daily summarization of metrics into workspace_metrics table

---

## 1. Production Execution Service

### Location
`src/core/production/execution.ts`

### Key Functions

**executeProductionWithMetrics()**
```typescript
await executeProductionWithMetrics(
  {
    productionId: "prod-123",
    workspaceId: "ws-456",
    userId: "user-789",
    aiModel: "gpt-4",
    workflowType: "Image Generation",
  },
  async () => {
    // Your actual production logic here
    return {
      success: true,
      executionTimeMs: 2500,
      inputTokens: 150,
      outputTokens: 450,
      costUsd: "0.012",
    };
  }
);
```

**streamProductionExecution()**
```typescript
await streamProductionExecution(
  { /* config */ },
  async (onProgress) => {
    onProgress({
      status: "running",
      progress: 50,
      message: "Processing image batch...",
    });
    // Your logic...
  },
  (update) => {
    // Handle real-time progress updates
    console.log(update);
  }
);
```

**calculateProductionCost()**
```typescript
const cost = calculateProductionCost(
  inputTokens,
  outputTokens,
  "gpt-4"
); // Returns cost as string with 6 decimal places
```

---

## 2. API Integration

### Production Execution Endpoint

**POST /api/production/execute**

Request:
```json
{
  "productionId": "prod-123",
  "workspaceId": "ws-456",
  "userId": "user-789",
  "aiModel": "gpt-4",
  "workflowType": "Image Generation",
  "prompt": "Generate a hero image for...",
  "parameters": {
    "quality": "high",
    "format": "standard"
  }
}
```

Response:
```json
{
  "success": true,
  "result": {
    "success": true,
    "executionTimeMs": 2134,
    "inputTokens": 145,
    "outputTokens": 512,
    "costUsd": "0.015234"
  },
  "message": "Production executed successfully"
}
```

**Rate Limits:**
- 20 productions per hour per workspace
- Returns 429 if exceeded

### Production Completion Webhook

**POST /api/webhooks/production-complete**

Used by background jobs to record completion:
```json
{
  "productionId": "prod-123",
  "workspaceId": "ws-456",
  "userId": "user-789",
  "status": "completed",
  "aiModel": "gpt-4",
  "inputTokens": 145,
  "outputTokens": 512,
  "costUsd": "0.015",
  "executionTimeMs": 2134,
  "metadata": {
    "workflowType": "Image Generation",
    "batchSize": 10
  }
}
```

---

## 3. Collaborative Editor Integration

### Production Detail Page

The collaborative editor is already integrated into the production detail page:

**Location:** `src/app/(dashboard)/production/[id]/page.tsx`

**Features:**
- Real-time content sync with WebSocket
- Cursor tracking from other users
- Inline comments on text selections
- User presence indicators
- One-click execution of productions

### Component Props

```typescript
<CollaborativeProductionEditor
  productionId={production.id}           // Required: Production ID
  workspaceId={workspace.id}             // Required: Workspace ID
  token={userToken}                      // Required: User session token
  content={content}                      // Initial content
  onContentChange={setContent}           // Callback for changes
/>
```

### Usage Example

```tsx
const [content, setContent] = useState("");

return (
  <CollaborativeProductionEditor
    productionId="prod-123"
    workspaceId="ws-456"
    token={session.token}
    content={content}
    onContentChange={setContent}
  />
);
```

---

## 4. Daily Cron Aggregation

### Setup Options

#### Option A: Trigger.dev (Recommended for Cloud)

**File:** `src/core/jobs/metrics-aggregation.ts`

1. Install Trigger.dev:
```bash
pnpm install @trigger.dev/sdk
```

2. Configure in `trigger.config.ts`:
```typescript
import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: process.env.TRIGGER_PROJECT_ID || "",
  apiKey: process.env.TRIGGER_API_KEY || "",
});
```

3. Deploy jobs:
```bash
npx trigger.dev deploy
```

#### Option B: node-cron (Recommended for Self-Hosted)

**File:** `src/core/jobs/cron-setup.ts`

1. Install node-cron:
```bash
pnpm install node-cron
```

2. Setup in Next.js startup (e.g., `src/core/init.ts`):
```typescript
import { setupMetricsCronJobs } from "@/core/jobs/cron-setup";

if (process.env.NODE_ENV === "production") {
  setupMetricsCronJobs();
}
```

3. Or call from an API route on startup:
```typescript
// src/app/api/health/route.ts
import { setupMetricsCronJobs } from "@/core/jobs/cron-setup";

export function GET() {
  setupMetricsCronJobs();
  return Response.json({ ok: true });
}
```

### Testing the Cron

**Check Status:**
```bash
curl http://localhost:3000/api/admin/cron?action=status
```

**Manually Trigger:**
```bash
curl -X GET http://localhost:3000/api/admin/cron?action=trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**View Schedule:**
```typescript
import { getMetricsAggregationSchedule } from "@/core/jobs/cron-setup";

const schedule = getMetricsAggregationSchedule();
console.log(schedule);
// Output:
// {
//   frequency: "daily",
//   time: "1:00 AM UTC",
//   timezone: "UTC",
//   nextRun: Date(...)
// }
```

---

## 5. Complete Integration Example

### Recording Metrics from Your Production Service

```typescript
// src/features/production/service.ts
import { executeProductionWithMetrics } from "@/core/production/execution";

export async function runProduction(
  productionId: string,
  config: ProductionConfig
) {
  return executeProductionWithMetrics(
    {
      productionId,
      workspaceId: config.workspaceId,
      userId: config.userId,
      aiModel: config.aiModel,
      workflowType: config.workflowType,
    },
    async () => {
      // Call your AI service
      const response = await callOpenAI({
        prompt: config.prompt,
        model: config.aiModel,
      });

      // Extract metrics
      const { input_tokens, completion_tokens } = response.usage;
      const cost = calculateProductionCost(
        input_tokens,
        completion_tokens,
        config.aiModel
      );

      return {
        success: true,
        executionTimeMs: response.time,
        inputTokens: input_tokens,
        outputTokens: completion_tokens,
        costUsd: cost,
        metadata: {
          model: response.model,
          finishReason: response.choices[0].finish_reason,
        },
      };
    }
  );
}
```

### Calling from Background Job

```typescript
// Trigger.dev, Bull Queue, etc.
export const runProductionJob = task({
  id: "run-production",
  run: async (payload: { productionId: string }) => {
    const production = await getProduction(payload.productionId);

    const result = await runProduction(
      payload.productionId,
      {
        workspaceId: production.workspaceId,
        userId: production.userId,
        aiModel: production.aiModel,
        workflowType: production.workflowType,
        prompt: production.prompt,
      }
    );

    // Metrics are automatically recorded by executeProductionWithMetrics
    logger.info("Production completed", { result });
  },
});
```

### Direct API Call

```typescript
// Client-side or API route
async function executeProduction() {
  const response = await fetch("/api/production/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-workspace-id": workspaceId,
    },
    body: JSON.stringify({
      productionId: "prod-123",
      workspaceId: "ws-456",
      userId: user.id,
      aiModel: "gpt-4",
      workflowType: "Image Generation",
      prompt: "Generate a hero image...",
      parameters: { quality: "high" },
    }),
  });

  const data = await response.json();
  // Metrics automatically recorded on completion
}
```

---

## 6. Database Queries

### View Today's Metrics

```sql
SELECT * FROM production_metrics
WHERE workspace_id = 'ws-456'
AND created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

### View Aggregated Daily Data

```sql
SELECT * FROM workspace_metrics
WHERE workspace_id = 'ws-456'
AND date >= NOW() - INTERVAL '30 days'
ORDER BY date DESC;
```

### Cost Report by Model

```sql
SELECT
  ai_model,
  COUNT(*) as executions,
  SUM(CAST(cost_usd AS DECIMAL)) as total_cost,
  AVG(CAST(cost_usd AS DECIMAL)) as avg_cost
FROM production_metrics
WHERE workspace_id = 'ws-456'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY ai_model
ORDER BY total_cost DESC;
```

---

## 7. Troubleshooting

### Metrics Not Recording

**Check:**
1. API endpoint is reachable: `curl http://localhost:3000/api/production/execute`
2. Database connection working: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM production_metrics"`
3. Logs show no errors: `grep "recordProductionMetric" logs`

**Fix:**
```typescript
// Add debug logging
console.log("Recording metric:", { productionId, workspaceId, status });
await recordProductionMetric({ /* ... */ });
console.log("Metric recorded successfully");
```

### Cron Not Running

**Check:**
1. Cron is initialized: `curl http://localhost:3000/api/admin/cron?action=status`
2. Check logs: `grep "\[Cron\]" logs`
3. Database has data: `SELECT COUNT(*) FROM workspace_metrics WHERE date = TODAY()`

**Fix for node-cron:**
```typescript
import { setupMetricsCronJobs } from "@/core/jobs/cron-setup";

// Ensure setup is called on app startup
if (typeof window === "undefined") {
  setupMetricsCronJobs();
}
```

### Collaborative Editor Not Syncing

**Check:**
1. Redis is running: `redis-cli ping`
2. WebSocket connected: Check DevTools > Network > WS
3. Socket.io message events: Check DevTools > Console

**Fix:**
- Restart Redis: `redis-cli SHUTDOWN; redis-server`
- Check `REDIS_URL` environment variable
- Verify CORS origin matches `NEXT_PUBLIC_APP_URL`

---

## 8. Monitoring

### Production Metrics Dashboard

View in Tamer Studio: `/dashboard/analytics`

Shows:
- Total productions & success rate
- Cost breakdown by AI model
- Execution time trends
- User activity metrics

### Cost Tracking

```typescript
// Get workspace cost for current month
const metrics = await getWorkspaceDashboardMetrics(
  workspaceId,
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
);

console.log(`Total cost this month: $${metrics.totalCostUsd}`);
```

### Alert on High Costs

```typescript
const metrics = await getWorkspaceDashboardMetrics(workspaceId);

if (parseFloat(metrics.totalCostUsd) > 1000) {
  await sendAlert({
    to: workspace.adminEmail,
    subject: "High AI spend alert",
    body: `Your workspace has spent $${metrics.totalCostUsd} this month`,
  });
}
```

---

## 9. Environment Variables

Add to `.env.local`:

```env
# Production API
PRODUCTION_API_URL="http://localhost:3000/api/production/execute"
WEBHOOK_SECRET="your-secret-key"

# Cron Jobs (for node-cron)
CRON_ENABLED="true"

# Trigger.dev (if using Trigger.dev)
TRIGGER_PROJECT_ID="your-project-id"
TRIGGER_API_KEY="your-api-key"
```

---

## Next Steps

1. ✅ Review `src/core/production/execution.ts` for execution service
2. ✅ Test production execution with `/api/production/execute`
3. ✅ Setup cron with either Trigger.dev or node-cron
4. ✅ Verify metrics in analytics dashboard
5. ✅ Integrate with your actual AI service (OpenAI, Claude, etc.)
6. ✅ Setup production completion webhooks in your background job system

---

## Support

For questions or issues:
- Check IMPLEMENTATION_GUIDE.md
- Review FEATURES_README.md
- Check code comments in implementation files
