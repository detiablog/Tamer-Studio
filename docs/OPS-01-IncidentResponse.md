# OPS-01: Incident Response

## Scope

This document describes the incident response framework within the Operations Center, covering incident lifecycle management, severity classification, and resolution tracking.

## Architecture

### Incident Lifecycle

```
Created --> Investigating --> Identified --> Monitoring --> Resolved
    |              |              |              |
    v              v              v              v
  Assigned     Escalated     Mitigated     Post-Incident
```

### Severity Classification

| Severity | Response Time | Resolution Target | Notification |
|---|---|---|---|
| emergency | 5 minutes | 1 hour | Email + Webhook + SMS |
| critical | 15 minutes | 4 hours | Email + Webhook |
| warning | 1 hour | 24 hours | Email |
| info | 4 hours | 72 hours | In-app only |

### Incident Fields

- **Title**: Brief description of the incident.
- **Description**: Detailed description of the issue.
- **Severity**: Classification level (emergency, critical, warning, info).
- **Status**: Current lifecycle state (investigating, identified, monitoring, resolved).
- **Affected Services**: List of services impacted by the incident.
- **Root Cause**: Identified root cause (populated during investigation).
- **Resolution**: Description of how the incident was resolved.
- **Timeline**: Chronological list of status updates and actions.

### Incident Timeline

Each status change and action is recorded with:

- **Timestamp**: When the change occurred.
- **Actor**: User who made the change.
- **Status**: New status value.
- **Note**: Additional context or explanation.

### Post-Incident Review

After resolving an emergency or critical incident:

1. Document the root cause analysis.
2. Identify contributing factors.
3. List action items to prevent recurrence.
4. Assign action item owners and deadlines.
5. Schedule follow-up review.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `INCIDENT_SLA_EMERGENCY` | `3600000` | Emergency resolution target (ms) |
| `INCIDENT_SLA_CRITICAL` | `14400000` | Critical resolution target (ms) |
| `INCIDENT_SLA_WARNING` | `86400000` | Warning resolution target (ms) |
| `INCIDENT_SLA_INFO` | `259200000` | Info resolution target (ms) |
| `INCIDENT_ESCALATION_TIMEOUT` | `300000` | Time before escalation (ms) |
| `INCIDENT_RETENTION_DAYS` | `365` | Days to retain resolved incidents |

## Commands

```bash
# Create an incident
pnpm ops:incident-create \
  --title "Database connection timeout" \
  --severity critical \
  --affected-services postgres,redis

# Update incident status
pnpm ops:incident-update --id <id> --status investigating

# Add timeline note
pnpm ops:incident-note --id <id> --note "Identified connection pool exhaustion"

# Resolve incident
pnpm ops:incident-resolve \
  --id <id> \
  --root-cause "Connection pool size too small" \
  --resolution "Increased pool size to 50"

# View incident details
pnpm ops:incident --id <id>

# List open incidents
pnpm ops:incidents --status open

# Generate incident report
pnpm ops:report --type incidents --period 30d
```

## Verification

- Incidents can be created with all required fields (title, severity, affected services).
- Status transitions follow the defined lifecycle (investigating -> identified -> monitoring -> resolved).
- Severity classification determines response time and notification channels.
- Timeline records all status changes and notes with timestamps and actors.
- SLA tracking measures time to acknowledge and resolve incidents.
- Post-incident reviews are required for emergency and critical incidents.
- Incident reports can be generated for any time period.
- Incident data is retained per retention policy.
