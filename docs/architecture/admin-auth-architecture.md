# Admin Authentication Architecture — AUTH-ADMIN-AUDIT-01

> Generated: 2026-08-03
> Status: Finalized

---

## Overview

Tamer Studio uses a **dual authentication architecture**:

1. **Better Auth** — User-facing authentication (registration, login, sessions)
2. **Admin Auth** — Admin panel authentication (email/password + Master Key)

Both systems share the same database (PostgreSQL) but use separate session tables and cookie mechanisms.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication Layer                   │
├──────────────────────┬──────────────────────────────────┤
│     Better Auth      │        Admin Auth                │
│   (User Sessions)    │    (Admin Sessions)              │
├──────────────────────┼──────────────────────────────────┤
│ • Email/Password     │ • Email/Password                 │
│ • OAuth (future)     │ • Master Key Required            │
│ • 7-day sessions     │ • 24-hour sessions (sliding)     │
│ • session table      │ • adminSession table             │
│ • better-auth cookie │ • admin_session cookie           │
├──────────────────────┼──────────────────────────────────┤
│     User Table       │       Admin Table                │
│  (user, session,     │    (admin, adminSession)         │
│   account)           │                                  │
└──────────────────────┴──────────────────────────────────┘
```

---

## Component Map

### Authentication Providers

| Provider | Purpose | Session Table | Cookie | Expiry |
|----------|---------|---------------|--------|--------|
| Better Auth | User auth | `session` | `better-auth.session_token` | 7 days |
| Admin Auth | Admin auth | `adminSession` | `admin_session` | 24 hours |

### Authorization Layers

| Layer | Mechanism | Location |
|-------|-----------|----------|
| Role-based | `AdminRole` / `UserRole` | `admin/types.ts`, `auth/permissions.ts` |
| Permission-based | `ADMIN_ROLE_PERMISSIONS` | `admin/rbac.ts` |
| Route-based | `ADMIN_ROUTE_PERMISSIONS` | `admin/rbac.ts` |
| Feature flag-based | `PermissionAwareNavigation` | `navigation/permission-navigation.ts` |

---

## Login Flow — Admin

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Admin Login │────▶│  API Route   │────▶│  Rate Limit  │
│  Form        │     │  /api/admin/ │     │  5/15min     │
│              │     │  auth/login  │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Master Key   │
                    │ Verification │
                    │ (scrypt/SHA) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Password    │
                    │  Verification│
                    │  (bcrypt)    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Session     │
                    │  Creation    │
                    │  (UUID, 24h) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Cookie Set  │
                    │  admin_      │
                    │  session     │
                    └──────────────┘
```

---

## Session Lifecycle

### Creation
1. Login validates credentials + master key
2. UUID token generated
3. Prior sessions for this admin deleted
4. New session inserted into `adminSession` table
5. `admin_session` cookie set (httpOnly, 24h)

### Validation (on each request)
1. Read `admin_session` cookie
2. Look up session by token in `adminSession` table
3. Check expiry (delete if expired)
4. Auto-extend if < 24h remaining (sliding window)
5. Look up admin record, verify `isActive`
6. Return `AdminSession` with role

### Destruction
1. Logout deletes session from `adminSession` table
2. `admin_session` cookie deleted

---

## Middleware Pipeline

```
Request
  │
  ├── rateLimitMiddleware()      → IP-based rate limiting
  ├── csrfMiddleware()           → CSRF token validation
  ├── adminAuthentication()      → Session validation
  ├── requireAdminPermission()   → RBAC check
  └── auditMiddleware()          → Audit logging
  │
  ▼
Route Handler
```

### Middleware Types

| Middleware | Purpose | Reusable |
|------------|---------|----------|
| `adminAuthentication()` | Validates admin session | ✅ |
| `userAuthentication()` | Validates user session | ✅ |
| `eitherAuthentication()` | Tries admin, falls back to user | ✅ |
| `requireAdminPermission(p)` | Checks admin role permissions | ✅ |
| `requireUserPermission(p)` | Checks user role permissions | ✅ |
| `requireFounder()` | Founder-only gate | ✅ |
| `requireWorkspaceOwnership()` | Workspace ownership check | ✅ |
| `requireAnyRole(roles)` | Role in allowed list | ✅ |
| `rateLimitMiddleware()` | Per-route rate limiting | ✅ |
| `csrfMiddleware()` | CSRF protection | ✅ |
| `auditMiddleware()` | Audit logging | ✅ |

---

## RBAC Architecture

### Role Hierarchy
```
Founder (level 3) — ALL permissions, Master Key required
  └── Admin (level 2) — Operational permissions only
        └── User (level 1) — User-level permissions only
              └── Guest (level 0) — No permissions
```

### Permission Distribution

| Category | Count | Roles |
|----------|-------|-------|
| User-level | 17 | User, Admin, Founder |
| Admin operational | 14 | Admin, Founder |
| Admin system-critical | 6 | Founder only |
| **Total** | **37** | |

### Admin Panel Route Permissions

