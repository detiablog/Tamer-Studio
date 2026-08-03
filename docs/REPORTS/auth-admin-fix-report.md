# AUTH-ADMIN-FIX-01 — Fix Report

**Date:** 2026-08-03
**Sprint:** AUTH-ADMIN-FIX-01

---

## Problem

1. `/admin` was accessible without authentication
2. `/admin/login` logout page form targeted a non-existent route (`/api/auth/admin-logout`)
3. `getAdminSession()` did not wrap `cookies()` in try-catch
4. Logout API returned JSON for form POST submissions
5. `middleware.ts` needs `runtime: "nodejs"` for Node.js API support

## Root Cause

**Wrong Runtime Entry + Route Issue** — The project had `src/proxy.ts` (Next.js 16 convention) instead of `src/middleware.ts`. Both files conflict when coexisting. The logout form targeted a non-existent API route.

## Repairs Performed

### 1. Created `src/middleware.ts` (merged from proxy.ts)
- All security headers, CSRF, admin route protection, auth route handling
- Added `runtime: "nodejs"` to support Node.js `crypto` module
- Deleted `src/proxy.ts` to avoid conflict

### 2. Hardened `src/core/admin/session.ts`
- Wrapped `cookies()` call in try-catch
- Prevents unhandled exception from bypassing `redirect()` in layout

### 3. Fixed `src/app/admin/(public)/logout/_components/LogoutPageClient.tsx`
- Changed form action from `/api/auth/admin-logout` (404) to `/api/admin/auth/logout` (correct)

### 4. Modified `src/app/api/admin/auth/logout/route.ts`
- Added Content-Type detection
- JSON requests → return JSON response (for `AdminAvatarDropdown` fetch)
- Form POST requests → redirect to `/admin/login`

## Files NOT Modified

- `src/app/admin/(protected)/layout.tsx` — Already correct
- `src/components/admin/AdminLoginForm.tsx` — Already correct
- `src/components/admin/AdminSidebar.tsx` — Already correct
- `src/core/auth/auth.ts` — Better Auth untouched
