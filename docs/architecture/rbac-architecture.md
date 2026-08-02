# RBAC Architecture — Single Source of Truth

> **Status**: Finalized
> **Last Updated**: 2026-08-03
> **Sprint**: RBAC-01R

---

## Overview

This document defines the Role-Based Access Control (RBAC) architecture for Tamer Studio. It is the **single source of truth** for all permission-related decisions across the system.

---

## System Roles

| Role | Level | Description | Authentication |
|------|-------|-------------|----------------|
| **Guest** | 0 | Unauthenticated visitor | None |
| **User** | 1 | Authenticated customer | Better Auth (email/password) |
| **Admin** | 2 | Admin panel access | Email/password (no Master Key) |
| **Founder** | 3 | Platform founder | Master Key required |

### Guest (Level 0)
- Unauthenticated visitor
- Public access only (landing page, pricing, login, register)
- No permissions

### User (Level 1)
- Authenticated customer
- Capabilities depend on: Subscription, Credits, Permissions, Feature availability
- Never hardcode premium features

### Admin (Level 2)
- Email/password authentication (no Master Key)
- Permissions granted entirely from database
- **Operational permissions only** (daily operations)
- **NOT allowed**: System Settings, Recovery, Installation, Master Key, Secret Management, Environment, AI Provider Configuration, Feature Flag Management, Audit Log Management

### Founder (Level 3)
- Created during installation only
- **Unique**: Only one active Founder account
- **Protected**: Cannot be deleted or demoted by Admin
- **Master Key required** for login and critical actions
- **ALL system permissions** including system-critical operations

---

## Permission Categories

### User-Level Permissions
Available to User, Admin, and Founder roles.

| Permission | Description |
|------------|-------------|
| `dashboard:read` | Read dashboard |
| `workspace:read` | Read workspace |
| `workspace:write` | Write workspace |
| `workspace:admin` | Admin workspace |
| `project:read` | Read projects |
| `project:write` | Write projects |
| `project:admin` | Admin projects |
| `media:read` | Read media |
| `media:write` | Write media |
| `media:admin` | Admin media |
| `production:read` | Read production |
| `production:write` | Write production |
| `production:admin` | Admin production |
| `ai:read` | Read AI |
| `ai:write` | Write AI |
| `ai:admin` | Admin AI |
| `publishing:read` | Read publishing |
| `publishing:write` | Write publishing |
| `publishing:admin` | Admin publishing |
| `settings:read` | Read settings |
| `settings:write` | Write settings |
| `settings:admin` | Admin settings |
| `billing:read` | Read billing |
| `billing:write` | Write billing |
| `billing:admin` | Admin billing |

### Admin Operational Permissions
Available to Admin and Founder roles. Daily operations only.

| Permission | Description |
|------------|-------------|
| `admin:read` | Read admin panel |
| `admin:write` | Write admin panel |
| `admin:users` | Manage users |
| `admin:workspaces` | Manage workspaces |
| `admin:billing` | Manage billing |
| `admin:subscriptions` | Manage subscriptions |
| `admin:coupons` | Manage coupons |
| `admin:analytics` | View analytics |
| `admin:email` | Manage email |
| `admin:commerce` | Manage commerce |
| `admin:workflows` | Manage workflows |
| `admin:pricing` | Manage pricing |
| `admin:landing_builder` | Manage landing pages |
| `admin:stats` | View statistics |

### Admin System-Critical Permissions
**Founder-only**. These are restricted from Admin.

| Permission | Description |
|------------|-------------|
| `admin:ai_providers` | Manage AI providers |
| `admin:jobs` | Manage background jobs |
| `admin:queues` | Manage job queues |
| `admin:audit_logs` | View audit logs |
| `admin:feature_flags` | Manage feature flags |
| `admin:system` | System settings |

---

## Permission Assignment Matrix

| Permission Category | Guest | User | Admin | Founder |
|---------------------|-------|------|-------|---------|
| User-level (25) | ❌ | ✅ | ✅ | ✅ |
| Admin Operational (14) | ❌ | ❌ | ✅ | ✅ |
| Admin System-Critical (6) | ❌ | ❌ | ❌ | ✅ |
| **Total** | **0** | **25** | **39** | **45** |

---

## Feature Flag vs Permission Separation

### Required Flow
```
Feature Enabled → Permission Granted → Access Allowed
```

### Responsibilities

| Concept | Responsibility |
|---------|----------------|
| **Feature Flag** | Controls feature availability (is the feature turned on?) |
| **Permission** | Controls feature authorization (is the user allowed to use it?) |

### Rules
1. Never allow Role alone to control feature visibility
2. Feature Flag must be checked separately from Permission
3. Both must be satisfied for access

### Implementation
- Feature Flags: `src/core/config/features.ts` (runtime) + `src/lib/db/schema/feature-flags.ts` (database)
- Permissions: `src/core/auth/permissions.ts` (TypeScript) + `src/lib/db/schema/identity.ts` (database)

---

## Navigation Authorization

### Admin Sidebar
All admin sidebar items require specific permissions:

| Item | Required Permission |
|------|---------------------|
| Admin Dashboard | `admin:read` |
| Users | `admin:users` |
| Workspaces | `admin:workspaces` |
| Projects | `admin:read` |
| Workflows | `admin:workflows` |
| AI Providers | `admin:ai_providers` |
| Landing Builder | `admin:landing_builder` |
| Jobs | `admin:jobs` |
| Queues | `admin:queues` |
| Billing | `admin:billing` |
| Subscriptions | `admin:subscriptions` |
| Pricing | `admin:pricing` |
| Coupons | `admin:coupons` |
| Analytics | `admin:analytics` |
| Audit Logs | `admin:audit_logs` |
| Feature Flags | `admin:feature_flags` |
| Settings | `admin:system` |
| Email | `admin:email` |
| Publishing | `admin:read` |
| Story Engine | `admin:read` |
| Memory | `admin:read` |

