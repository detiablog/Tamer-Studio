# OBS-01 Alerting

## Scope

This document describes the alerting subsystem, including alert rules, notification channels, escalation policies, and alert lifecycle management.

## Architecture

The alerting subsystem provides:

1. **Rule Engine** - Configurable alert conditions evaluated against metrics and logs
2. **Notification Channels** - Email, Slack, webhook, and in-app notifications
3. **Escalation Policies** - Automatic escalation for unresolved alerts
4. **Alert Lifecycle** - Firing, acknowledged, resolved, and dismissed states

### Alert Severity Levels

| Level      | Response Time | Notification     |
|-----------|---------------|------------------|
| INFO       | N/A           | In-app only      |
| WARNING    | 4 hours       | Email            |
| CRITICAL   | 1 hour        | Email + Slack    |
| EMERGENCY  | 15 minutes    | Email + Slack + Webhook |

### Alert Rules

```yaml
alerts:
  rules:
    - name: "high-error-rate"
      condition: "error_rate > 0.05"
      window: "5m"
      severity: "critical"
      message: "Error rate exceeds 5% for {{service}}"
    - name: "high-latency"
      condition: "p95_latency > 2000"
      window: "5m"
      severity: "warning"
      message: "P95 latency exceeds 2s for {{endpoint}}"
    - name: "low-throughput"
      condition: "throughput < 10"
      window: "10m"
      severity: "warning"
      message: "Throughput below threshold for {{service}}"
```

## Configuration

```yaml
alerting:
  enabled: true
  evaluationInterval: 30s
  notificationChannels:
    - type: "email"
      enabled: true
      recipients: ["ops@tamer.studio"]
    - type: "slack"
      enabled: true
      webhookUrl: "${SLACK_WEBHOOK_URL}"
      channel: "#alerts"
  escalation:
    enabled: true
    levels:
      - after: "30m"
        severity: "critical"
        notify: ["slack", "email"]
      - after: "1h"
        severity: "emergency"
        notify: ["slack", "email", "webhook"]
  suppression:
    enabled: true
    cooldownMinutes: 5
```

## Commands

```bash
# List active alerts
pnpm obs:alerts:list --status=firing

# Create alert rule
pnpm obs:alerts:create --name="test-alert" --condition="error_rate > 0.1"

# Acknowledge alert
pnpm obs:alerts:acknowledge --id="alert-123"

# Test notification channel
pnpm obs:alerts:test --channel=slack
```

## Verification

- Alert rules evaluate within 30 seconds of condition breach
- Notifications are delivered to all configured channels
- Escalation policies trigger at correct time intervals
- Acknowledged alerts are not re-notified
- Resolved alerts are automatically closed
