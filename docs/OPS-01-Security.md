# OPS-01: Security Monitoring

## Scope

This document describes the security monitoring subsystem within the Operations Center, covering threat detection, failed login tracking, rate limit monitoring, and security event logging.

## Architecture

### Security Metrics

| Metric | Description | Threshold |
|---|---|---|
| Security Score | Overall platform security rating (0-100) | Dynamic |
| Failed Logins | Count of failed login attempts | Warning: 10/hour, Critical: 50/hour |
| Rate Limit Hits | Count of rate limit violations | Warning: 20/hour |
| Active Sessions | Number of active user sessions | Informational |
| API Key Usage | Number of active API keys | Informational |

### Threat Detection

The security monitoring system detects:

- **Brute Force Attempts**: Multiple failed logins from the same IP.
- **Rate Limit Abuse**: Excessive API requests from a single source.
- **Unauthorized Access**: Access attempts to restricted resources.
- **Suspicious Activity**: Unusual patterns in user behavior.

### Security Events

Security events are logged with:

- **Event Type**: Category of security event (login_failed, rate_limit, unauthorized, suspicious).
- **Actor**: User or system that triggered the event.
- **IP Address**: Source IP address of the event.
- **Timestamp**: When the event occurred.
- **Severity**: Impact level (info, warning, critical).
- **Details**: Additional context about the event.

### Audit Trail

All security-relevant actions are recorded in the audit log:

- User authentication events (login, logout, password change).
- Administrative actions (user create, delete, role change).
- API key operations (create, revoke, rotate).
- Configuration changes (settings update, provider changes).

## Configuration

| Setting | Default | Description |
|---|---|---|
| `SECURITY_CHECK_INTERVAL` | `300000` | Security metrics check interval (ms) |
| `FAILED_LOGIN_THRESHOLD_WARNING` | `10` | Failed login warning threshold per hour |
| `FAILED_LOGIN_THRESHOLD_CRITICAL` | `50` | Failed login critical threshold per hour |
| `RATE_LIMIT_THRESHOLD_WARNING` | `20` | Rate limit hit warning threshold per hour |
| `SECURITY_EVENT_RETENTION_DAYS` | `90` | Days to retain security events |
| `AUDIT_LOG_RETENTION_DAYS` | `365` | Days to retain audit log entries |

## Commands

```bash
# View security score
pnpm ops:security-score

# View recent security events
pnpm ops:security-events --period 24h

# View failed login attempts
pnpm ops:security-logins --failed --period 24h

# View rate limit hits
pnpm ops:security-rate-limits --period 24h

# Export security audit
pnpm ops:security-export --format csv --period 30d

# View audit log
pnpm ops:audit-log --action user.create --period 7d
```

## Verification

- Security score is calculated and displayed accurately.
- Failed login attempts are tracked and threshold alerts trigger correctly.
- Rate limit violations are logged with source IP and timestamp.
- Security events are retained per retention policy.
- Audit log entries capture all administrative actions.
- Security reports can be exported for compliance review.
