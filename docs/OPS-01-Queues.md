# OPS-01: Queue Monitoring

## Scope

This document describes the queue monitoring subsystem, covering job queue status, worker management, and queue operations within the Operations Center.

## Architecture

### Queue Types

| Queue | Purpose | Workers | Priority |
|---|---|---|---|
| generation | AI content generation jobs | AI workers | High |
| email | Email delivery jobs | Email workers | Medium |
| publish | Social media publishing jobs | Publish workers | Medium |
| cleanup | File cleanup and archival | Background workers | Low |
| report | Report generation jobs | Background workers | Low |

### Queue State Model

```
Created --> Queued --> Processing --> Completed
                        |                 |
                        v                 v
                      Failed           Failed
                        |
                        v
                    Retrying --> Processing
```

### Monitoring Metrics

- **Queue Depth**: Number of jobs in each state (queued, processing, failed).
- **Processing Rate**: Jobs completed per minute across all queues.
- **Average Wait Time**: Average time a job spends in queued state before processing begins.
- **Average Processing Time**: Average duration of job processing.
- **Failure Rate**: Percentage of jobs that fail during processing.
- **Retry Count**: Number of retry attempts for failed jobs.

### Worker Management

Workers are registered and tracked with the following attributes:

- **Worker ID**: Unique identifier for the worker process.
- **Worker Type**: Category of work the worker handles (generation, email, publish, cleanup).
- **PID**: Process ID of the worker.
- **Status**: Current state (running, paused, stopped, offline).
- **Heartbeat**: Timestamp of last heartbeat.
- **Active Jobs**: Number of jobs currently being processed.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `QUEUE_CHECK_INTERVAL` | `30000` | Queue status check interval (ms) |
| `WORKER_HEARTBEAT_INTERVAL` | `30000` | Worker heartbeat interval (ms) |
| `WORKER_TIMEOUT_MS` | `90000` | Worker offline timeout (ms) |
| `MAX_RETRY_ATTEMPTS` | `3` | Maximum retry attempts for failed jobs |
| `STALE_JOB_THRESHOLD` | `300` | Seconds before a job is considered stale |
| `QUEUE_DEPTH_WARNING` | `100` | Queue depth warning threshold |
| `QUEUE_DEPTH_CRITICAL` | `500` | Queue depth critical threshold |

## Commands

```bash
# View queue status
pnpm ops:queue-status

# View specific queue
pnpm ops:queue-status --queue generation

# Retry failed jobs in a queue
pnpm ops:retry-failed --queue generation

# Clear stale jobs from a queue
pnpm ops:clear-stale --queue email --older-than 300

# Pause a queue
pnpm ops:queue-pause --queue generation

# Resume a queue
pnpm ops:queue-resume --queue generation

# Register a worker
pnpm ops:worker-register --type generation --pid 12345

# Deregister a worker
pnpm ops:worker-deregister --id worker-001
```

## Verification

- All configured queues appear in the Queue Status tab with real-time metrics.
- Queue depth, processing rate, and failure rate are updated continuously.
- Workers are listed with their current status and heartbeat information.
- Stale jobs are detected and flagged for review.
- Queue pause/resume operations take effect immediately.
- Failed jobs can be retried individually or in bulk.
