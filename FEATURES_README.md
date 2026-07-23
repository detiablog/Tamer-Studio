# Rate Limiting, Real-Time Collaboration & Analytics Dashboard

This document describes the three major features added to Tamer Studio for improved security, collaboration, and insights.

## Features Overview

### 1. 🔐 Rate Limiting

Protects authentication endpoints and API routes from brute-force attacks using **Upstash Redis**.

**Applied to:**
- Login endpoint: 5 attempts per 15 minutes per IP
- Register endpoint: 5 attempts per 15 minutes per IP
- API endpoints: 100 requests per minute per user
- Production execution: 20 runs per hour per workspace

**Benefits:**
- Prevents credential stuffing attacks
- Reduces infrastructure costs from spam requests
- Configurable limits per environment

### 2. 🔄 Real-Time Collaboration

Multiple team members can edit productions simultaneously with **Socket.io + Redis**.

**Features:**
- Live cursor tracking – see where teammates are editing
- Instant content sync – changes propagate in real-time
- Inline comments – add feedback directly on text selections
- User presence – know who's currently editing
- Status updates – production status changes sync instantly

**Benefits:**
- Reduce feedback cycles and communication overhead
- Simultaneous multi-user editing without conflicts
- Real-time awareness of team activity

### 3. 📊 Analytics Dashboard

Track production metrics, AI costs, and team activity with **Recharts visualizations**.

**Metrics Tracked:**
- Total productions run and success rate
- Total cost and cost per AI model
- Average execution time
- Daily production trends
- Top AI models by usage
- User activity breakdown

**Benefits:**
- Monitor ROI on AI spend
- Identify bottlenecks and performance issues
- Track team productivity metrics
- Cost optimization insights

---

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 11.15+
- PostgreSQL 14+
- Redis 7+ (local or Upstash)

### 1. Install Dependencies

```bash
pnpm add @upstash/ratelimit @upstash/redis socket.io socket.io-client redis recharts
```

### 2. Start Infrastructure

#### Using Docker Compose (Recommended for local development)

```bash
docker compose -f docker-compose.local.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Redis Commander (port 8081) – for debugging

#### Using Local Services

```bash
# Start Redis
redis-server

# In another terminal, configure DATABASE_URL and start dev
pnpm dev
```

### 3. Configure Environment Variables

Copy and fill `.env.local`:

```bash
cp .env.example .env.local
```

**Required for new features:**

```env
# Rate Limiting
UPSTASH_REDIS_REST_URL="https://[your-upstash].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[your-token]"

# Real-Time Collaboration
REDIS_URL="redis://localhost:6379"

# Analytics (existing)
DATABASE_URL="postgresql://..."
```

### 4. Run Database Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

---

## Usage Examples

### Rate Limiting

The login/register endpoints automatically enforce rate limits:

```typescript
// POST /api/auth/login
// Rate limited: 5 attempts per 15 minutes per IP

const response = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

// Response headers include:
// X-RateLimit-Remaining: 4
// X-RateLimit-Reset: 2024-01-15T10:30:00Z
// Retry-After: 900 (if rate limited)
```

### Real-Time Collaboration

Use the collaborative editor component in your production page:

```typescript
"use client";

import { CollaborativeProductionEditor } from "@/components/production/CollaborativeProductionEditor";
import { useSession } from "@/lib/auth/auth-client";

export function ProductionPage({ productionId }: { productionId: string }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");

  return (
    <CollaborativeProductionEditor
      productionId={productionId}
      workspaceId={session?.user.workspaceId}
      token={session?.token}
      content={content}
      onContentChange={setContent}
    />
  );
}
```

**Features:**
- Real-time content sync
- Remote cursor tracking
- Inline comments
- User presence indicator

### Recording Metrics

In your production execution code:

```typescript
import { recordProductionMetric, recordUserActivity } from "@/core/analytics/aggregation";

async function executeProduction(productionId: string) {
  const startTime = Date.now();

  try {
    // Your production logic...
    const result = await runProduction();

    // Record success metric
    await recordProductionMetric({
      productionId,
      workspaceId: session.user.workspaceId,
      status: "completed",
      aiModel: "gpt-4",
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.cost.toFixed(2),
      executionTimeMs: Date.now() - startTime,
    });

    // Record user activity
    await recordUserActivity({
      userId: session.user.id,
      workspaceId: session.user.workspaceId,
      action: "run_production",
      resourceId: productionId,
      resourceType: "production",
    });
  } catch (error) {
    await recordProductionMetric({
      productionId,
      workspaceId: session.user.workspaceId,
      status: "failed",
      aiModel: "gpt-4",
      executionTimeMs: Date.now() - startTime,
    });
  }
}
```

### Viewing Analytics Dashboard

Add the dashboard to your workspace page:

```typescript
"use client";

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export function WorkspaceDashboard({ workspaceId }: { workspaceId: string }) {
  return <AnalyticsDashboard workspaceId={workspaceId} />;
}
```

---

## Architecture

### Rate Limiting Architecture

```
Client Request
    ↓
