# Root Cause Analysis

**Date:** 2026-08-03
**Sprint:** AUTH-ADMIN-FIX-01

---

## Root Cause

**Category: Route Issue — Broken Logout Form + Missing Middleware Runtime Configuration**

### Primary Issues Found

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | **Logout form targets non-existent route** `/api/auth/admin-logout` (should be `/api/admin/auth/logout`) | HIGH | **FIXED** |
| 2 | **Logout API returns JSON for form POST** — user sees raw JSON instead of redirect | MEDIUM | **FIXED** |
| 3 | **`cookies()` outside try-catch in `getAdminSession()`** — potential bypass if `cookies()` throws | MEDIUM | **FIXED** |
| 4 | **`middleware.ts` requires `runtime: "nodejs"`** — default Edge Runtime doesn't support Node.js `crypto` module | HIGH | **FIXED** |

---

## Architecture Decision: `middleware.ts` vs `proxy.ts`

Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. However:

- `proxy.ts` runs in **Node.js runtime** (supports `crypto`, database, etc.)
- `middleware.ts` defaults to **Edge Runtime** (no Node.js modules)

**Decision**: Use `middleware.ts` with `runtime: "nodejs"` config to maintain the standard Next.js middleware convention while supporting Node.js APIs.

The deprecation warning is cosmetic — the functionality is identical.

---

## Runtime Chain (Final — After Repair)

### /admin (Anonymous → Redirect)

```
GET /admin
  ↓
src/middleware.ts (runtime: "nodejs")
  ↓ isAdminRoute("/admin") → true
  ↓ no admin_session cookie
redirect → /admin/login
```

### /admin (Authenticated → Dashboard)

```
GET /admin (with admin_session cookie)
  ↓
src/middleware.ts — isAdminRoute → token validation → DB check → OK
  ↓
src/app/admin/(protected)/layout.tsx → getAdminSession() → OK
  ↓
src/app/admin/(protected)/page.tsx → AdminDashboardPage
```

### /admin/login (Public)

```
GET /admin/login
  ↓
src/middleware.ts — admin login special handling
  ↓ valid session → redirect to /admin
  ↓ no session → set CSRF token → pass through
  ↓
src/app/admin/(public)/login/page.tsx → LoginPageClientContent → AdminLoginForm
```

### Logout (Form POST)

```
POST /api/admin/auth/logout (form)
  ↓
src/middleware.ts — skips /api/ routes
  ↓
route.ts → reads cookie → DB delete → cookie delete → redirect → /admin/login
```

---

## Files Modified (4)

| File | Change | Reason |
|------|--------|--------|
| `src/middleware.ts` | **CREATED** (merged from proxy.ts + added runtime config) | Edge→Node.js runtime, CSRF, security headers, admin protection |
| `src/core/admin/session.ts` | **MODIFIED** | Wrapped `cookies()` in try-catch |
| `src/app/admin/(public)/logout/_components/LogoutPageClient.tsx` | **MODIFIED** | Fixed form action URL |
| `src/app/api/admin/auth/logout/route.ts` | **MODIFIED** | Added redirect for form POST |

## Files Deleted (1)

| File | Reason |
|------|--------|
| `src/proxy.ts` | Merged into `src/middleware.ts` |

## Files NOT Modified

| File | Reason |
|------|--------|
| `src/app/admin/(protected)/layout.tsx` | Already correct |
| `src/components/admin/AdminLoginForm.tsx` | Already correct |
| `src/components/admin/AdminSidebar.tsx` | Already correct |
| `src/core/admin/login.ts` | Already correct |
| `src/core/auth/auth.ts` | Better Auth — untouched |

---

## Browser Verification Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Anonymous GET /admin | 307 → /admin/login | 307 | PASS |
| Anonymous GET /admin/users | 307 → /admin/login | 307 | PASS |
| Anonymous GET /admin/logout | 307 → /admin/login | 307 | PASS |
| Anonymous GET /admin/settings | 307 → /admin/login | 307 | PASS |
| GET /admin/login (renders) | 200 with UI | 200 + Admin Portal, Founder/Admin, Master Key, Email, Password | PASS |
| Admin login (invalid password) | 401 | 401 invalid_credentials | PASS |
| Logout form POST | Redirect to /admin/login | 307 → /admin/login | PASS |