| Route | Permission | Admin | Founder |
|-------|------------|-------|---------|
| `/admin` | `admin:read` | ✅ | ✅ |
| `/admin/users` | `admin:users` | ✅ | ✅ |
| `/admin/workspaces` | `admin:workspaces` | ✅ | ✅ |
| `/admin/ai-providers` | `admin:ai_providers` | ❌ | ✅ |
| `/admin/jobs` | `admin:jobs` | ❌ | ✅ |
| `/admin/queues` | `admin:queues` | ❌ | ✅ |
| `/admin/billing` | `admin:billing` | ✅ | ✅ |
| `/admin/subscriptions` | `admin:subscriptions` | ✅ | ✅ |
| `/admin/coupons` | `admin:coupons` | ✅ | ✅ |
| `/admin/analytics` | `admin:analytics` | ✅ | ✅ |
| `/admin/audit-logs` | `admin:audit_logs` | ❌ | ✅ |
| `/admin/feature-flags` | `admin:feature_flags` | ❌ | ✅ |
| `/admin/settings` | `admin:system` | ❌ | ✅ |
| `/admin/stats` | `admin:stats` | ✅ | ✅ |
| `/admin/email` | `admin:email` | ✅ | ✅ |
| `/admin/workflows` | `admin:workflows` | ✅ | ✅ |
| `/admin/pricing` | `admin:pricing` | ✅ | ✅ |
| `/admin/landing-builder` | `admin:landing_builder` | ✅ | ✅ |
| `/admin/commerce` | `admin:commerce` | ✅ | ✅ |

---

## Database Schema

### Admin Table
```sql
admin (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',  -- 'admin' | 'founder'
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Admin Session Table
```sql
admin_session (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  admin_id TEXT NOT NULL REFERENCES admin(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Failed Login Attempt Table
```sql
failed_login_attempt (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  identifier TEXT NOT NULL,
  reason TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## Security Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| Password hashing | scrypt via `@/core/security/hash` | ✅ |
| Master Key verification | scrypt or SHA256 with timing-safe comparison | ✅ |
| Session token | UUID v4 | ✅ |
| Cookie security | httpOnly, sameSite: lax | ✅ |
| CSRF protection | Token in header + cookie | ✅ |
| Rate limiting | IP-based, per-route config | ✅ |
| Failed login tracking | Database + logger | ✅ |
| Session expiry | 24h with sliding window | ✅ |
| Single session per admin | Prior sessions deleted on login | ✅ |
| Audit logging | Login, logout, failures | ✅ |

---

## File Inventory

### Core Admin Auth
| File | Lines | Purpose |
|------|-------|---------|
| `src/core/admin/login.ts` | 128 | Login logic |
| `src/core/admin/logout.ts` | 18 | Logout logic |
| `src/core/admin/session.ts` | 111 | Session management |
| `src/core/admin/verify.ts` | 43 | Master key verification |
| `src/core/admin/guards.ts` | 23 | Route guards |
| `src/core/admin/rbac.ts` | 92 | Role-permission mapping |
| `src/core/admin/types.ts` | 45 | Type definitions |
| `src/core/admin/admin.repository.ts` | 71 | Database queries |
| `src/core/admin/admin.service.ts` | 25 | Profile service |
| `src/core/admin/admin-bootstrap.service.ts` | 107 | Founder/Admin bootstrap |

### Better Auth
| File | Lines | Purpose |
|------|-------|---------|
| `src/core/auth/auth.ts` | 48 | Better Auth config |
| `src/core/auth/session.ts` | 98 | User session helpers |
| `src/core/auth/types.ts` | 23 | User session types |
| `src/core/auth/permissions.ts` | 275 | RBAC permissions |
| `src/core/auth/events.ts` | 36 | Failed login tracking |

### Middleware
| File | Lines | Purpose |
|------|-------|---------|
| `src/core/middleware/auth.middleware.ts` | 120 | Auth middleware |
| `src/core/middleware/authz.middleware.ts` | 117 | Authorization middleware |
| `src/core/middleware/auth-ratelimit.ts` | 31 | Auth rate limiting |
| `src/core/middleware/rate-limit.middleware.ts` | 66 | General rate limiting |
| `src/core/middleware/csrf.middleware.ts` | 60 | CSRF protection |
| `src/core/middleware/audit.middleware.ts` | 33 | Audit logging |
| `src/core/middleware/compose.ts` | 54 | Middleware composition |

### API Routes
| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/admin/auth/login/route.ts` | 89 | Login endpoint |
| `src/app/api/admin/auth/logout/route.ts` | 17 | Logout endpoint |

### UI
| File | Lines | Purpose |
|------|-------|---------|
| `src/app/admin/(public)/login/page.tsx` | 30 | Login page (server) |
| `src/app/admin/(public)/login/_components/LoginPageClient.tsx` | 66 | Login client wrapper |
| `src/components/admin/AdminLoginForm.tsx` | 249 | Login form component |

---

## Recommendations for AUTH-ADMIN-01

### Must Fix
1. Fix `session.ts` type: `role as "admin" | "super_admin"` → use `AdminRole`
2. Make cookie `secure` flag environment-dependent

### Should Improve
1. Add `SameSite: strict` option for production
2. Consider adding session rotation on privilege escalation
3. Add IP-based session binding (optional)

### No Changes Needed
- Better Auth configuration
- Master Key verification
- RBAC permission system
- Middleware pipeline
- Rate limiting
- CSRF protection
- Audit logging
- Installation bootstrap
