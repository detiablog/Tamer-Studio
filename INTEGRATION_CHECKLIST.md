# Integration Checklist & Next Steps

Complete this checklist to fully integrate production metrics, collaborative editing, and cron aggregation into Tamer Studio.

## ✅ Phase 1: Dependencies & Setup

### Install Dependencies
- [ ] Run `pnpm install` to add `node-cron`
- [ ] Verify all packages installed: `pnpm list node-cron @upstash/ratelimit socket.io`
- [ ] Run database migrations: `pnpm db:generate && pnpm db:migrate`

### Start Infrastructure
- [ ] Start PostgreSQL: `docker compose -f docker-compose.local.yml up postgres`
- [ ] Start Redis: `docker compose -f docker-compose.local.yml up redis`
- [ ] Verify connections: `psql $DATABASE_URL -c "SELECT 1"` and `redis-cli ping`

### Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in Upstash credentials: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] Set Redis URL: `REDIS_URL=redis://localhost:6379`
- [ ] Verify all vars set: `grep -E "UPSTASH|REDIS|DATABASE" .env.local`

---

## ✅ Phase 2: Production Service Integration

### Metrics Recording
- [ ] Review `src/core/production/execution.ts`
- [ ] Understand `executeProductionWithMetrics()` function
- [ ] Review pricing model in `calculateProductionCost()`
- [ ] Test with: `curl -X POST http://localhost:3000/api/production/execute ...`

