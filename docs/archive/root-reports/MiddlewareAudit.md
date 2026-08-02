# Middleware Audit Report

**Date:** 2026-07-29  
**Scope:** All authentication and security middleware  

---

## 1. Next.js Middleware (middleware.ts)

**Status:** NO middleware.ts file exists at the project root.  
**Impact:** No global request interception. All auth is handled at the route handler level.

---

## 2. Custom Auth Middleware (`src/core/middleware/auth.middleware.ts`)

### `adminAuthentication(allowAnonymous?)`

| Aspect | Detail |
|--------|--------|
| Token extraction | `Authorization: Bearer` header OR `admin_session` cookie |
| Validation | `getAdminSessionFromToken()` → DB lookup |
| Populates | `ctx.state.adminSession`, `ctx.state.auditContext` |
| Error | 401 "Missing admin authentication" or "Invalid or expired admin session" |
| `allowAnonymous` | If true, returns immediately (no validation) |
| **Verified** | YES — returns 401 for invalid/missing tokens |

### `userAuthentication(allowAnonymous?)`

| Aspect | Detail |
|--------|--------|
| Token extraction | `Authorization: Bearer` header OR checks for `better-auth.session_token` cookie |
| Validation | `getServerSession()` → better-auth API |
| Populates | `ctx.state.userSession`, `ctx.state.auditContext` |
| Error | 401 "Invalid or expired user session" |
| `allowAnonymous` | If true, returns immediately |
| **Verified** | YES — returns 401 for invalid/missing sessions |

### `eitherAuthentication()`

| Aspect | Detail |
|--------|--------|
| Flow | Try admin auth first, then user auth |
| Success | Returns immediately if either succeeds |
| Failure | Returns first error encountered |
| **Issue** | Leaks admin-specific error messages to non-admin users |

### `withSecurityMiddleware(...middlewares)`

| Aspect | Detail |
|--------|--------|
| Creates | `RequestContext` with request, params, state |
| Runs | Middleware sequentially |
| First error | Stops chain, returns JSON error |
| **Verified** | YES |

---

## 3. Middleware Execution Verification

### Routes WITH middleware (tested and verified)

| Endpoint | Middleware | No Auth Result | With Valid Token | Status |
|----------|-----------|----------------|-----------------|--------|
| GET /api/admin/users | adminAuthentication | 401 | 200/401* | VERIFIED |
| GET /api/admin/me | adminAuthentication | 401 | 200/401* | VERIFIED |
| GET /api/admin/email | adminAuthentication | 401 | 200/401* | VERIFIED |
| GET /api/cms/pages | adminAuthentication | 401 | 200/401* | VERIFIED |
| GET /api/landing/sections | adminAuthentication | 401 | 200/401* | VERIFIED (FIXED) |
| GET /api/landing/sections/[key] | adminAuthentication | 401 | 200/401* | VERIFIED (FIXED) |
| GET /api/admin/localization/currencies | adminAuthentication | 401 | 200/401* | VERIFIED (FIXED) |
| GET /api/admin/localization/regions | adminAuthentication | 401 | 200/401* | VERIFIED (FIXED) |
| GET /api/analytics/dashboard | userAuthentication | 401 | 200/401* | VERIFIED (FIXED) |
| GET /api/api-keys | userAuthentication | 401 | N/A | VERIFIED |
| GET /api/billing | userAuthentication | 401 | N/A | VERIFIED |
| GET /api/media | userAuthentication | 401 | N/A | VERIFIED |
| GET /api/profile | userAuthentication | 401 | N/A | VERIFIED |

\* 401 with valid token because dev-mode login creates non-DB-persisted sessions.

### Routes WITHOUT middleware (public, verified)

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| GET /api/health | 200 | 200 | VERIFIED |
| GET /api/navigation | 200 | 200 | VERIFIED |
| GET /api/seo/sitemap | 200 | 200 | VERIFIED |
| GET /api/seo/robots | 200 | 200 | VERIFIED |
| GET /api/landing/pricing | 200 | 200 | VERIFIED |
| GET /api/commerce/plans | 200 | 200 | VERIFIED |

---

## 4. Proxy Layer (`src/proxy.ts`)

| Aspect | Detail |
|--------|--------|
| Route classification | Public, Auth, Admin, Protected |
| Admin auth (production) | Checks `admin_session` cookie via `getAdminSession()` |
| Admin auth (development) | Bypasses auth (known issue) |
| User auth | Checks `better-auth.session_token` cookie |
| Session validation | Length ≥32 + regex pattern (format only, not DB) |
| **Issue** | Dev-mode bypasses all admin auth |
| **Issue** | User session validation is format-only, not DB-backed |

---

## 5. RBAC Middleware (`src/core/admin/rbac.ts`)

| Aspect | Detail |
|--------|--------|
| Roles | `admin`, `super_admin` |
| Permission count | 25 permissions per role |
| Route→permission map | `ADMIN_ROUTE_PERMISSIONS` maps routes to required permissions |
| **Issue** | `admin` and `super_admin` have identical permissions |

---

## 6. Rate Limiting

| Component | Location | Mechanism |
|-----------|----------|-----------|
| In-memory rate limiter | `src/core/security/rate-limit.ts` | `checkInMemoryRateLimit()` — sliding window |
| Redis rate limiter | `src/core/security/ratelimit.ts` | `@upstash/ratelimit` — requires Redis |
| Admin login rate limit | `POST /api/admin/auth/login` | 5 requests per 15 minutes per IP |
| Admin session check | `getClientIdentifier()` | Extracts client IP from headers |

---

## 7. Issues Summary

| # | Component | Issue | Severity | Status |
|---|-----------|-------|----------|--------|
| 1 | proxy.ts | Dev mode bypasses all admin auth | CRITICAL | OPEN |
| 2 | proxy.ts | User session format-only validation | HIGH | OPEN |
| 3 | eitherAuthentication | Leaks admin error messages | MEDIUM | OPEN |
| 4 | proxy.ts | Dev mode logging exposes auth state | MEDIUM | OPEN |
| 5 | ratelimit.ts | Redis dependency may not be configured | LOW | DOCUMENTED |
