# SCALE-01: Worker Scaling

## Scope

This document covers the scaling strategy for Tamer Studio background workers, including worker registration, capacity management, monitoring, and automatic scaling based on queue depth and resource utilization.

## Architecture

Workers are long-running processes that consume jobs from BullMQ queues:

- **Worker Types**: Each worker is registered with a type (AI, media, publishing, email) that determines which queues it subscribes to.
- **Worker Registry**: Workers register on startup with a unique ID, type, and capability metadata. Registry stored in Redis.
- **Heartbeat**: Workers send heartbeat signals every 15 seconds. Workers missing 3 heartbeats are marked as failed.
- **Graceful Shutdown**: On SIGTERM, workers finish in-flight jobs, drain their queues, then exit. Timeout forces hard shutdown.

Scaling strategy:
- Monitor queue depth per worker type every 30 seconds.
- Scale up when average queue depth per worker exceeds 50 jobs.
- Scale down when average queue depth per worker drops below 10 jobs.
- Maintain minimum 2 workers per type for redundancy.

## Configuration

```env
# Worker scaling
WORKER_AI_MIN=2
WORKER_AI_MAX=10
WORKER_MEDIA_MIN=2
WORKER_MEDIA_MAX=8
WORKER_PUBLISHING_MIN=1
WORKER_PUBLISHING_MAX=6
WORKER_EMAIL_MIN=1
WORKER_EMAIL_MAX=4

# Heartbeat
WORKER_HEARTBEAT_INTERVAL=15000
WORKER_HEARTBEAT_TIMEOUT=45000

# Concurrency
WORKER_AI_CONCURRENCY=5
WORKER_MEDIA_CONCURRENCY=3
WORKER_PUBLISHING_CONCURRENCY=2
WORKER_EMAIL_CONCURRENCY=4

# Shutdown
WORKER_GRACEFUL_TIMEOUT=30000
```

## Commands

```bash
# List active workers
pnpm worker:list

# Register a new worker
pnpm worker:register --type ai --concurrency 5

# Deregister a worker
pnpm worker:deregister --id worker-ai-001

# View worker metrics
pnpm worker:metrics --id worker-ai-001

# Scale workers
pnpm worker:scale --type ai --count 4
```

## Verification

- Workers register in the registry within 5 seconds of startup.
- Heartbeat detection marks failed workers within 45 seconds.
- Graceful shutdown completes within 30 seconds without job loss.
- Scale-up triggers within 60 seconds of queue depth exceeding threshold.
