# SEC-01: Authorization and Access Control

## Scope

Role-based access control (RBAC), permission enforcement, and privilege escalation prevention.

## Architecture

### Role Hierarchy

- **Owner**: Full workspace control, billing, deletion
- **Admin**: User management, settings, all resources
- **Editor**: Create, edit, publish content
- **Viewer**: Read-only access to assigned resources
- **Guest**: Limited read access to public resources

### Permission Model

- Permissions assigned per resource type per role
- Workspace-level isolation enforced at database query level
- Row-level security (RLS) in PostgreSQL
- API middleware validates permissions before handler execution

### Privilege Escalation Prevention

- Users cannot self-assign roles above their current level
- Role changes require admin approval with audit log
- JWT claims validated against current database state on critical operations
- Time-bound elevated permissions for emergency access

## Configuration

```
RBAC_ENABLED=true
RLS_ENABLED=true
DEFAULT_ROLE=viewer
ELEVATED_PERMISSION_TIMEOUT=3600
ROLE_CHANGE_REQUIRES_APPROVAL=true
```

## Commands

```bash
# Audit RBAC configuration
pnpm security:rbac-audit

# Test permission boundaries
pnpm security:permission-test

# Validate RLS policies
pnpm security:rls-check
```

## Verification

1. Confirm viewer role cannot modify resources via API
2. Test workspace isolation prevents cross-workspace access
3. Verify role change creates audit log entry
4. Validate RLS policies at database level
5. Test emergency elevation timeout enforcement