# Admin Authentication Audit — AUTH-ADMIN-AUDIT-01

> Generated: 2026-08-03
> Status: Complete

---

## Executive Summary

Tamer Studio has **two separate authentication systems**:

1. **Better Auth** — User authentication (email/password, OAuth, sessions)
2. **Admin Auth** — Admin authentication (email/password + Master Key, cookie sessions)

Both are functional, well-structured, and should be **extended, not replaced**.

---

## Component-by-Component Analysis

### 1. Better Auth Integration

**File:** `src/core/auth/auth.ts` (48 lines)
**Status:** ✅ KEEP

| Aspect | Value |
|--------|-------|
| Library | better-auth |
| Adapter | @better-auth/drizzle-adapter (PostgreSQL) |
| Email+Password | Enabled, min 12 chars |
| Email Verification | Send on signup |
| Password Reset | Enabled |
| Session Expiry | 7 days |
| Provider | Custom email service module |

**Assessment:** Better Auth is properly configured and working. It handles all user-facing authentication. No changes needed.

---

### 2. Admin Authentication Runtime

**Files:**
- `src/core/admin/login.ts` (128 lines)
- `src/core/admin/logout.ts` (18 lines)
- `src/core/admin/session.ts` (111 lines)
- `src/core/admin/verify.ts` (43 lines)
- `src/core/admin/guards.ts` (23 lines)

**Status:** ✅ KEEP — Improve session type

#### Login Flow
```
1. POST /api/admin/auth/login {email, password, adminKey}
2. Rate limit check (5 attempts / 15 min)
3. Master Key verification (scrypt or SHA256)
4. Password length validation (>= 12 chars)
5. Admin lookup by email
6. Password hash verification
7. Session creation (UUID token, 24h TTL)
8. Prior sessions deleted for this admin
9. lastLoginAt updated
10. Audit log recorded
11. admin_session cookie set (httpOnly, 24h)
```

**Assessment:** Login flow is complete and secure. Master key supports both scrypt and SHA256 formats. Failed attempts are tracked.

#### Session Management
- Cookie name: `admin_session`
- TTL: 24 hours (sliding window — auto-extends when < 24h remaining)
- Stored in: `adminSession` table
- Cleanup: Expired sessions deleted on lookup

**Issue Found:** `session.ts` line 55-56 uses `role as "admin" | "super_admin"` but the `AdminRole` type is `"admin" | "founder"`. This is a **type mismatch** that should be fixed.

#### Guards
- `requireAdmin()` — Checks session exists
- `requireAdminPermission(permission)` — Checks role-based permissions

**Assessment:** Guards are functional but should use the corrected `AdminRole` type.

---

### 3. Middleware

**Files:**
- `src/core/middleware/auth.middleware.ts` (120 lines)
- `src/core/middleware/authz.middleware.ts` (117 lines)
- `src/core/middleware/auth-ratelimit.ts` (31 lines)
- `src/core/middleware/rate-limit.middleware.ts` (66 lines)
- `src/core/middleware/csrf.middleware.ts` (60 lines)
- `src/core/middleware/audit.middleware.ts` (33 lines)
- `src/core/middleware/compose.ts` (54 lines)
- `src/core/middleware/types.ts` (75 lines)

**Status:** ✅ KEEP — Improve type safety

#### Auth Middleware
- `adminAuthentication()` — Extracts Bearer token or `admin_session` cookie, validates via `getAdminSessionFromToken()`
- `userAuthentication()` — Validates via Better Auth `getServerSession()`
- `eitherAuthentication()` — Tries admin first, falls back to user

**Assessment:** Both auth paths are properly separated. No duplicate runtime.

#### Authorization Middleware
- `requireAdminPermission(permission)` — Checks `ADMIN_ROLE_PERMISSIONS[role]`
- `requireUserPermission(permission)` — Checks `getEffectivePermissions(role)`
- `requireWorkspaceOwnership()` — Verifies workspace ownership
- `requireAnyRole(allowedRoles)` — Checks role in allowed list
- `requireFounder()` — Founder-only gate

**Assessment:** Authorization is properly layered. Founder protection is enforced.

#### Rate Limiting
- `authRateLimitMiddleware` — Next.js middleware, IP-based, 5 attempts / 15 min for admin login
- `rateLimitMiddleware` — Composable middleware with per-route defaults

