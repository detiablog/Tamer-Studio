# SEC-01: Incident Response Plan

## Scope

Security incident detection, classification, containment, eradication, recovery, and post-incident review.

## Architecture

### Incident Severity Levels

| Level | Description | Response Time | Examples |
|---|---|---|---|
| P1 - Critical | Active breach, data exposure | 15 minutes | Confirmed data leak, ransomware |
| P2 - High | Confirmed attack, no breach yet | 1 hour | Active brute force, DDoS |
| P3 - Medium | Suspicious activity | 4 hours | Unusual API patterns, failed scans |
| P4 - Low | Policy violations | 24 hours | Unusual access patterns, minor misconfigs |

### Response Workflow

1. **Detection**: Automated alerts or manual reports
2. **Triage**: Assess severity and scope within response time SLA
3. **Containment**: Isolate affected systems, block attacking IPs
4. **Investigation**: Gather evidence, determine root cause
5. **Eradication**: Remove threat, patch vulnerabilities
6. **Recovery**: Restore services, verify integrity
7. **Post-Incident**: Document lessons learned, update defenses

### Communication Plan

- Internal notification via security channel
- External notification if data breach (per regulatory requirements)
- Status page updates for service-affecting incidents
- Customer notification within 72 hours for P1 incidents

## Configuration

```
INCIDENT_RETENTION_DAYS=365
AUTO_ESCALATION_P1=true
SLA_P1_MINUTES=15
SLA_P2_MINUTES=60
SLA_P3_MINUTES=240
SLA_P4_MINUTES=1440
```

## Commands

```bash
# Test incident response workflow
pnpm security:incident-drill

# View incident timeline
pnpm security:incident-timeline

# Generate post-incident report
pnpm security:post-incident-report

# Validate escalation procedures
pnpm security:escalation-test
```

## Verification

1. Confirm P1 incidents trigger immediate escalation
2. Test containment actions (IP block, session termination)
3. Verify incident timeline captures all response actions
4. Validate post-incident report includes root cause analysis
5. Confirm SLA tracking records response times
