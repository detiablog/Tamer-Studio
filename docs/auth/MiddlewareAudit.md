# Middleware Authentication Audit

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Middleware Overview

**File:** `src/proxy.ts`

The middleware function `proxy(request)` handles all incoming requests and enforces authentication based on route classification.

## Route Classification

| Category | Routes | Auth Required |
|----------|--------|---------------|
| PUBLIC_ROUTES | /, /about, /contact, /docs, /pricing, /legal/* | No |
| AUTH_ROUTES | /login, /register, /forgot-password, /reset-password, /verify-email | No (redirects if logged in) |
| ADMIN_LOGIN_ROUTE | /admin/login | No (redirects if already authenticated) |
| ADMIN_ROUTES | /admin/* (except /admin/login) | Yes — admin_session cookie |
| Default (user protected) | /dashboard/* and all other routes | Yes — better-auth.session_token |

## User Authentication Flow

**Proxy check** (`src/proxy.ts:178-186`):
1. Reads `better-auth.session_token` (or fallback `session`) cookie
2. Validates token format: length ≥ 32, matches `/^[a-zA-Z0-9_-]+$/`
3. Invalid format → redirect to `/login`
4. Missing cookie on protected routes → passes through (no redirect at middleware level for default routes)

**Server component check** (`src/core/admin/session.ts`):
1. `getServerSession()` reads cookie server-side
2. Performs DB lookup via Better Auth
3. Returns session or null

**Key detail:** The middleware performs lightweight format validation only. Full DB validation occurs at the server component and API layers.

## Admin Authentication Flow

**Proxy check** (`src/proxy.ts:119-161`):
1. Detects admin routes via `ADMIN_ROUTES` prefix check
2. Reads `admin_session` cookie OR `Authorization: Bearer` header
3. If no token → redirect to `/admin/login`
4. Calls `getAdminSessionFromToken(token, ipAddress, userAgent)`
5. Validates: session exists, not expired, admin record exists, admin is active
6. Any failure → redirect to `/admin/login`

**getAdminSessionFromToken** (`src/core/admin/session.ts:79-113`):
1. DB lookup by token
2. Expiry check — deletes expired session
3. Admin record lookup — checks isActive
4. Returns AdminSession or null

## Admin Login Route Special Handling

**Proxy check** (`src/proxy.ts:84-117`):
- If user has valid admin_session → redirect to `/admin` (avoid login page)
- Otherwise → allow access to `/admin/login`

## Security Headers

All responses pass through `withSecurityHeaders()` which applies headers from `src/core/security/headers.ts`.

## Credential URL Protection

**Check** (`src/proxy.ts:18-30`):
- Scans URL params for: email, password, adminKey, token, secret
- If credentials found on login routes → strips and redirects
- Logs security event via metrics

## Metrics Tracking

Every request is tracked with `metrics.increment("api.request", ...)` including method, route, and status.
