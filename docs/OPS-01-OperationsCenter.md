# OPS-01: Operations Center Design

## Scope

This document describes the design of the Operations Center dashboard, including layout, navigation, data visualization, and interaction patterns for monitoring Tamer Studio infrastructure.

## Architecture

### Dashboard Layout

The Operations Center is organized into tabbed sections accessible from the admin panel sidebar:

```
Operations Center
  +-- Overview (default)
  +-- Infrastructure
  +-- Alerts
  +-- Incidents
  +-- Deployments
  +-- Maintenance
  +-- Audit Logs
  +-- Reports
  +-- Settings
```

### Overview Tab

The overview tab provides a summary view with:

- **System Status**: Overall system health indicator (healthy, degraded, down)
- **Health Status Cards**: Individual service health cards for database, Redis, storage, AI runtime, SMTP, queue, and workers
- **Resource Metrics**: CPU usage, memory usage, and disk usage gauges
- **Alert Summary**: Count of open, critical, and emergency alerts
- **Incident Summary**: Count of open and total incidents
- **Deployment Status**: Current version, commit hash, and deployment status
- **Maintenance Mode**: Toggle for global maintenance mode

### Data Components

- **StatusBadge**: Color-coded status indicator (green = healthy, yellow = warning, red = critical)
- **MetricGauge**: Circular or bar gauge for resource utilization
- **AlertList**: Filterable list of alerts with severity indicators
- **IncidentTimeline**: Chronological view of incident lifecycle events
- **DeploymentCard**: Card showing deployment details and status
- **AuditTable**: Paginated table of audit log entries

### Interaction Patterns

- Click an alert to view details and perform acknowledge/resolve/dismiss actions
- Click an incident to view timeline, root cause, and resolution history
- Toggle maintenance mode with confirmation dialog
- Filter audit logs by action type, entity type, date range, and user
- Generate reports on demand with configurable period and type

## Configuration

| Setting | Default | Description |
|---|---|---|
| `OVERVIEW_REFRESH_INTERVAL` | `10000` | Auto-refresh interval for overview data (ms) |
| `ALERT_PAGE_SIZE` | `25` | Number of alerts per page |
| `INCIDENT_PAGE_SIZE` | `25` | Number of incidents per page |
| `AUDIT_PAGE_SIZE` | `50` | Number of audit entries per page |
| `AUTO_REFRESH_ENABLED` | `true` | Enable auto-refresh on overview tab |

## Commands

```bash
# Start development server with operations routes
pnpm dev

# Run operations center tests
pnpm test --filter operations

# Build operations center components
pnpm build --filter @tamer/operations
```

## Verification

- Overview tab loads within 2 seconds and displays all status cards.
- All tabs are accessible from the sidebar navigation.
- Alert, incident, and audit data loads with pagination.
- Maintenance mode toggle requires confirmation.
- Report generation produces downloadable files.
- Auto-refresh updates data without full page reload.
