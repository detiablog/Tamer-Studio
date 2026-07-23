# Architecture Diagrams

## Rate Limiting Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Request                      │
│              POST /api/auth/login or /register              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                ┌─────────────────────────┐
                │  Extract IP Address     │
                │  x-forwarded-for header │
                └────────────┬────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  checkRateLimit(authLimiter) │
              └────────────┬─────────────────┘
                           │
                           ▼
           ┌──────────────────────────────────────┐
           │  Upstash Redis Sliding Window(5, 15m) │
           │  Get counter: ratelimit:auth:{ip}   │
           └────────────┬─────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ Counter < 5      │   │ Counter >= 5     │
    │ ✅ ALLOWED       │   │ ❌ RATE LIMITED  │
    │ Increment &      │   │ Return 429       │
    │ Continue Request │   │ Retry-After      │
    └──────────────────┘   └──────────────────┘
           │                       │
           ▼                       ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ Process Auth     │   │ Return JSON +    │
    │ Return 200       │   │ Rate Limit       │
    │ Headers          │   │ Headers          │
    └──────────────────┘   └──────────────────┘
```

## Real-Time Collaboration Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Browser A (User 1)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ React Component                                            │ │
│  │ - CollaborativeProductionEditor                           │ │
│  │ - useWebSocket hook                                       │ │
│  └────────────────┬─────────────────────────────────────────┘ │
│                   │                                             │
│                   │ emit("edit-production-content")             │
│                   │ emit("cursor-move")                         │
│                   │ emit("add-comment")                         │
│                   ▼                                             │
│          Socket.io Client                                       │
│          (socket.io-client)                                     │
└───────────────────┬────────────────────────────────────────────┘
                    │
                    │ WebSocket
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
   ┌─────────────┐       ┌──────────────────┐
   │  Next.js    │       │   Socket.io      │
   │  Server     │       │   Server         │
   └─────┬───────┘       └────────┬─────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────────┐
         │              │ Room Management      │
         │              │ workspace:{id}       │
         │              │ production:{id}      │
         │              └──────────┬───────────┘
         │                         │
         └────────┬────────────────┘
                  │
                  ▼
        ┌─────────────────────────────────────┐
        │ Redis Adapter                       │
        │ Syncs events across multiple server │
        │ instances in production             │
        └─────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────────────────┐
        │ Broadcast to Room:          │
        │ production-content-updated  │
        │ user-cursor-moved           │
        │ comment-added               │
        └─────────┬───────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
Browser A    Browser B    Browser C
(User 1)     (User 2)     (User 3)
Updated      ✅ Sync      Updated
```

## Analytics Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│           Production Execution                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Start production: startTime = now()               │   │
│  │ 2. Call AI API (OpenAI, Claude, etc.)                │   │
│  │ 3. On success/failure:                               │   │
│  │    recordProductionMetric({...})                     │   │
│  │    recordUserActivity({...})                         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │ INSERT INTO production_metrics│
      │ - productionId               │
      │ - workspaceId                │
      │ - status                     │
      │ - aiModel                    │
      │ - cost, tokens, time         │
      └──────────────────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │ INSERT INTO user_activity    │
      │ - userId                     │
      │ - action (run_production)    │
      │ - resourceId, resourceType   │
      └──────────────────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │  Daily Cron Job     │
           │  (1 AM UTC)         │
           │  aggregateDailyMetrics()
           └────────────┬────────┘
                        │
                        ▼
           ┌──────────────────────────┐
           │ Group by workspace_id    │
           │ SUM, COUNT, AVG queries  │
           │ on yesterday's data      │
           └────────────┬─────────────┘
                        │
                        ▼
           ┌──────────────────────────┐
           │ INSERT INTO workspace_   │
           │ metrics (daily summary)  │
           └────────────┬─────────────┘
                        │
                        ▼
           ┌──────────────────────────┐
           │ Dashboard Query          │
           │ GET /api/analytics/      │
           │ dashboard?workspaceId=.. │
           └────────────┬─────────────┘
                        │
                        ▼
           ┌──────────────────────────┐
           │ Recharts Component       │
           │ - LineChart (trend)      │
           │ - BarChart (activity)    │
           │ - PieChart (models)      │
           │ - Metric cards (KPIs)    │
           └──────────────────────────┘
