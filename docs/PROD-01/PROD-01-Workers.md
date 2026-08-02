# PROD-01: Queue Workers

**Document ID:** PROD-01-Workers  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the queue worker system for Tamer Studio, including AI job processing, publishing jobs, email jobs, retry logic, auto-restart, and monitoring.

---

## Architecture

```
App --> Job Dispatcher --> Redis Queue --> Worker --> Job Handler
                    |                              |
                    v                              v
              Retry Queue                    Dead Letter Queue
              (on failure)                   (max retries exceeded)
```

---

## Job Types

### Job Interface

```typescript
// src/core/jobs/job.types.ts

export interface Job {
  id: JobId;
  type: string;
  payload: JobPayload;
  status: JobStatus;
  priority: JobPriority;
  progress: number;
  attempts: number;
  maxAttempts: number;
  result?: unknown;
  error?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export type JobPriority = "low" | "normal" | "high";
```

### Worker Interface

```typescript
export interface Worker {
  type: string;
  process(job: Job): Promise<void>;
  cancel?(jobId: JobId): Promise<void>;
}
```

---

## Job Categories

### 1. AI Jobs

| Job Type | Purpose | Timeout |
|----------|---------|---------|
| `ai.generate` | Generate content with AI | 120s |
| `ai.analyze` | Analyze content | 60s |
| `ai.optimize` | Optimize prompts | 90s |
| `ai.classify` | Classify assets | 30s |

### 2. Publishing Jobs

| Job Type | Purpose | Timeout |
|----------|---------|---------|
| `publish.article` | Publish article | 30s |
| `publish.social` | Post to social media | 45s |
| `publish.email` | Send email campaign | 60s |
| `publish.schedule` | Schedule publication | 10s |

### 3. Email Jobs

| Job Type | Purpose | Timeout |
|----------|---------|---------|
| `email.transactional` | Send transactional email | 30s |
| `email.marketing` | Send marketing email | 60s |
| `email.notification` | Send notification | 15s |

### 4. Asset Jobs

| Job Type | Purpose | Timeout |
|----------|---------|---------|
| `asset.process` | Process uploaded asset | 60s |
| `asset.resize` | Resize images | 30s |
| `asset.compress` | Compress files | 45s |

---

## Job Dispatcher

```typescript
// src/core/jobs/job-dispatcher.ts

export class JobDispatcher {
  async start(): Promise<void>
  async stop(): Promise<void>
  registerWorker(worker: Worker): void
  async dispatch(job: Job): Promise<JobId>
  onProgress(handler: (event: ProgressEvent) => void): () => void
}
```

### Dispatch Flow

```
1. Create job record in Redis
2. Set status to "queued"
3. Add to appropriate queue (by priority)
4. Worker picks up job
5. Update status to "processing"
6. Execute job handler
7. Update status to "completed" or "failed"
8. On failure: retry or move to dead letter queue
```

---

## Retry Logic

### Retry Configuration

```typescript
// src/core/jobs/retry-queue.ts

export interface RetryConfig {
  maxAttempts: number;      // Default: 3
  backoffMultiplier: number; // Default: 2
  initialDelay: number;     // Default: 1000ms
  maxDelay: number;         // Default: 30000ms
}
```

### Backoff Strategy

| Attempt | Delay | Total Wait |
|---------|-------|------------|
| 1 | 1s | 1s |
| 2 | 2s | 3s |
| 3 | 4s | 7s |
| 4 | 8s | 15s |
| 5 | 16s | 31s |

### Retry Flow

```
Job fails
  |
  v
Attempts < maxAttempts?
  |           |
  Yes         No
  |           |
  v           v
Calculate    Move to
delay        Dead Letter
  |          Queue
  v
Wait
  |
  v
Re-enqueue
```

---

## Dead Letter Queue

```typescript
// src/core/jobs/dead-letter-queue.ts

export interface DeadLetterQueue {
  add(job: Job, reason: string): Promise<void>;
  list(): Promise<Job[]>;
  retry(jobId: JobId): Promise<void>;
}
```

### DLQ Management

```bash
# List dead letter jobs
docker compose exec app node -e "
const { deadLetterQueue } = require('./src/core/jobs/dead-letter-queue');
deadLetterQueue.list().then(console.log);
"

# Retry specific job
docker compose exec app node -e "
const { deadLetterQueue } = require('./src/core/jobs/dead-letter-queue');
deadLetterQueue.retry('job-id').then(console.log);
"
```

---

## Worker Configuration

### Docker Compose

```yaml
worker:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: tamer-worker
  restart: unless-stopped
  command: ["node", "worker.js"]
  env_file:
    - .env
  environment:
    - WORKER_MODE=true
  depends_on:
    db:
      condition: service_healthy
    redis:
      condition: service_healthy
  networks:
    - tamer-network
```

### Auto-Restart

```yaml
restart: unless-stopped
```

Workers automatically restart on failure. The `unless-stopped` policy ensures:
- Container restarts on crash
- Container does not restart if manually stopped
- Container starts on Docker daemon restart

---

## Monitoring

### Job Metrics

```typescript
// src/core/jobs/metrics-aggregation.ts

export interface JobMetrics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageDuration: number;
  queueDepth: number;
  retryRate: number;
}
```

### Health Check

```bash
# Check worker status
docker compose ps worker

# View worker logs
docker compose logs -f worker

# Check queue depth
docker compose exec redis redis-cli LLEN "job:queue"
```

### Alerting

| Metric | Warning | Critical |
|--------|---------|----------|
| Queue depth | > 100 | > 500 |
| Failure rate | > 5% | > 20% |
| Average duration | > 30s | > 60s |
| Worker restarts | > 3/hour | > 10/hour |

---

## Commands

### Start Worker

```bash
# Via Docker Compose
docker compose up -d worker

# Manual start
docker compose exec worker node worker.js
```

### View Worker Logs

```bash
docker compose logs -f worker
docker compose logs --tail=100 worker
```

### Monitor Queue

```bash
# Queue depth
docker compose exec redis redis-cli LLEN "job:queue"

# Failed jobs
docker compose exec redis redis-cli LLEN "job:failed"

# Retry queue
docker compose exec redis redis-cli LLEN "job:retry"
```

### Cancel Job

```bash
curl -X POST http://localhost:3000/api/jobs/{jobId}/cancel \
  -H "Authorization: Bearer <token>"
```

### Retry Failed Job

```bash
curl -X POST http://localhost:3000/api/jobs/{jobId}/retry \
  -H "Authorization: Bearer <token>"
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Worker running | `docker compose ps worker` | Status "Up" |
| Worker processing | `docker compose logs worker` | Job processing logs |
| Queue functional | Enqueue test job | Job processed successfully |
| Retry works | Fail job, check retry | Job retried with backoff |
| DLQ works | Exceed max retries | Job moved to DLQ |
| Auto-restart | `docker compose stop worker` | Worker restarts automatically |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Worker not starting | `docker compose logs worker` | Check WORKER_MODE=true, Redis connection |
| Jobs stuck in queue | Check queue depth, worker logs | Restart worker, check for blocking operations |
| High failure rate | Check job error logs | Fix job handlers, increase timeouts |
| Memory leak | `docker stats` | Restart worker, check for resource leaks |
| DLQ filling up | Check DLQ job count | Investigate root cause, retry or fix jobs |
| Slow processing | Check average job duration | Optimize job handlers, scale workers |
