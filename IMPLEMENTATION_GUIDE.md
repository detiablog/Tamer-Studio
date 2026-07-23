# Implementation Guide: Rate Limiting, Real-Time Collaboration & Analytics

## Overview

This guide documents the three major features added to Tamer Studio:

1. **Rate Limiting** – Protect login/register endpoints from brute force
2. **Real-Time Collaboration** – Multi-user editing with WebSocket sync
3. **Analytics Dashboard** – Production metrics, costs, and user activity

---

## 1. Rate Limiting Setup

### Files Created/Modified

- `src/core/security/ratelimit.ts` – Rate limiting logic with Upstash Redis
- `src/core/middleware/auth-ratelimit.ts` – Middleware for auth endpoints
- `src/app/api/auth/login/route.ts` – Login endpoint with rate limiting
- `src/app/api/auth/register/route.ts` – Register endpoint with rate limiting

### Configuration

1. **Create Upstash Redis account**: https://console.upstash.io/

2. **Set environment variables**:
   ```bash
   UPSTASH_REDIS_REST_URL="https://[your-url].upstash.io"
   UPSTASH_REDIS_REST_TOKEN="[your-token]"
   ```

3. **Rate Limits Applied**:
   - **Auth routes**: 5 attempts per 15 minutes per IP
   - **API endpoints**: 100 requests per minute per user
   - **Production execution**: 20 runs per hour per workspace

### Usage in API Routes

```typescript
import { authLimiter, checkRateLimit } from "@/core/security/ratelimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = await checkRateLimit(authLimiter, ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429 }
    );
  }

  // Your logic here
}
```

---

## 2. Real-Time Collaboration Setup

### Files Created

- `src/core/websocket/server.ts` – Socket.io server with Redis adapter
- `src/hooks/useWebSocket.ts` – React hook for WebSocket client
- `src/components/production/CollaborativeProductionEditor.tsx` – Collaborative editor component

### Configuration