### User Sidebar
User sidebar items require user-level permissions (e.g., `dashboard:read`, `workspace:read`).

### Navigation Runtime
- `PermissionAwareNavigation` class filters items by permissions and feature flags
- `filterMenuByPermission()` applies filtering to both top-level items and group items
- Items with empty `permissions` array are visible to all authenticated users

---

## Middleware Pipeline

### Authentication → Permission → Feature Flag → Execution

```
1. Authentication Middleware
   ├── adminAuthentication() — validates admin session
   ├── userAuthentication() — validates user session
   └── eitherAuthentication() — tries admin, falls back to user

2. Authorization Middleware
   ├── requireAdminPermission(permission) — checks ADMIN_ROLE_PERMISSIONS
   ├── requireUserPermission(permission) — checks getEffectivePermissions()
   ├── requireWorkspaceOwnership() — verifies workspace ownership
   ├── requireAnyRole(allowedRoles) — checks role in allowed list
   └── requireFounder() — requires Founder role only

3. Feature Flag Check
   └── PermissionAwareNavigation.canAccessItem() — checks featureFlags + permissions

4. Execution
   └── Route handler executes
```

### Middleware Files
- `src/core/middleware/auth.middleware.ts` — Authentication
- `src/core/middleware/authz.middleware.ts` — Authorization
- `src/core/middleware/compose.ts` — Middleware composition
- `src/core/middleware/index.ts` — Barrel exports

---

## Installation Synchronization

### Installation Runtime Seeds

| Phase | What is Seeded |
|-------|----------------|
| `admin_creation` | Founder account (role: "founder") |
| `roles_init` | Founder (level 3), Admin (level 2), User (level 1) |
| `permissions_init` | 45 permissions across 3 categories |

### Permission Seeding Logic
1. **Founder**: ALL 45 permissions (user-level + admin operational + system-critical)
2. **Admin**: 39 permissions (user-level + admin operational only)
3. **User**: 25 permissions (user-level only, enforced via TypeScript)
4. **Guest**: 0 permissions (virtual role)

### Installation Service
- `src/core/installation/installation.service.ts` — Orchestrates installation
- `src/core/admin/admin-bootstrap.service.ts` — Creates Founder/Admin accounts

---

## Better Auth Synchronization

### Two Separate Auth Systems

| System | Table | Role Column | Session |
|--------|-------|-------------|---------|
| Better Auth | `user` | `role` (varchar) | `session` (Better Auth) |
| Admin Auth | `admin` | `role` (text) | `admin_session` (custom) |

### Role Storage
- **User**: `user.role` column stores "guest", "user", "admin", or "founder"
- **Admin**: `admin.role` column stores "admin" or "founder"

### Session Integration
- `getServerSession()` — Returns UserSession with role from Better Auth
- `getAdminSession()` — Returns AdminSession with role from admin table
- `getUserPermissions()` — Computes effective permissions from role

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `role` | System roles (Founder, Admin, User) |
| `permission` | Permission definitions (45 total) |
| `role_permission` | Role-Permission junction (many-to-many) |
| `user` | Better Auth users (with role column) |
| `admin` | Admin users (with role column) |
| `admin_session` | Admin sessions |
| `workspace_member` | Workspace membership with role |
| `invitation` | Workspace invitations with role |

### Relationships
```
role ←→ role_permission ←→ permission
workspace_member → role (optional FK)
invitation → role (optional FK)
```

### Migration
- `drizzle/0038_update_rbac_system_roles.sql` — Seeds roles and permissions

---

## Source Code Locations

| Component | File Path |
|-----------|-----------|
| Permission definitions | `src/core/auth/permissions.ts` |
| Admin RBAC | `src/core/admin/rbac.ts` |
| Admin types | `src/core/admin/types.ts` |
| Auth middleware | `src/core/middleware/auth.middleware.ts` |
| Authz middleware | `src/core/middleware/authz.middleware.ts` |
| Session helpers | `src/core/auth/session.ts` |
| Navigation bootstrap | `src/core/navigation/navigation-bootstrap.ts` |
| Permission navigation | `src/core/navigation/permission-navigation.ts` |
| Installation service | `src/core/installation/installation.service.ts` |
| Admin bootstrap | `src/core/admin/admin-bootstrap.service.ts` |
| Feature flags | `src/core/config/features.ts` |

---

## Validation Checklist

✅ Only four system roles exist
✅ Founder receives all permissions
✅ Admin receives operational permissions only
✅ User receives user permissions only
✅ Guest remains virtual
✅ Feature Flag and Permission are separated
✅ Navigation uses Feature + Permission
✅ Middleware is synchronized
✅ Better Auth is synchronized
✅ Installation Runtime is synchronized
✅ Database remains backward compatible
✅ Existing architecture preserved

---

## Future Considerations

1. **Per-user permissions**: Currently no mechanism to grant individual users specific permissions outside their role
2. **Feature flag persistence**: Currently in-memory, DB schema exists but not wired to service
3. **Database role FK**: `admin.role` and `user.role` are plain text columns, not FK to `role` table
4. **Legacy migration**: Existing users with "super_admin" role need migration to "admin"
