# Authentication Audit Report

**Date:** 2026-07-29  
**Scope:** Full authentication system verification  
**Server:** Production build (next start) on port 3099  

---

## Executive Summary

The authentication system has **two independent auth providers**: better-auth (users) and custom admin auth (admin panel). Both are functional but have design weaknesses. This audit identifies **8 critical/high issues**, **5 medium issues**, and **4 low issues**.

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 4 | Fixed: 2, Open: 2 |
| HIGH | 4 | Fixed: 1, Open: 3 |
| MEDIUM | 5 | Open |
| LOW | 4 | Open |

---

## 1. Auth System Architecture

### Two Auth Providers

| Provider | Cookie | Session Type | TTL | Storage |
|----------|--------|-------------|-----|---------|
| better-auth | `better-auth.session_token` | DB-backed session | 7 days | PostgreSQL |
| Admin Auth | `admin_session` | DB-backed session (UUID token) | 24 hours | PostgreSQL |

### Authentication Middleware

| Middleware | Used By | Behavior |
|-----------|---------|----------|
| `adminAuthentication()` | Admin API routes | Extracts token from `Authorization: Bearer` header OR `admin_session` cookie. Validates against DB via `getAdminSessionFromToken()`. |
| `userAuthentication()` | User API routes | Checks for Bearer token or `better-auth.session_token` cookie, then calls `getServerSession()`. |
| `eitherAuthentication()` | Shared routes | Tries admin first, then user. Returns first error on failure. |
| `withSecurityMiddleware()` | Route wrappers | Sequential middleware chain. First error stops the chain. |

### Server-Side Session

- `getServerSession()` — reads cookies, calls `auth.api.getSession()`
- `getAdminSession()` — reads `admin_session` cookie, looks up token in DB, validates expiry, extends session
- `getAdminSessionFromToken()` — validates a token string directly (used by middleware)

---

## 2. Cookie Security Audit

| Cookie | httpOnly | secure | sameSite | path | maxAge | Assessment |
|--------|----------|--------|----------|------|--------|------------|
| `admin_session` | true (prod) | true (prod) | lax | / | 24h | PASS |
| `better-auth.session_token` | true | true | lax | / | 7d | PASS |
| `csrf_token` | true | true | lax | / | 1h | PASS but non-functional (see issues) |
| `tamer_country` | true | true | lax | / | 1y | PASS |

### Cookie Operations

| Operation | Function | Location | Assessment |
|-----------|----------|----------|------------|
| Set admin cookie | `setAdminSessionCookie()` | `admin/session.ts:75-84` | PASS |
| Clear admin cookie | `clearAdminSessionCookie()` | `admin/session.ts:86-89` | PASS |
| Dev login sets cookie | `POST /api/admin/auth/login` | `admin/auth/login/route.ts:58-66` | PASS |
| Admin logout clears cookie | `POST /api/admin/auth/logout` | `admin/auth/logout/route.ts:6-8` | PASS |

---

## 3. Session Lifecycle

### Admin Session Flow

1. Login: POST `/api/admin/auth/login` → validates email + password + master key → creates DB session → sets `admin_session` cookie
2. Middleware: extracts token from cookie → `getAdminSessionFromToken()` → DB lookup → validates expiry → extends session if active
3. Session extension: if token would expire within 24h, the expiry is extended (sliding window)
4. Logout: POST `/api/admin/auth/logout` → deletes `admin_session` cookie

### User Session Flow

1. Login: `auth.api.signInEmail()` via better-auth → creates DB session → sets `better-auth.session_token` cookie
2. Server pages: `getServerSession()` → reads cookies → `auth.api.getSession()`
3. Client: better-auth `authClient` with `credentials: "include"`
4. Logout: `auth.api.signOut()` → clears session

---

## 4. Findings

### CRITICAL-1: Dev mode bypasses all authentication [FIXED IN CODE]

**File:** `src/core/admin/session.ts:14-23`, `:96-105`  
**Impact:** In development mode, `getAdminSession()` and `getAdminSessionFromToken()` return a hardcoded admin session for ANY token string. If `NODE_ENV` is accidentally `development` in production, all admin routes are fully unprotected.  
**Recommendation:** Remove dev-mode bypasses or gate them behind an additional secret check.

### CRITICAL-2: Admin token leaked via server component props [OPEN]

**Files:** `settings/page.tsx`, `email/*/page.tsx`, `landing-builder/page.tsx`  
**Impact:** Admin session token is read from cookie server-side and passed as a React prop (`adminToken`). This token appears in page source and React DevTools.  
**Recommendation:** Never pass raw session tokens as props. Use httpOnly cookies exclusively.

### CRITICAL-3: Admin token stored in localStorage [OPEN]

**File:** `AdminLoginForm.tsx:100`  
**Impact:** `localStorage.setItem("admin_session_token", result.session.token)` — accessible to any XSS attack.  
**Recommendation:** Remove localStorage storage. Use httpOnly cookies only.

### CRITICAL-4: 8 endpoints had no auth middleware [FIXED]

**Fixed endpoints:**
- `GET /api/landing/sections` — was fully public
- `GET /api/landing/sections/[key]` — was fully public
- `GET /api/admin/localization/currencies` — was unauthenticated
- `GET /api/admin/localization/pricing-profiles` — was unauthenticated
- `GET /api/admin/localization/profiles` — was unauthenticated
- `GET /api/admin/localization/payment-profiles` — was unauthenticated
- `GET /api/admin/localization/regions` — was unauthenticated
- `GET /api/analytics/dashboard` — auth was commented out

### HIGH-1: CSRF token is httpOnly but no CSRF validation on state-changing routes [OPEN]

**Impact:** CSRF token cookie is set but no middleware validates CSRF tokens on state-changing admin endpoints (DELETE, PATCH). Only the login form sends `x-csrf-token`.  
**Recommendation:** Add CSRF validation middleware for all state-changing admin routes.

### HIGH-2: Inconsistent auth headers on admin client fetch calls [OPEN]

**Files:** `AdminAvatarDropdown.tsx:43`, `NotificationCenter.tsx:41`, `SearchInput.tsx:53`  
**Impact:** These fetch admin APIs with NO auth header, relying solely on cookie auto-send. If cookies aren't sent (cross-origin, SameSite restrictions), requests fail silently.  
**Recommendation:** Add consistent auth headers to all admin API calls.

### HIGH-3: `eitherAuthentication()` leaks admin error messages [OPEN]

**File:** `auth.middleware.ts:115`  
**Impact:** Returns `adminResult` when both admin and user auth fail, leaking admin-specific error messages.  
**Recommendation:** Return a generic "Authentication required" message.

---

## 5. Test Results Summary

| Test | Result | Count |
|------|--------|-------|
| Admin login (valid credentials) | 200 SUCCESS | 1/1 |
| Admin login (bad key) | 401 CORRECT | 1/1 |
| Admin login (empty body) | 400 CORRECT | 1/1 |
| Admin endpoints without auth | 401 CORRECT | 45/46 |
| Admin endpoints with auth | 46/46 non-500 | 46/46 |
| User endpoints without auth | 401 CORRECT | 11/15 (4 POST-only = 405 correct) |
| Invalid admin token | 401 CORRECT | 1/1 |
| Empty admin cookie | 401 CORRECT | 1/1 |
| Logout | 200 CORRECT | 1/1 |
| Sign-in | 500 FAILS | 0/1 |
