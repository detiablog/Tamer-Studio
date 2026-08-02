# SEC-01: Audit Logging

## Scope

Immutable audit trail for all security-relevant actions, access events, and system changes.

## Architecture

### Log Categories

- **Authentication**: Login, logout, password changes, 2FA events
- **Authorization**: Permission checks, role changes, access denials
- **Data Access**: CRUD operations on sensitive resources
- **Administrative**: System configuration changes, user management
- **Security**: Threat detections, incident responses, blocking events
- **API**: External API key usage, webhook deliveries

### Log Structure

```json
{
  "id": "uuid",
  "timestamp": "ISO8601",
  "userId": "string",
  "action": "string",
  "resourceType": "string",
  "resourceId": "string",
  "ipAddress": "string",
  "userAgent": "string",
  "status": "success|failure",
  "metadata": {},
  "previousState": {},
  "newState": {}
}
```

### Immutability Guarantees

- Logs written to append-only storage
- No update or delete operations on log records
- Log integrity verification via checksums
- Separate database table with restricted access
- No user-facing delete capability for audit logs

### Retention and Archival

- Active logs: 90 days in primary storage
- Archived logs: 365 days in cold storage
- Compliance logs: 7 years for regulatory requirements
- Automated archival pipeline

## Configuration

```
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=365
AUDIT_LOG_IMMUTABLE=true
AUDIT_LOG_CHECKSUM=true
AUDIT_LOG_ARCHIVE_ENABLED=true
AUDIT_LOG_ARCHIVE_DAYS=90
```

## Commands

```bash
# Query audit logs
pnpm security:audit-query

# Verify log immutability
pnpm security:audit-integrity-check

# Export audit logs
pnpm security:audit-export

# Generate audit report
pnpm security:audit-report
```

## Verification

1. Confirm audit logs cannot be modified or deleted via application
2. Test log checksum verification detects tampering
3. Verify all authentication events are logged
4. Validate log retention policies are enforced
5. Confirm audit logs capture sufficient context for forensics
