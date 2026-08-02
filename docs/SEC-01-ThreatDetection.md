# SEC-01: Threat Detection and Monitoring

## Scope

Real-time threat detection, anomaly scoring, and automated response mechanisms.

## Architecture

### Detection Layers

1. **Network Level**: Unusual IP patterns, geographic anomalies, rate threshold breaches
2. **Application Level**: Failed authentication spikes, privilege escalation attempts, injection patterns
3. **Data Level**: Unusual data access patterns, mass export detection, schema probing
4. **AI Level**: Prompt injection attempts, excessive generation requests, content policy violations

### Threat Scoring

- Events assigned severity scores (0-100)
- Cumulative scoring per user/IP/session
- Threshold-based alerting and automatic blocking
- Manual review queue for borderline events

### Event Categories

- Brute force login attempts
- Credential stuffing patterns
- API abuse and scraping
- Prompt injection attacks
- Suspicious file uploads
- Privilege escalation attempts
- Webhook abuse
- Data exfiltration indicators

### Response Actions

- **Log**: Record event for audit trail
- **Alert**: Notify security team via configured channels
- **Block**: Temporarily block source IP or user
- **Escalate**: Create security incident for human review
- **Terminate**: Force session termination for active threats

## Configuration

```
THREAT_DETECTION_ENABLED=true
ANOMALY_SCORING=true
AUTO_BLOCK_THRESHOLD=80
ALERT_THRESHOLD=60
BRUTE_FORCE_THRESHOLD=5
BRUTE_FORCE_WINDOW=300
PROMPT_INJECTION_DETECTION=true
```

## Commands

```bash
# Run threat detection scan
pnpm security:threat-scan

# Test detection rules
pnpm security:detection-test

# View threat dashboard
pnpm security:threat-dashboard

# Generate threat report
pnpm security:threat-report
```

## Verification

1. Confirm brute force detection triggers after threshold
2. Test prompt injection detection catches common patterns
3. Verify alerting fires at configured severity thresholds
4. Validate automatic blocking engages at score threshold
5. Confirm threat events appear in audit log