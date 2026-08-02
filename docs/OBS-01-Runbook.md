# OBS-01 Runbook

## Scope

This document provides operational procedures for the Observability Platform, including incident response, troubleshooting, and maintenance tasks.

## Architecture

The runbook covers these operational areas:

1. **Incident Response** - Step-by-step procedures for common production issues
2. **Troubleshooting** - Diagnostic steps for platform components
3. **Maintenance** - Regular operational tasks and their schedules
4. **Recovery** - Backup and restore procedures for observability data

### Common Incidents

| Incident                     | Severity | Response Time | Escalation |
|-----------------------------|----------|---------------|------------|
| Collector down              | Critical | 15 min        | On-call    |
| Alerting failure            | Critical | 15 min        | On-call    |
| Dashboard unavailable       | Warning  | 1 hour        | Team lead  |
| Metric ingestion delay      | Warning  | 2 hours       | Team lead  |
| Log search timeout          | Info     | 4 hours       | Engineer   |

### Diagnostic Commands

```bash
# Check collector health
pnpm obs:ops:collector:health

# Verify metric ingestion
pnpm obs:ops:metrics:verify

# Test alert notification
pnpm obs:ops:alerts:test

# Check database connectivity
pnpm obs:ops:db:health

# Verify Redis cache
pnpm obs:ops:redis:ping
```

### Maintenance Schedule

| Task                  | Frequency | Owner   |
|----------------------|-----------|---------|
| Collector health check| Every 5 min| Auto   |
| Metric downsampling   | Daily     | Auto    |
| Log purge            | Daily     | Auto    |
| Alert rule review    | Weekly    | On-call |
| Dashboard audit      | Monthly   | Team    |
| Capacity planning    | Monthly   | Lead    |

## Configuration

```yaml
runbook:
  oncall:
    escalation:
      - after: "5m"
        notify: ["pagerduty"]
      - after: "15m"
        notify: ["slack:#incidents"]
      - after: "30m"
        notify: ["slack:#leadership"]
  diagnostics:
    healthCheckInterval: "5m"
    alertTestInterval: "24h"
  maintenance:
    autoDownsample: true
    autoPurge: true
    reviewSchedule: "weekly"
```

## Commands

```bash
# Run diagnostics
pnpm obs:ops:diagnostics

# Check all subsystems
pnpm obs:ops:health:all

# Simulate incident
pnpm obs:ops:simulate --type="collector-down"

# Execute maintenance window
pnpm obs:ops:maintenance:start
```

## Verification

- Health checks run at configured intervals
- Escalation notifications reach all channels
- Diagnostic commands complete within 30 seconds
- Maintenance tasks execute on schedule
- Recovery procedures restore data within RTO