### API Routes
- [ ] Verify `/api/production/execute` returns 200
- [ ] Verify `/api/webhooks/production-complete` accepts POST
- [ ] Test rate limiting: Send 25 requests to `/api/production/execute` (should fail on #21)

### WebSocket/Collaborative Editor
- [ ] Test WebSocket connection in production detail page
- [ ] Open production page in DevTools > Network > WS
- [ ] Verify `production-joined` event received
- [ ] Type in editor and verify real-time sync

### Recording in Actual Service
- [ ] Locate your production execution code (e.g., AI API calls)
- [ ] Wrap with `executeProductionWithMetrics()` or `streamProductionExecution()`
- [ ] Integrate token counting from your AI provider
- [ ] Test by running a production and checking `production_metrics` table

---

## ✅ Phase 3: Collaborative Features

### Collaborative Editor on Production Pages
- [ ] Production detail page `/production/[id]` loads collaborative editor
- [ ] Test with multiple browser windows/tabs
- [ ] Verify cursor sync between windows
- [ ] Test comment functionality
- [ ] Verify WebSocket disconnects cleanly on page exit

### Real-Time Status Updates
- [ ] Production status changes broadcast to all viewers
- [ ] Execution progress updates in real-time
- [ ] User presence shows "N users editing"
- [ ] Test with production state changes

### Execute Production from UI
- [ ] Click "Execute" button on production detail page
- [ ] Wait for execution to complete
- [ ] Verify result displays (cost, tokens, time)
- [ ] Check execution log updated
- [ ] Verify metrics recorded in database

---

## ✅ Phase 4: Analytics & Metrics

### Database Tables
- [ ] Verify tables exist:
  ```sql
  \dt production_metrics, user_activity_metrics, workspace_metrics
  ```
- [ ] Insert test data manually (if needed):
  ```sql
  INSERT INTO production_metrics (production_id, workspace_id, status, ai_model, cost_usd, created_at)
  VALUES ('test-1', 'ws-1', 'completed', 'gpt-4', '0.15', NOW());
  ```

### Metrics Recording
- [ ] Execute a production via UI
- [ ] Query database: `SELECT * FROM production_metrics ORDER BY created_at DESC LIMIT 5;`
- [ ] Verify cost, tokens, execution time recorded
- [ ] Check `user_activity_metrics` table has records

### Analytics Dashboard
- [ ] Navigate to `/dashboard/analytics` (or create dashboard page with `<AnalyticsDashboard />`)
- [ ] Verify KPI cards display:
  - Total productions
  - Success rate
  - Total cost
  - Average execution time
- [ ] Verify charts load (line, pie, bar)
- [ ] Test date range filter if available

---

## ✅ Phase 5: Cron Aggregation Setup

### Option A: node-cron (Self-Hosted)
- [ ] Verify `node-cron` installed: `pnpm list node-cron`
- [ ] Import setup in your startup code:
  ```typescript
  import { setupMetricsCronJobs } from "@/core/jobs/cron-setup";
  setupMetricsCronJobs();
  ```
- [ ] Test manual trigger:
  ```bash
  curl http://localhost:3000/api/admin/cron?action=trigger \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```
- [ ] Check logs for: `[Cron] Running daily metrics aggregation...`
- [ ] Verify `workspace_metrics` table populated after manual trigger

### Option B: Trigger.dev (Cloud)
- [ ] Create Trigger.dev account: https://trigger.dev
- [ ] Install CLI: `npm install -g @trigger.dev/cli`
- [ ] Initialize project: `trigger.dev init`
- [ ] Review `src/core/jobs/metrics-aggregation.ts`
- [ ] Deploy jobs: `npx trigger.dev deploy`
- [ ] Verify scheduled in Trigger.dev dashboard

### Cron Status Check
- [ ] Call status endpoint: `curl http://localhost:3000/api/admin/cron?action=status`
- [ ] Response should show:
  ```json
  {
    "status": "active",
    "schedule": {
      "frequency": "daily",
      "time": "1:00 AM UTC",
      "nextRun": "2024-..."
    }
  }
  ```

### Cron Testing
- [ ] Add test production metrics for "yesterday":
  ```sql
  INSERT INTO production_metrics (
    production_id, workspace_id, status, ai_model, cost_usd, created_at
  ) VALUES (
    'test-2', 'ws-1', 'completed', 'gpt-4', '0.25',
    NOW() - INTERVAL '1 day'
  );
  ```
- [ ] Manually trigger aggregation via admin endpoint
- [ ] Query `workspace_metrics`:
  ```sql
  SELECT * FROM workspace_metrics WHERE workspace_id = 'ws-1' ORDER BY date DESC LIMIT 1;
  ```
- [ ] Verify `productions_run` and `total_cost_usd` populated

---

## ✅ Phase 6: Testing & Validation

### Unit Tests
- [ ] Test `calculateProductionCost()`:
  ```typescript
  test("calculateProductionCost", () => {
    const cost = calculateProductionCost(100, 200, "gpt-4");
    expect(parseFloat(cost)).toBeGreaterThan(0);
  });
  ```
- [ ] Test `estimateExecutionTime()`:
  ```typescript
  test("estimateExecutionTime", () => {
    expect(estimateExecutionTime("Image Generation")).toContain("minute");
  });
  ```

### Integration Tests
- [ ] Test `/api/production/execute` endpoint with valid payload
- [ ] Test rate limiting (429 after N requests)
- [ ] Test `/api/webhooks/production-complete` webhook
- [ ] Test metrics recorded correctly

### End-to-End Tests
- [ ] Create production via UI
- [ ] Execute production
- [ ] Verify metrics dashboard updates
- [ ] Wait for cron or manually trigger aggregation
- [ ] Verify workspace_metrics table updated

### Performance Tests
- [ ] Analytics query should complete in < 500ms:
  ```typescript
  const start = Date.now();
  const metrics = await getWorkspaceDashboardMetrics(workspaceId);
  console.log(`Query took ${Date.now() - start}ms`);
  ```
- [ ] Dashboard should render in < 2s
- [ ] WebSocket messages should sync in < 100ms

---

## ✅ Phase 7: Production Deployment

### Pre-Deployment
- [ ] All tests passing: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`

### Environment Setup
- [ ] Upstash Redis configured (or self-hosted Redis)
- [ ] PostgreSQL connection string set
- [ ] Redis URL set
- [ ] Cron job system configured (Trigger.dev or node-cron)

### Database
- [ ] Migrations applied in production: `pnpm db:migrate`
- [ ] Analytics tables created
- [ ] Indexes created for performance:
  ```sql
  CREATE INDEX idx_prod_metrics_workspace_created 
    ON production_metrics(workspace_id, created_at);
  CREATE INDEX idx_workspace_metrics_workspace_date 
    ON workspace_metrics(workspace_id, date);
  ```

### Monitoring
- [ ] Setup logging for `/api/production/execute`
- [ ] Monitor `/api/admin/cron?action=status` daily
- [ ] Alert on cron failures
- [ ] Alert on high error rates

### Verification
- [ ] Test production execution end-to-end
- [ ] Verify metrics appear in analytics dashboard
- [ ] Check cron runs at scheduled time
- [ ] Monitor logs for errors

---

## ✅ Phase 8: Feature Completeness

### Metrics Recording
- [ ] Integrated in production service ✅
- [ ] Records cost, tokens, time ✅
- [ ] Records user activity ✅
- [ ] Handles errors gracefully ✅
- [ ] Rate limited ✅

### Collaborative Editing
- [ ] Real-time content sync ✅
- [ ] Cursor tracking ✅
- [ ] Inline comments ✅
- [ ] User presence ✅
- [ ] Works across multiple browser instances ✅

### Analytics
- [ ] Dashboard displays KPIs ✅
- [ ] Charts render correctly ✅
- [ ] Daily aggregation runs ✅
- [ ] Cost tracking accurate ✅
- [ ] User activity tracked ✅

### Rate Limiting
- [ ] Auth endpoints protected ✅
- [ ] Production execution rate limited ✅
- [ ] Returns proper 429 headers ✅
- [ ] Fails open if Redis unavailable ✅

---

## ✅ Phase 9: Documentation & Team

### Documentation
- [ ] METRICS_INTEGRATION.md reviewed ✅
- [ ] Team briefed on production execution flow ✅
- [ ] Cost calculations documented ✅
- [ ] Cron schedule documented ✅

### Team Training
- [ ] Show team how to execute productions
- [ ] Explain analytics dashboard
- [ ] Demonstrate collaborative editing
- [ ] Review rate limits and quotas

---

## Quick Reference

### Key Files
```
src/core/production/execution.ts          # Production execution service
src/app/api/production/execute/route.ts   # Execution API endpoint
src/app/api/webhooks/production-complete/route.ts  # Webhook
src/core/jobs/cron-setup.ts              # Cron job setup
src/app/(dashboard)/production/[id]/page.tsx  # Production detail with editor
src/components/production/CollaborativeProductionEditor.tsx  # Editor component
```

### Key Endpoints
```
POST /api/production/execute              # Execute production
POST /api/webhooks/production-complete    # Record completion
GET  /api/admin/cron?action=status        # Check cron status
GET  /api/admin/cron?action=trigger       # Manually trigger
GET  /api/analytics/dashboard             # Get dashboard metrics
POST /api/analytics/metrics               # Record metric
```

### Database Tables
```
production_metrics        # Per-execution metrics
user_activity_metrics     # User actions log
workspace_metrics         # Daily aggregated metrics
```

---

## Troubleshooting

### Metrics Not Recording
```bash
# Check API endpoint
curl http://localhost:3000/api/production/execute

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM production_metrics"

# Check logs
grep "recordProductionMetric" .next/server.log
```

### Cron Not Running
```bash
# Check status
curl http://localhost:3000/api/admin/cron?action=status

# Manually trigger
curl -X GET http://localhost:3000/api/admin/cron?action=trigger \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check logs
grep "\[Cron\]" .next/server.log
```

### WebSocket Not Syncing
```bash
# Check Redis
redis-cli ping

# Check environment
echo $REDIS_URL

# Check browser console
# DevTools > Network > WS > see messages
```

---

## Success Criteria

You're done when:

- ✅ Metrics recording in production service
- ✅ Production executions record to database
- ✅ Collaborative editor working in production detail page
- ✅ Multiple users can edit same production in real-time
- ✅ Analytics dashboard displays metrics
- ✅ Cron aggregation running daily
- ✅ Cost tracking accurate
- ✅ Rate limiting working
- ✅ All tests passing
- ✅ Team trained and confident

---

## Next Phase: Advanced Features (Optional)

- [ ] Cost budgets and alerts
- [ ] Usage quotas per workspace
- [ ] Custom AI model pricing
- [ ] Production versioning
- [ ] Audit trail for all changes
- [ ] Custom field support
- [ ] Batch production execution
- [ ] Production templates & cloning
- [ ] Advanced filtering and search
- [ ] Export analytics to CSV/PDF