1. **Environment Variables**:
   ```bash
   REDIS_URL="redis://localhost:6379"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

2. **Initialize WebSocket Server** (in `src/app/api/socket/route.ts`):
   ```typescript
   import { initializeWebSocket } from "@/core/websocket/server";
   import { createServer } from "http";

   export async function initSocket() {
     const server = createServer();
     const io = await initializeWebSocket(server);
     server.listen(3001);
   }
   ```

3. **Use WebSocket Hook in Components**:
   ```typescript
   export function MyComponent() {
     const { connected, emit, on } = useWebSocket({
       workspaceId: "workspace-123",
       productionId: "prod-456",
       token: userToken,
     });

     return (
       <CollaborativeProductionEditor
         productionId="prod-456"
         workspaceId="workspace-123"
         token={userToken}
         content={content}
         onContentChange={handleContentChange}
       />
     );
   }
   ```

### WebSocket Events

**Client → Server**:
- `join-workspace` – Join a workspace room
- `join-production` – Join production collaboration
- `edit-production-content` – Emit content changes
- `cursor-move` – Send cursor position
- `production-status-changed` – Update production status
- `add-comment` – Add inline comments

**Server → Client**:
- `workspace-joined` – Confirmation of workspace join
- `production-joined` – Confirmation of production join
- `production-content-updated` – Remote content changes
- `user-cursor-moved` – Remote cursor positions
- `user-joined` – New user joined
- `user-left` – User disconnected
- `comment-added` – New inline comment

---

## 3. Analytics Dashboard Setup

### Files Created

- `src/lib/db/schema/analytics.ts` – Database schema for metrics
- `src/core/analytics/aggregation.ts` – Metrics aggregation queries
- `src/core/analytics/aggregation-cron.ts` – Daily cron aggregation job
- `src/components/analytics/AnalyticsDashboard.tsx` – Dashboard component
- `src/app/api/analytics/dashboard/route.ts` – Dashboard API endpoint
- `src/app/api/analytics/metrics/route.ts` – Metrics recording endpoint

### Database Schema

Three new tables track analytics:

1. **production_metrics** – Per-production execution data
   - status, aiModel, inputTokens, outputTokens, costUsd, executionTimeMs
2. **user_activity_metrics** – User actions (create, publish, etc.)
3. **workspace_metrics** – Daily aggregated metrics per workspace

### Setup Instructions

1. **Create analytics tables** (run Drizzle migration):
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

2. **Record Metrics** (from production execution code):
   ```typescript
   import { recordProductionMetric } from "@/core/analytics/aggregation";

   await recordProductionMetric({
     productionId: "prod-123",
     workspaceId: "ws-456",
     status: "completed",
     aiModel: "gpt-4",
     inputTokens: 1500,
     outputTokens: 800,
     costUsd: "0.15",
     executionTimeMs: 3200,
   });
   ```

3. **Record User Activity**:
   ```typescript
   import { recordUserActivity } from "@/core/analytics/aggregation";

   await recordUserActivity({
     userId: "user-789",
     workspaceId: "ws-456",
     action: "run_production",
     resourceId: "prod-123",
     resourceType: "production",
   });
   ```

4. **Set Up Daily Cron** (using Trigger.dev or node-cron):
   ```typescript
   // In your cron handler
   import { aggregateDailyMetrics } from "@/core/analytics/aggregation-cron";
   
   // Run daily at 1 AM UTC
   export const aggregateMetrics = cronTrigger.daily({
     cron: "0 1 * * *",
   });

   export async function run() {
     return aggregateDailyMetrics();
   }
   ```

### Dashboard Component Usage

```typescript
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export function DashboardPage({ workspaceId }: { workspaceId: string }) {
  return <AnalyticsDashboard workspaceId={workspaceId} />;
}
```

### Dashboard Displays

- **KPI Cards**: Total productions, success rate, total cost, avg execution time
- **Production Trend Chart**: Daily production counts and success rate over 30 days
- **Top AI Models**: Pie chart of model usage
- **User Activity**: Bar chart of user actions
- **Cost Breakdown**: Cost per AI model with visual progress bars

---

## Integration Checklist

### Rate Limiting
- [ ] Set Upstash Redis credentials in `.env.local`
- [ ] Test login endpoint throttling with multiple requests
- [ ] Configure rate limits per environment (dev vs prod)

### Real-Time Collaboration
- [ ] Set Redis URL in `.env.local`
- [ ] Start Socket.io server alongside Next.js
- [ ] Test WebSocket connection in browser DevTools (Network > WS)
- [ ] Verify cursor sync between multiple browser tabs
- [ ] Test comment functionality

### Analytics
- [ ] Run database migrations for analytics tables
- [ ] Integrate `recordProductionMetric()` in production execution code
- [ ] Integrate `recordUserActivity()` in action handlers
- [ ] Set up daily aggregation cron job
- [ ] Test analytics API endpoint
- [ ] Verify dashboard displays correct data

---

## Performance Considerations

### Rate Limiting
- Upstash Redis is serverless; no infrastructure needed
- Fails open if Redis is down (allows traffic)
- Configurable limits per endpoint

### Real-Time Collaboration
- Redis adapter syncs state across multiple Next.js instances
- Suitable for up to 10K concurrent connections per instance
- Cursor updates are rate-limited client-side to reduce network traffic

### Analytics
- Aggregation query runs daily; use indexed queries on `workspaceId` + `createdAt`
- Consider materialized views for frequently accessed metrics
- Cache dashboard results for 5 minutes

---

## Deployment Notes

### Environment Variables Required

```
# Rate Limiting
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# WebSocket
REDIS_URL
NEXT_PUBLIC_APP_URL

# Database (existing)
DATABASE_URL
```

### Vercel Deployment

1. Add environment variables to Vercel project settings
2. WebSocket requires Vercel Pro (for Socket.io support) or external Socket.io server
3. Rate limiting works on Vercel with Upstash (no regional issues)

### Self-Hosted Deployment

1. Ensure Redis is running and accessible
2. Start WebSocket server on separate port or same Node process
3. Configure CORS origins for Socket.io

---

## Troubleshooting

### WebSocket Connection Fails

- Check Redis connectivity: `redis-cli ping`
- Verify `NEXT_PUBLIC_APP_URL` matches actual URL
- Ensure CORS origin in Socket.io config matches client URL

### Rate Limit Not Working

- Verify Upstash credentials are set
- Check `x-forwarded-for` header is being passed correctly
- Monitor Upstash dashboard for Redis errors

### Analytics Dashboard Slow

- Add database indexes: `CREATE INDEX idx_workspace_created ON production_metrics(workspace_id, created_at)`
- Cache results with Redis
- Limit date range to recent 30 days

