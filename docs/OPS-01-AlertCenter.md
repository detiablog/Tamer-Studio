# OPS-01: Alert Center

## Scope

This document describes the Alert Center subsystem, covering alert rules, notification dispatch, escalation policies, and alert lifecycle management.

## Architecture

### Alert Lifecycle

```
Created --> Open --> Acknowledged --> Resolved
                  |                     |
                  v                     v
              Dismissed            Dismissed
```

### Alert Severity Levels

| Level | Description | Notification |
|---|---|---|
| info | Informational event, no action required | No notification |
| warning | Potential issue, investigation recommended | Email notification |
| critical | Service impact detected, immediate action needed | Email + webhook |
| emergency | Complete service outage, all-hands response | Email + webhook + SMS |

### Alert Rules

Alert rules define conditions that trigger alerts:

- **Metric Condition**: Metric value exceeds or falls below a threshold.
- **Health Check Failure**: Service health check returns non-healthy status.
- **Error Rate Spike**: Error rate exceeds a percentage threshold.
- **Queue Depth**: Queue depth exceeds a configured limit.
- **Worker Offline**: A registered worker misses heartbeats.

### Notification Dispatch

Alerts dispatch notifications through configured channels:

- **Email**: Alert emails sent to configured alert email addresses.
- **Webhook**: HTTP POST to configured webhook URLs.
- **In-App**: Alerts appear in the Operations Center UI.

### Escalation

If an alert is not acknowledged within the configured timeout:

1. First escalation: Notification to additional recipients.
2. Second escalation: Alert severity is increased.
3. Third escalation: Emergency notification to on-call personnel.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `ALERT_EVALUATION_INTERVAL` | `60000` | Alert rule evaluation interval (ms) |
| `ALERT_ESCALATION_TIMEOUT` | `300000` | Time before escalation (ms) |
| `ALERT_EMAILS` | `[]` | Alert notification email addresses |
| `ALERT_WEBHOOK_URLS` | `[]` | Alert webhook URLs |
| `AUTO_RESOLVE_AFTER` | `3600000` | Auto-resolve alerts after (ms) |
| `ALERT_RETENTION_DAYS` | `90` | Days to retain resolved alerts |

## Commands

```bash
# View open alerts
pnpm ops:alerts --status open

# Acknowledge an alert
pnpm ops:alert-acknowledge --id <alert-id>

# Resolve an alert
pnpm ops:alert-resolve --id <alert-id>

# Dismiss an alert
pnpm ops:alert-dismiss --id <alert-id>

# View alert history
pnpm ops:alerts --period 30d

# Test alert notification
pnpm ops:alert-test --email admin@tamer.studio
```

## Verification

- Alerts are generated when conditions are met and thresholds are exceeded.
- Alert severity levels are correctly assigned based on conditions.
- Notifications are dispatched to configured channels.
- Acknowledge, resolve, and dismiss actions update alert status.
- Escalation policies trigger when alerts are not acknowledged in time.
- Auto-resolve cleans up stale alerts after the configured timeout.
- Alert history is retained per retention policy.