**Assessment:** Rate limiting is reusable and properly configured.

#### CSRF
- Token from `x-csrf-token` / `x-xsrf-token` header
- Stored in `csrf_token` cookie
- Dev bypass available

**Assessment:** CSRF protection is in place for state-changing operations.

---

### 4. RBAC Synchronization

**Files:**
- `src/core/auth/permissions.ts` (275 lines)
- `src/core/admin/rbac.ts` (92 lines)
- `src/core/admin/types.ts` (45 lines)

**Status:** ✅ KEEP — Minor type fix needed

#### Role Hierarchy
| Role | Level | Permissions |
|------|-------|-------------|
| Guest | 0 | None |
| User | 1 | 17 user-level |
| Admin | 2 | 17 user + 14 operational = 31 |
| Founder | 3 | 17 user + 14 operational + 6 system-critical = 37 |

#### Permission Categories
- **User-level (17):** dashboard, workspace, project, media, production, ai, publishing, settings, billing
- **Admin operational (14):** admin:read, admin:write, admin:users, admin:workspaces, admin:billing, admin:subscriptions, admin:coupons, admin:analytics, admin:email, admin:commerce, admin:workflows, admin:pricing, admin:landing_builder, admin:stats
- **Founder system-critical (6):** admin:ai_providers, admin:jobs, admin:queues, admin:audit_logs, admin:feature_flags, admin:system

**Issue Found:** `AdminRole` type is `"admin" | "founder"` but `session.ts` references `"super_admin"`. This is a **legacy type reference** that should be updated.

---

### 5. Installation Runtime

**Files:**
- `src/core/installation/installation.service.ts` (560 lines)
- `src/core/admin/admin-bootstrap.service.ts` (107 lines)

**Status:** ✅ KEEP

#### Founder Bootstrap
- Created during installation (phase 7: `admin_creation`)
- Singleton: Only one Founder can exist
- Role: `"founder"`
- Password: Min 12 characters
- Protected: Cannot be deleted or demoted by Admin

#### Admin Bootstrap
- Created via `bootstrapAdmin()`
- Role: `"admin"`
- Password: Min 12 characters

**Assessment:** Installation correctly bootstraps Founder and Admin accounts. The flow is idempotent (checks for existing before creating).

---

### 6. Cookie Runtime

**File:** `src/core/admin/session.ts`

**Status:** ✅ KEEP

| Cookie | Value |
|--------|-------|
| Name | `admin_session` |
| HttpOnly | true |
| Secure | false (should be true in production) |
| SameSite | lax |
| MaxAge | 24 hours |
| Path | `/` |

**Issue Found:** `secure: false` should be environment-dependent. In production, this should be `true`.

---

### 7. Navigation Authorization

**File:** `src/core/navigation/permission-navigation.ts` (155 lines)

**Status:** ✅ KEEP

`PermissionAwareNavigation` class checks:
1. Item permissions against user permissions
2. Feature flags against enabled flags
3. Workspace scope
4. Organization scope

**Assessment:** Navigation filtering is properly implemented. Supports both permission and feature flag checks.

---

### 8. Audit Logging

**Files:**
- `src/core/auth/events.ts` (36 lines)
- `src/core/auth/auth-events.repository.ts`
- `src/core/audit/audit.service.ts` (108 lines)
- `src/core/audit/audit.repository.ts` (196 lines)

**Status:** ✅ KEEP

#### Login Audit Trail
| Event | Logger Call | Database |
|-------|-------------|----------|
| Successful login | `logger.audit("Admin logged in", ...)` | `auditLog` table |
| Failed login (invalid master key) | `logger.security(...)` | `failedLoginAttempt` table |
| Failed login (invalid password) | `logger.security(...)` | `failedLoginAttempt` table |
| Failed login (email not found) | `logger.security(...)` | `failedLoginAttempt` table |
| Failed login (account inactive) | `logger.security(...)` | `failedLoginAttempt` table |
| Logout | `logger.audit("Admin logged out", ...)` | `auditLog` table |

**Assessment:** Audit logging covers login, logout, and all failure scenarios. Two separate tracking systems (auditLog + failedLoginAttempt) provide both general audit trail and security-focused tracking.

---

### 9. Rate Limiting

