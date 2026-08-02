# OPS-01: AI Runtime Monitoring

## Scope

This document describes the AI Runtime monitoring subsystem, covering provider health, model latency, queue depth, and worker status tracking.

## Architecture

### Monitored Components

| Component | Metrics | Check Interval |
|---|---|---|
| AI Providers | Online/Offline, Latency, Success Rate | 60s |
| AI Models | Availability, Error Rate | 60s |
| Generation Queue | Depth, Processing Rate, Age | 30s |
| Workers | Status, Heartbeat, Job Count | 30s |

### Provider Health Check

Each configured AI provider is periodically checked:

1. A lightweight test request is sent to the provider endpoint.
2. Response time is recorded as latency.
3. Success/failure status is logged.
4. Consecutive failures trigger degraded status.
5. Three consecutive failures trigger offline status and an alert.

### Queue Monitoring

Generation queues are monitored for:

- **Queue Depth**: Number of pending jobs in each queue.
- **Processing Rate**: Jobs completed per minute.
- **Oldest Job Age**: Time since the oldest pending job was enqueued.
- **Failed Job Count**: Number of jobs in failed state.

### Worker Monitoring

Registered workers are tracked for:

- **Heartbeat**: Workers must send a heartbeat every 30 seconds.
- **Missing Heartbeat**: If no heartbeat is received within 90 seconds, the worker is marked offline.
- **Job Processing**: Number of jobs currently being processed by each worker.

### Dashboard Components

- **Provider Health Grid**: Cards for each provider showing online/offline status, latency, and success rate.
- **Queue Status Panel**: Real-time queue depth and processing rate visualization.
- **Worker Status Table**: Table of registered workers with PID, type, status, and last heartbeat.
- **AI Runtime Charts**: Line charts for latency trends and throughput over time.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `AI_PROVIDER_CHECK_INTERVAL` | `60000` | Provider health check interval (ms) |
| `AI_WORKER_HEARTBEAT_INTERVAL` | `30000` | Worker heartbeat interval (ms) |
| `AI_WORKER_TIMEOUT_MS` | `90000` | Worker offline timeout (ms) |
| `AI_QUEUE_CHECK_INTERVAL` | `30000` | Queue depth check interval (ms) |
| `AI_CONSECUTIVE_FAILURES_THRESHOLD` | `3` | Failures before marking provider offline |
| `AI_QUEUE_DEPTH_WARNING` | `100` | Queue depth warning threshold |
| `AI_QUEUE_DEPTH_CRITICAL` | `500` | Queue depth critical threshold |

## Commands

```bash
# Check AI provider health
pnpm ops:ai-health

# View queue status
pnpm ops:queue-status

# View worker status
pnpm ops:worker-status

# Retry failed AI jobs
pnpm ops:retry-failed-jobs

# Clear stuck queue items
pnpm ops:clear-queue --queue generation --stale 300
```

## Verification

- All configured AI providers appear in the health grid with real-time status.
- Provider latency and success rate are updated on each check cycle.
- Queue depth and processing rate are displayed in real-time.
- Workers are tracked with heartbeat status and offline detection.
- Alerts are generated when providers go offline or queues exceed thresholds.
- Historical AI runtime metrics are retained per retention policy.
