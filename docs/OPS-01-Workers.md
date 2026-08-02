# OPS-01: Worker Monitoring

## Scope

This document describes the worker monitoring subsystem, covering worker registration, health tracking, lifecycle management, and status reporting.

## Architecture

### Worker Lifecycle

```
Registered --> Running --> Paused --> Running
                |            |
                v            v
             Stopped     Stopped
                |
                v
            Offline
```

### Worker Types

| Type | Purpose | Max Concurrent | Heartbeat |
|---|---|---|---|
| generation | AI content generation | Configurable | 30s |
| email | Email delivery | Configurable | 30s |
| publish | Social media publishing | Configurable | 30s |
| cleanup | File cleanup and archival | 1 | 60s |
| report | Report generation | 1 | 60s |

### Health Tracking

Each worker is monitored for:

- **Heartbeat**: Workers send periodic heartbeats to indicate they are alive.
- **Missing Heartbeat**: If no heartbeat is received within the timeout window, the worker is marked offline.
- **Job Count**: The number of jobs currently being processed.
- **Error Count**: The number of errors encountered during the current session.
- **Memory Usage**: Current memory consumption of the worker process.
- **Uptime**: Duration since the worker was started.

### Status Values

| Status | Description |
|---|---|
| running | Worker is active and processing jobs |
| paused | Worker is registered but not processing jobs |
| stopped | Worker has been gracefully shut down |
| offline | Worker has missed heartbeats and is unresponsive |

## Configuration

| Setting | Default | Description |
|---|---|---|
| `WORKER_HEARTBEAT_INTERVAL` | `30000` | Worker heartbeat interval (ms) |
| `WORKER_TIMEOUT_MS` | `90000` | Worker offline timeout (ms) |
| `MAX_WORKERS_PER_TYPE` | `4` | Maximum workers of each type |
| `WORKER_SHUTDOWN_TIMEOUT` | `30000` | Graceful shutdown timeout (ms) |

## Commands

```bash
# List all registered workers
pnpm ops:worker-list

# View worker details
pnpm ops:worker-status --id worker-001

# Register a new worker
pnpm ops:worker-register --type generation

# Deregister a worker
pnpm ops:worker-deregister --id worker-001

# Pause a worker
pnpm ops:worker-pause --id worker-001

# Resume a worker
pnpm ops:worker-resume --id worker-001

# View worker logs
pnpm ops:worker-logs --id worker-001 --tail 100
```

## Verification

- All registered workers appear in the Worker Status table.
- Worker status transitions (running, paused, stopped, offline) are reflected in real-time.
- Heartbeat monitoring detects offline workers within the timeout window.
- Worker job counts and error counts are updated continuously.
- Workers can be registered, deregistered, paused, and resumed via the API.
- Worker logs are accessible from the Operations Center UI.