**Files:**
- `src/core/middleware/auth-ratelimit.ts` (31 lines)
- `src/core/middleware/rate-limit.middleware.ts` (66 lines)
- `src/core/security/ratelimit.ts`

**Status:** ✅ KEEP

| Route | Window | Max Requests |
|-------|--------|-------------|
| POST /api/admin/auth/login | 15 min | 5 |
| POST /api/admin | 1 min | 10 |
| GET /api/admin | 1 min | 100 |
| POST /api/user | 1 min | 30 |
| GET /api/user | 1 min | 200 |

**Assessment:** Rate limiting is properly configured with per-route defaults. IP-based identification.

---

### 10. Admin Repositories

**File:** `src/core/admin/admin.repository.ts` (71 lines)

**Status:** ✅ KEEP

| Repository | Methods |
|------------|---------|
| `AdminRepository` | `findByEmail()`, `findById()`, `updateLastLogin()` |
| `AdminSessionRepository` | `create()`, `deleteByAdminId()`, `findByToken()`, `findByAdminId()`, `deleteExpired()`, `extendSession()` |

**Assessment:** Repository layer is clean and properly abstracted. Uses Drizzle ORM.

---

### 11. Admin Services

**Files:**
- `src/core/admin/admin.service.ts` (25 lines)
- `src/core/admin/settings/settings.service.ts` (163 lines)

**Status:** ✅ KEEP

**Assessment:** Services are minimal and focused. Settings service is in-memory (acceptable for current use).

---

## Issues Found

| # | Issue | Severity | Component | Recommendation |
|---|-------|----------|-----------|----------------|
| 1 | `session.ts` line 55-56 uses `role as "admin" \| "super_admin"` but `AdminRole` is `"admin" \| "founder"` | Medium | Admin Session | Fix type to use `AdminRole` |
| 2 | `secure: false` on admin_session cookie | Medium | Cookie | Make environment-dependent |
| 3 | No `AdminRole` type exported from admin module for session type | Low | Admin Types | Export and use consistently |

---

## Verification Results

| Check | Status | Evidence |
|-------|--------|----------|
| No duplicate authentication runtime | ✅ | Two separate systems: Better Auth (user) + Admin Auth (admin) |
| No legacy admin login remains | ✅ | Single login flow via `/api/admin/auth/login` |
| No obsolete role names remain | ⚠️ | `session.ts` references `"super_admin"` — should be `"founder"` |
| Founder/Admin roles synchronized | ✅ | `AdminRole = "admin" \| "founder"` in types.ts |
| Middleware uses permissions | ✅ | `requireAdminPermission()` checks `ADMIN_ROLE_PERMISSIONS` |
| Better Auth is primary auth provider | ✅ | All user auth goes through Better Auth |
| Installation bootstraps Founder correctly | ✅ | `bootstrapFounder()` with singleton check |
| Session lifecycle is reusable | ✅ | `getAdminSession()`, `setAdminSessionCookie()`, `clearAdminSessionCookie()` |
| Cookie runtime is reusable | ✅ | Cookie helpers are exported and used by API routes |
| Audit logging covers login/logout/failed | ✅ | Both logger and database tracking |
| Rate limiting is reusable | ✅ | Two middleware layers with per-route config |

---

## KEEP / IMPROVE / CREATE Summary

### KEEP (No Changes)
- Better Auth configuration
- Admin login/logout flow
- Session management (cookie + database)
- Master Key verification
- RBAC permission system
- Middleware pipeline
- Navigation authorization
- Rate limiting
- CSRF protection
- Audit logging
- Installation bootstrap
- Admin repository
- Admin service
- Settings service

### IMPROVE (Minor Fixes)
1. Fix `session.ts` type: `"admin" | "super_admin"` → use `AdminRole`
2. Make cookie `secure` flag environment-dependent
3. Ensure consistent `AdminRole` type usage across all files

### CREATE (Not Needed)
No new components need to be created. The existing architecture is complete.

---

## Conclusion

The admin authentication architecture is **production-ready**. The only changes needed are minor type fixes and a cookie security improvement. All major components are reusable, well-structured, and properly separated from user authentication.

The AUTH-ADMIN-01 sprint should focus on:
1. Fixing the `super_admin` type reference in `session.ts`
2. Making the cookie `secure` flag environment-dependent
3. Building the new Founder/Admin login UI on top of the existing runtime
