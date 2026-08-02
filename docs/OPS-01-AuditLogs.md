# OPS-01: Audit Logs

## Scope

This document describes the audit logging subsystem, covering action recording, entity tracking, and audit log management within the Operations Center.

## Architecture

### Audit Event Model

Each audit log entry captures:

- **Action**: The operation performed (create, update, delete, login, logout, etc.).
- **Entity Type**: The type of entity affected (user, workspace, project, provider, etc.).
- **Entity ID**: The unique identifier of the affected entity.
- **Actor**: The user or system that performed the action.
- **IP Address**: The source IP address of the actor.
- **User Agent**: The browser/client user agent string.
- **Timestamp**: When the action occurred.
- **Details**: Additional context or payload information.

### Tracked Actions

| Category | Actions |
|---|---|
| Authentication | login, logout, password_change, email_verify |
| User Management | user_create, user_update, user_delete, role_change |
| Workspace | workspace_create, workspace_update, workspace_delete |
| Project | project_create, project_update, project_delete, project_archive |
| AI Provider | provider_connect, provider_disconnect, provider_update |
| API Key | apikey_create, apikey_revoke, apikey_rotate |
| Settings | settings_update, maintenance_toggle |
| Deployment | deployment_create, deployment_update |
| Alert | alert_acknowledge, alert_resolve, alert_dismiss |
| Incident | incident_create, incident_update, incident_resolve |

### Log Storage

Audit logs are stored in PostgreSQL with the following indexes:

- `action`: For filtering by action type.
- `entity_type`: For filtering by entity type.
- `actor_id`: For filtering by user.
- `created_at`: For date range queries.

### Log Retention

Audit logs are retained for the configured retention period (default: 365 days). Older logs are archived to cold storage before deletion.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `AUDIT_LOG_RETENTION_DAYS` | `365` | Days to retain audit logs |
| `AUDIT_PAGE_SIZE` | `50` | Default page size for audit log queries |
| `AUDIT_EXPORT_FORMAT` | `csv` | Default export format (csv, json) |

## Commands

```bash
# View recent audit logs
pnpm ops:audit-log --period 7d

# Filter by action
pnpm ops:audit-log --action user.create

# Filter by entity type
pnpm ops:audit-log --entity workspace

# Filter by user
pnpm ops:audit-log --actor user@example.com

# Export audit logs
pnpm ops:audit-export --format csv --period 30d

# Archive old audit logs
pnpm ops:audit-archive --older-than 365d
```

## Verification

- All tracked actions generate audit log entries with complete metadata.
- Audit logs can be filtered by action, entity type, actor, and date range.
- Audit logs can be exported in CSV and JSON formats.
- Audit log retention policy is enforced correctly.
- Audit log queries perform efficiently with proper indexing.
- IP address and user agent are captured for all actions.