```

## Component Hierarchy

```
App
├── Dashboard Page
│   └── AnalyticsDashboard
│       ├── MetricCard (KPIs)
│       ├── LineChart (30-day trend)
│       ├── PieChart (top models)
│       ├── BarChart (user activity)
│       └── Cost Breakdown (progress bars)
│
├── Production Edit Page
│   └── CollaborativeProductionEditor
│       ├── Textarea (content)
│       ├── Remote User Indicators
│       ├── Comment Section
│       └── WebSocket Connection Status
│
└── Auth Pages
    ├── Login Route
    │   └── Rate Limited (5/15m per IP)
    │
    └── Register Route
        └── Rate Limited (5/15m per IP)
```

## Database Schema

```
┌──────────────────────────────────┐
│     production_metrics           │
├──────────────────────────────────┤
│ id: serial (PK)                  │
│ production_id: uuid (FK)         │
│ workspace_id: uuid (FK) [INDEX]  │
│ status: text                     │
│ ai_model: text                   │
│ input_tokens: integer            │
│ output_tokens: integer           │
│ cost_usd: text (numeric)         │
│ execution_time_ms: integer       │
│ created_at: timestamp [INDEX]    │
│ metadata: jsonb                  │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│   user_activity_metrics          │
├──────────────────────────────────┤
│ id: serial (PK)                  │
│ user_id: uuid (FK)               │
│ workspace_id: uuid (FK) [INDEX]  │
│ action: text                     │
│ resource_id: uuid                │
│ resource_type: text              │
│ created_at: timestamp [INDEX]    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    workspace_metrics             │
├──────────────────────────────────┤
│ id: serial (PK)                  │
│ workspace_id: uuid (FK) [INDEX]  │
│ date: timestamp (PK) [INDEX]     │
│ productions_run: integer         │
│ productions_succeeded: integer   │
│ productions_failed: integer      │
│ media_generated: integer         │
│ total_cost_usd: text (numeric)   │
│ total_tokens_used: bigint        │
│ active_users: integer            │
│ created_at: timestamp            │
└──────────────────────────────────┘
```

## Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                     Internet                           │
└─────────────────────────┬──────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐       ┌─────────┐       ┌──────────┐
   │Vercel   │       │Docker   │       │On-Prem   │
   │/Railway │       │Compose  │       │K8s       │
   └────┬────┘       └────┬────┘       └────┬─────┘
        │                 │                  │
        ├─────────────────┼──────────────────┤
        │                 │                  │
        ▼                 ▼                  ▼
    ┌─────────────────────────────────────────────────┐
    │              Next.js App                        │
    │ - Rate limiting (Upstash Redis)                │
    │ - Socket.io server (WebSocket)                 │
    │ - Analytics API endpoints                      │
    └────────────┬────────────────┬────────────────┘
                 │                 │
        ┌────────┘                 └────────┐
        │                                   │
        ▼                                   ▼
    ┌──────────────────┐        ┌──────────────────────┐
    │   PostgreSQL     │        │   Redis / Upstash    │
    │   (Production)   │        │   (Cache & Sessions) │
    │   - Analytics    │        └──────────────────────┘
    │   - Metrics      │
    │   - Workspaces   │
    └──────────────────┘
```

## Request Flow (Combined)

```
User Action (e.g., Login)
│
├─ Rate Limit Check
│  └─ Upstash Redis
│     ├─ If allowed ✅ → Continue
│     └─ If blocked ❌ → Return 429
│
├─ Authentication
│  └─ Better Auth
│     ├─ Verify credentials
│     └─ Generate session token
│
├─ Record User Activity
│  └─ INSERT user_activity_metrics
│
├─ Production Execution (Optional)
│  ├─ Call AI API
│  ├─ Record Metrics
│  │  └─ INSERT production_metrics
│  ├─ Emit WebSocket Event
│  │  ├─ Notify other users (real-time sync)
│  │  └─ Redis adapter broadcasts
│  │
│  └─ Return Response
│
└─ Dashboard Refresh (Optional)
   └─ Query Analytics API
      └─ Return DashboardMetrics JSON
         └─ Recharts renders charts
```
