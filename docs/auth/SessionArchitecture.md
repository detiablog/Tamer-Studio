# Session Architecture

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Overview

Tamer Studio implements two independent session systems: **User** (Better Auth) and **Admin** (custom). Both use database-backed sessions with HTTP-only cookies.

## User Session Lifecycle

```
User → POST /api/auth/sign-in → Better Auth → session table (PostgreSQL)
     → Sets cookie: better-auth.session_token
     → proxy.ts checks cookie for /dashboard routes
     → Server components call getServerSession() → DB lookup
     → Client components call authClient.useSession()
```

- **Session table:** `session` (schema: `src/lib/db/schema/auth.ts:24`)
- **Fields:** id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId
- **Foreign key:** userId → user.id (cascade delete)
- **Expiry:** 7 days (`60 * 60 * 24 * 7` seconds, configured in `src/core/auth/auth.ts:38`)
- **Token format:** 32+ character alphanumeric string

## Admin Session Lifecycle

```
Admin → POST /api/admin/auth/login → loginAdmin() → admin_session table (PostgreSQL)
      → Sets cookie: admin_session
      → proxy.ts checks cookie for /admin routes
      → Server components call getAdminSession() → DB lookup
      → Client components call /api/admin/me
```

- **Session table:** `admin_session` (schema: `src/lib/db/schema/admin.ts:28`)
- **Fields:** id, token, adminId, expiresAt, ipAddress, userAgent, createdAt
- **Foreign key:** adminId → admin.id (cascade delete)
- **Expiry:** 24 hours (set in `src/core/admin/login.ts:95`)
- **Token format:** UUID (`randomUUID()`)

## Middleware Layer

- **File:** `src/proxy.ts`
- **Function:** `proxy(request)` — Next.js middleware
- **Route classification:** PUBLIC_ROUTES, AUTH_ROUTES, ADMIN_ROUTES, ADMIN_LOGIN_ROUTE
- **User auth:** Checks `better-auth.session_token` cookie presence + format
- **Admin auth:** Checks `admin_session` cookie or `Authorization: Bearer` header
- **DB validation:** `getAdminSessionFromToken()` for admin, `getServerSession()` for user

## Key Files

| Component | File |
|-----------|------|
| Better Auth config | `src/core/auth/auth.ts` |
| User session schema | `src/lib/db/schema/auth.ts` |
| Admin session schema | `src/lib/db/schema/admin.ts` |
| Admin login logic | `src/core/admin/login.ts` |
| Admin session helpers | `src/core/admin/session.ts` |
| Admin logout logic | `src/core/admin/logout.ts` |
| Middleware | `src/proxy.ts` |
| Admin login API | `src/app/api/admin/auth/login/route.ts` |
| Admin logout API | `src/app/api/admin/auth/logout/route.ts` |

## Session Isolation

- User and admin sessions are **completely isolated** — different tables, different cookies, different lookup functions
- No shared session state between the two systems
- Admin sessions require a master key in addition to email/password
- User sessions are managed entirely by Better Auth library