API Route (login/register)
    ↓
checkRateLimit(ip)
    ↓
Upstash Redis (sliding window)
    ↓
allowed? → Yes → Process request
         → No  → Return 429 with Retry-After
```

### Real-Time Collaboration Architecture

```
Browser A (User 1)
    ↓
Socket.io Client
    ↓
WebSocket Connection
    ↓
Next.js → Socket.io Server
    ↓
Redis Adapter (multi-instance sync)
    ↓
Socket.io Client
    ↓
Browser B (User 2)
```

### Analytics Architecture

```
Production Execution
    ↓
recordProductionMetric()
    ↓
INSERT production_metrics
    ↓
Daily Cron (1 AM UTC)
    ↓
aggregateDailyMetrics()
    ↓
Aggregate & INSERT workspace_metrics
    ↓
Dashboard Queries
    ↓
Recharts Visualization
```

---

## Deployment

### Vercel

1. Add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `REDIS_URL` (can be Upstash or self-hosted)
   - `DATABASE_URL`

2. For WebSocket support:
   - Use Vercel Pro (supports Server Sent Events)
   - Or run Socket.io server separately

3. Database migrations:
   ```bash
   pnpm db:migrate
   ```

### Self-Hosted (Docker)

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate
RUN pnpm db:migrate
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

Run with Docker Compose:

```bash
docker compose up -d
```

---

## Performance Tuning

### Rate Limiting

- **Upstash**: Serverless Redis, no config needed
- **Self-hosted Redis**: Use `redis-benchmark` to verify throughput

### Real-Time Collaboration

- **Cursor updates**: Rate-limited client-side (100ms)
- **Content sync**: Debounced (500ms) to reduce traffic
- **Max users per production**: ~100 concurrent (per Socket.io instance)

### Analytics

- **Query optimization**: Index on `(workspace_id, created_at)`
- **Aggregation**: Run nightly, cache results
- **Dashboard cache**: 5-minute TTL via SWR

---

## Troubleshooting

### WebSocket Connection Failed

```
Error: CORS policy blocked
Fix: Verify NEXT_PUBLIC_APP_URL matches client origin
```

```
Error: Redis connection refused
Fix: Check REDIS_URL and redis-server is running
```

### Rate Limit Not Working

```
Error: Too many attempts not blocked
Fix: Verify Upstash credentials are set
Fix: Check x-forwarded-for header from load balancer
```

### Analytics Missing Data

```
Error: Dashboard shows no metrics
Fix: Verify recordProductionMetric() is called
Fix: Run pnpm db:migrate to create tables
Fix: Check aggregateDailyMetrics cron is running
```

---

## API Reference

### Rate Limit Headers

All rate-limited endpoints return:

```
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2024-01-15T10:30:00Z
Retry-After: 900 (if 429)
```

### WebSocket Events

**Client Emit:**
- `join-workspace(workspaceId: string)`
- `join-production(productionId: string)`
- `edit-production-content({ productionId, field, value, timestamp })`
- `cursor-move({ productionId, x, y })`
- `add-comment({ productionId, text, position? })`

**Client Listen:**
- `workspace-joined({ workspaceId })`
- `production-joined({ productionId })`
- `production-content-updated({ userId, field, value, timestamp })`
- `user-cursor-moved({ userId, x, y })`
- `user-joined({ userId, timestamp })`
- `user-left({ userId })`
- `comment-added({ id, userId, text, timestamp })`

### Metrics API

**POST /api/analytics/metrics**

```json
{
  "type": "production",
  "data": {
    "productionId": "...",
    "workspaceId": "...",
    "status": "completed",
    "aiModel": "gpt-4",
    "costUsd": "0.15"
  }
}
```

**GET /api/analytics/dashboard?workspaceId=...**

Returns `DashboardMetrics` object with all visualizations.

---

## Contributing

To add new metrics:

1. Add column to `production_metrics` or `user_activity_metrics` in `src/lib/db/schema/analytics.ts`
2. Update `recordProductionMetric()` or `recordUserActivity()` function
3. Add aggregation logic in `aggregateDailyMetrics()`
4. Update dashboard component to display new metric

---

## Support

For issues or questions:

1. Check `IMPLEMENTATION_GUIDE.md` for detailed setup
2. Review error logs in terminal or Vercel dashboard
3. Verify environment variables in `.env.local`
4. Check Redis connection: `redis-cli ping`
