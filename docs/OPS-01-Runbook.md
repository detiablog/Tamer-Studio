# OPS-01: Operational Runbook

## Scope

This document provides step-by-step operational procedures for common tasks in the Operations Center, including incident response, maintenance operations, and emergency procedures.

## Architecture

### Operational Procedures

#### Daily Operations

1. **Morning Health Check**: Review the Operations Center overview tab for any alerts or degraded services.
2. **Alert Review**: Acknowledge or resolve any alerts that were triggered overnight.
3. **Incident Review**: Check for any open incidents and update their status.
4. **Deployment Review**: Verify that recent deployments are healthy.

#### Weekly Operations

1. **Performance Review**: Review performance metrics and trends for the past week.
2. **Alert Analysis**: Analyze alert frequency and patterns to identify recurring issues.
3. **Storage Review**: Check storage usage trends and clean up if necessary.
4. **Security Review**: Review security events and audit logs for the past week.

#### Monthly Operations

1. **Capacity Planning**: Review resource utilization trends and plan for capacity changes.
2. **Retention Cleanup**: Archive or delete data that has exceeded retention policies.
3. **Configuration Review**: Review and update operations settings as needed.
4. **Report Generation**: Generate monthly operational reports.

### Emergency Procedures

#### Service Outage

1. Check the Operations Center overview for affected services.
2. Open an incident with severity "emergency".
3. Notify the on-call team via configured channels.
4. Investigate root cause using health check data and logs.
5. Implement fix or rollback.
6. Update incident with resolution and root cause.
7. Conduct post-incident review.

#### Database Issues

1. Check database health in the Infrastructure tab.
2. Review active connections and query latency.
3. If connection pool is exhausted, increase pool size temporarily.
4. If queries are slow, identify and optimize problematic queries.
5. If database is down, follow database recovery procedures.

#### AI Provider Outage

1. Check AI provider health in the AI Runtime tab.
2. If a provider is offline, check if fallback providers are configured.
3. Update routing rules to redirect traffic to healthy providers.
4. Monitor queue depth for pending AI jobs.
5. Resume normal routing when the provider recovers.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `ON_CALL_EMAIL` | (env) | On-call team email |
| `ON_CALL_PHONE` | (env) | On-call team phone |
| `ESCALATION_TIMEOUT` | `300000` | Time before escalation (ms) |
| `INCIDENT_SLA_HOURS` | `4` | Target resolution time for incidents |

## Commands

```bash
# View system overview
pnpm ops:status

# Open an incident
pnpm ops:incident-create --title "Service outage" --severity critical

# Acknowledge an alert
pnpm ops:alert-acknowledge --id <alert-id>

# Resolve an incident
pnpm ops:incident-resolve --id <incident-id> --root-cause "Config error" --resolution "Updated config"

# Run emergency health check
pnpm ops:health-check --all

# View recent audit logs
pnpm ops:audit-log --period 24h

# Generate incident report
pnpm ops:report --type incidents --period 7d
```

## Verification

- All operational procedures are documented and accessible.
- Emergency procedures are tested regularly through drills.
- On-call team contact information is current and accurate.
- Escalation policies are configured and tested.
- Incident SLAs are tracked and reported.
- Post-incident reviews are conducted for all P1/P2 incidents.
