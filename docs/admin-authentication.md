# Admin Authentication Architecture

**Date:** 2026-07-29  
**Sprint:** AUTH-02  

---

## Overview

The admin authentication system is a separate auth pipeline from Better Auth (user auth). It uses:

- Custom admin credentials (email + password + master key)
- Database-backed sessions (PostgreSQL)
- httpOnly cookies
- RBAC permissions

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| Login Service | `src/core/admin/login.ts` | Validates credentials, creates session |
| Session Service | `src/core/admin/session.ts` | Validates session tokens, manages cookies |
| Logout Service | `src/core/admin/logout.ts` | Destroys sessions |
| Verify Service | `src/core/admin/verify.ts` | Validates master key |
| Admin Repository | `src/core/admin/admin.repository.ts` | DB operations for admin + session tables |
| RBAC | `src/core/admin/rbac.ts` | Route → permission mapping |
| Guards | `src/core/admin/guards.ts` | requireAdmin(), requireAdminPermission() |
| Middleware | `src/core/middleware/auth.middleware.ts` | adminAuthentication() middleware |
| Proxy | `src/proxy.ts` | Route-level protection |
| Login API | `src/app/api/admin/auth/login/route.ts` | POST /api/admin/auth/login |
| Logout API | `src/app/api/admin/auth/logout/route.ts` | POST /api/admin/auth/logout |

---

## Login Flow

```
1. Admin submits email + password + adminKey
2. Rate limit check (5 requests per 15 minutes per IP)
3. Master key validation:
   a. If ADMIN_MASTER_KEY env set → compare plain text
   b. If ADMIN_MASTER_KEY_HASH env set → compare SHA256 hash (timing-safe)
4. Password length validation (>= 12 chars)
5. Admin record lookup by email in `admin` table
6. Account active check
7. Password hash verification (bcrypt via verifyPassword)
8. Delete existing sessions for this admin
9. Create new session in `admin_session` table
10. Update lastLoginAt
11. Set `admin_session` cookie (httpOnly, secure, sameSite=lax, 24h)
12. Audit log entry
```

---

## Session Lifecycle

### Creation
- Token: UUID (randomUUID)
- Storage: `admin_session` table in PostgreSQL
- Cookie: `admin_session`, httpOnly, secure, sameSite=lax, path=/, maxAge=86400

### Validation
- Extracted from `Authorization: Bearer` header OR `admin_session` cookie
- DB lookup via `adminSessionRepository.findByToken()`
- Expiry check
- Admin record lookup
- Active status check

### Renewal
- Sliding window: extends expiry by 24h on each access

### Destruction
- Logout: deletes from `admin_session` table + clears cookie

---

## Cookie Configuration

| Setting | Value |
|---------|-------|
| Name | `admin_session` |
| httpOnly | true |
| secure | true (production) |
| sameSite | lax |
| path | / |
| maxAge | 86400 (24 hours) |

---

## Middleware Flow

```
Request → proxy.ts
  → /admin/login: validate existing session, redirect if valid
  → /admin/*: extract token, validate via DB, redirect to login if invalid
  → Route handler → adminAuthentication(false) middleware
    → extractToken() from cookie or Authorization header
    → getAdminSessionFromToken() → DB lookup
    → Populate ctx.state.adminSession
```

---

## Security Design

1. **No dev-mode bypass** — All sessions validated against DB in all environments
2. **No localStorage** — Session stored only in httpOnly cookie
3. **No hardcoded endpoints** — UI communicates via fetch with credentials: "include"
4. **Rate limiting** — 5 login attempts per 15 minutes per IP
5. **Timing-safe comparison** — Master key hash compared using crypto.timingSafeEqual
6. **Failed login tracking** — All failed attempts logged to `failed_login_attempt` table
7. **Audit logging** — All login/logout actions logged to audit system
8. **Session rotation** — Old sessions deleted on new login
9. **Cookie security** — httpOnly, secure, sameSite=lax
