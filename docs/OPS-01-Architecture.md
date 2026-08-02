# OPS-01: Operations Center Architecture

## Scope

This document defines the overall architecture of the Tamer Studio Operations Center, including service boundaries, data flow, technology stack, and integration points across all operational subsystems.

## Architecture

### System Overview

The Operations Center is a centralized platform for monitoring, managing, and responding to operational events across Tamer Studio infrastructure. It provides a unified view of system health, alerts, incidents, deployments, maintenance windows, and audit trails.

### Component Map

```
Operations Center
  |
  +-- Infrastructure Monitor
  |     +-- CPU / Memory / Disk collectors
  |     +-- Database health probes
  |     +-- Redis health probes
  |     +-- Storage health probes
  |
  +-- AI Runtime Monitor
  |     +-- Provider health checks
  |     +-- Latency and throughput metrics
  |     +-- Queue depth tracking
  |     +-- Worker status tracking
  |
  +-- Alert Center
  |     +-- Alert rules engine
  |     +-- Notification dispatch (email, webhook)
  |     +-- Escalation policies
  |
  +-- Incident Manager
  |     +-- Incident lifecycle (open, acknowledged, resolved)
  |     +-- Root cause tracking
  |     +-- Resolution history
  |
  +-- Deployment Tracker
  |     +-- Version registry
  |     +-- Commit hash tracking
  |     +-- Deployment status pipeline
  |
  +-- Maintenance Scheduler
  |     +-- Maintenance window creation
  |     +-- Maintenance mode toggle
  |     +-- Notification on schedule
  |
  +-- Audit Logger
  |     +-- Action recording
  |     +-- Entity tracking
  |     +-- IP address logging
  |
  +-- Report Engine
  |     +-- Scheduled report generation
  |     +-- Period-based aggregation
  |     +-- Export capabilities
  |
  +-- Settings Manager
        +-- Alert email configuration
        +-- Health check intervals
        +-- Retention policies
        +-- Auto-resolve rules
```

### Data Flow

1. Infrastructure collectors poll system metrics at configurable intervals.
2. AI Runtime monitors probe provider endpoints and record latency, success rate, and queue depth.
3. Alert rules engine evaluates collected metrics against thresholds and generates alerts.
4. Alerts dispatch notifications via configured channels (email, webhook).
5. Incidents are created from alerts or manually and tracked through their lifecycle.
6. Deployments are registered via API and tracked through status transitions.
7. Maintenance windows are scheduled and trigger maintenance mode on affected services.
8. All actions are recorded in the audit log with actor, timestamp, and entity details.
9. Reports are generated on schedule or on demand from aggregated operational data.

### Technology Stack

- **Runtime**: Next.js (App Router) with React Server Components
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis for health check state and metrics aggregation
- **Queue**: BullMQ for background job processing (report generation, metric collection)
- **Charts**: Recharts for dashboard visualizations
- **State**: React hooks with SWR for real-time data fetching

## Configuration

| Setting | Default | Description |
|---|---|---|
| `HEALTH_CHECK_INTERVAL` | `30000` | Health check interval in milliseconds |
| `ALERT_EVALUATION_INTERVAL` | `60000` | Alert rule evaluation interval |
| `METRIC_RETENTION_DAYS` | `90` | Days to retain metric data |
| `AUDIT_LOG_RETENTION_DAYS` | `365` | Days to retain audit log entries |
| `REPORT_SCHEDULE_CRON` | `0 0 * * *` | Cron expression for daily reports |
| `MAINTENANCE_MODE` | `false` | Global maintenance mode flag |
| `AUTO_RESOLVE_ALERTS` | `true` | Auto-resolve alerts after resolution |
| `ALERT_EMAILS` | `[]` | List of alert notification email addresses |

## Commands

```bash
# Run health check manually
pnpm ops:health-check

# Generate operational report
pnpm ops:generate-report

# Check system status
pnpm ops:status

# Run alert evaluation cycle
pnpm ops:evaluate-alerts

# Export audit logs
pnpm ops:export-audit --format csv --period 30d
```

## Verification

- Health checks return status for all monitored services within the configured interval.
- Alerts are generated when metrics exceed defined thresholds.
- Incidents can be created, acknowledged, resolved, and dismissed via the UI and API.
- Deployments are tracked with version, commit hash, and status.
- Maintenance windows can be scheduled and toggled.
- Audit logs capture all administrative actions with actor, entity, and IP.
- Reports are generated on schedule and can be exported in CSV and JSON formats.
- Settings changes are persisted and reflected across the platform.
