# RBAC Migration Plan

> **Status**: Complete
> **Date**: 2026-08-03
> **Sprint**: RBAC-01R

---

## Overview

This document outlines the database migration plan for the RBAC architecture refinement. The migration is **backward compatible** and **additive only** — no data destruction.

---

## Migration Files

### Existing Migration
- `drizzle/0038_update_rbac_system_roles.sql` — Seeds roles and permissions

### New Migration Required
No new migration is required for RBAC-01R. The changes are:
1. TypeScript-level permission separation (Founder vs Admin)
2. Legacy permission string cleanup in API routes
3. Installation service seeding logic update

---

## Permission Changes

### Before RBAC-01R
| Role | Permissions |
|------|-------------|
| Founder | 38 permissions (all admin + user) |
| Admin | 38 permissions (all admin + user) |
| User | 25 permissions (user-level) |
| Guest | 0 permissions |

### After RBAC-01R
| Role | Permissions |
|------|-------------|
| Founder | 45 permissions (all admin + user + system-critical) |
| Admin | 39 permissions (admin operational + user) |
| User | 25 permissions (user-level) |
| Guest | 0 permissions |

### Permission Changes by Role

#### Founder
- **Added**: 6 system-critical permissions
  - `admin:ai_providers`
  - `admin:jobs`
  - `admin:queues`
  - `admin:audit_logs`
  - `admin:feature_flags`
  - `admin:system`

#### Admin
- **Removed**: 6 system-critical permissions (now Founder-only)
  - `admin:ai_providers`
  - `admin:jobs`
  - `admin:queues`
  - `admin:audit_logs`
  - `admin:feature_flags`
  - `admin:system`

#### User
- **No changes**

#### Guest
- **No changes**

---

## Database Impact

### Tables Affected
| Table | Impact |
|-------|--------|
| `permission` | No schema changes |
| `role` | No schema changes |
| `role_permission` | No schema changes |
| `user` | No schema changes |
| `admin` | No schema changes |

### Data Impact
- **Existing permissions**: No changes
- **Existing roles**: No changes
- **Existing role_permission mappings**: No changes
- **Installation seeding**: Updated to seed different permissions for Founder and Admin

---

## Backward Compatibility

### What Works Without Migration
- All existing users continue to work
- All existing admins continue to work
- All existing permissions continue to work
- All existing role assignments continue to work

### What Changes
- Admin users will no longer see system-critical admin panel items (AI Providers, Jobs, Queues, Audit Logs, Feature Flags, Settings)
- Admin users will no longer have access to system-critical API routes
- Founder users retain full access

### Breaking Changes
- Admin users with `admin:system` permission will lose access to system settings
- Admin users with `admin:feature_flags` permission will lose access to feature flags
- Admin users with `admin:audit_logs` permission will lose access to audit logs

---

## Migration Strategy

### Option 1: No Migration Required (Recommended)
The changes are TypeScript-level only. The database remains unchanged. Admin users who need system-critical access can be promoted to Founder by the existing Founder.

### Option 2: Database Migration (If Needed)
If you need to explicitly grant system-critical permissions to specific Admin users:

```sql
-- Example: Grant admin:system to a specific Admin user
INSERT INTO role_permission (id, role_id, permission_id)
SELECT 
  gen_random_uuid(),
  r.id,
  p.id
FROM role r
JOIN permission p ON p.key = 'admin:system'
WHERE r.name = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
```

### Option 3: Permission Grant API (Future)
Implement a permission grant/revoke API for Founder to manage Admin permissions.

---

## Rollback Plan

If the changes need to be reverted:

### TypeScript Rollback
1. Revert `src/core/auth/permissions.ts` to previous version
2. Revert `src/core/admin/rbac.ts` to previous version
3. Revert API route files to previous versions
4. Revert `src/core/installation/installation.service.ts` to previous version

### Database Rollback
No database rollback is required — no database changes were made.

---

## Testing Plan

### Test Cases

1. **Founder Login**
   - Login with Founder credentials
   - Verify all 45 permissions are available
   - Verify access to all admin panel items
   - Verify access to system-critical routes

2. **Admin Login**
   - Login with Admin credentials
   - Verify 39 operational permissions are available
   - Verify access to operational admin panel items
   - Verify NO access to system-critical items (AI Providers, Jobs, Queues, Audit Logs, Feature Flags, Settings)

3. **User Login**
   - Login with User credentials
   - Verify 25 user-level permissions are available
   - Verify access to user dashboard items

4. **Guest Access**
   - Access landing page without login
   - Verify public pages are accessible
   - Verify protected pages redirect to login

5. **Permission Enforcement**
   - Test API routes with different roles
   - Verify 403 errors for unauthorized access
   - Verify 200 responses for authorized access

6. **Navigation Filtering**
   - Test admin sidebar with Founder role (all items visible)
   - Test admin sidebar with Admin role (operational items only)
   - Test user sidebar with User role (user items only)

---

## Deployment Plan

### Pre-Deployment
1. Review all changes in RBAC-01R
2. Run TypeScript compilation check
3. Run linting check
4. Run test suite

### Deployment
1. Deploy TypeScript changes
2. No database migration required
3. Monitor for authorization errors

### Post-Deployment
1. Verify Founder can access all admin panel items
2. Verify Admin can access operational items only
3. Verify User can access user dashboard items
4. Monitor logs for permission errors

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Admin loses system-critical access | Medium | High | Founder can promote Admin to Founder |
| Legacy API routes break | Low | Low | All legacy strings updated |
| Navigation items not visible | Medium | Medium | Verify permissions in navigation bootstrap |
| Installation fails | High | Low | Test installation flow |

---

## Recommendations

### Immediate
1. ✅ Deploy TypeScript changes
2. ✅ No database migration required
3. ✅ Monitor for authorization errors

### Short-term
1. Implement permission grant/revoke API for Founder
2. Add permission audit trail
3. Add per-user permission overrides

### Long-term
1. Consider database FK for admin.role and user.role
2. Implement permission caching for performance
3. Add permission versioning
