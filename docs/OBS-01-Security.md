# OBS-01 Security

## Scope

This document covers the security aspects of the Observability Platform, including authentication, authorization, data protection, and audit logging.

## Architecture

The security subsystem provides:

1. **Authentication** - API key and OAuth 2.0 authentication for API access
2. **Authorization** - Role-based access control (RBAC) for dashboards, alerts, and reports
3. **Data Protection** - Encryption at rest and in transit for all observability data
4. **Audit Logging** - All administrative actions are logged and auditable

### Role-Based Access Control

| Role         | Metrics | Logs | Traces | Alerts | Dashboards | Reports | Settings |
|-------------|---------|------|--------|--------|------------|---------|----------|
| Viewer      | Read    | Read | Read   | Read   | Read       | Read    | -        |
| Editor      | Read    | Read | Read   | Read/Write | Read/Write | Read/Write | -  |
| Admin       | Full    | Full | Full   | Full   | Full       | Full    | Full     |

### Data Protection

- All API communication over TLS 1.3
- Database encryption using AES-256
- Log data encrypted at rest with customer-managed keys
- API keys stored as salted bcrypt hashes
- Sensitive fields masked in log output

### Audit Events

| Event                 | Logged | Retention |
|----------------------|--------|-----------|
| API key created      | Yes    | 1 year    |
| API key revoked      | Yes    | 1 year    |
| Alert rule modified  | Yes    | 90 days   |
| Dashboard modified   | Yes    | 90 days   |
| Settings changed     | Yes    | 1 year    |
| Data exported        | Yes    | 1 year    |

## Configuration

```yaml
security:
  authentication:
    method: "api_key"
    tokenExpiry: "90d"
    maxKeysPerUser: 5
  authorization:
    enabled: true
    defaultRole: "viewer"
  encryption:
    atRest: true
    algorithm: "AES-256"
    keyRotationDays: 90
  audit:
    enabled: true
    retentionDays: 365
    events:
      - "key.created"
      - "key.revoked"
      - "alert.updated"
      - "dashboard.updated"
      - "settings.updated"
```

## Commands

```bash
# List API keys
pnpm obs:security:keys

# Revoke API key
pnpm obs:security:revoke --keyId="key-123"

# View audit log
pnpm obs:security:audit --since="30d"

# Rotate encryption key
pnpm obs:security:rotate-key
```

## Verification

- Unauthenticated requests return 401 Unauthorized
- Unauthorized actions return 403 Forbidden
- All API keys are stored as bcrypt hashes
- Audit logs capture all administrative actions
- Encryption keys are rotated within configured intervals
