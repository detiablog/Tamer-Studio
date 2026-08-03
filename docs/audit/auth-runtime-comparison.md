# AUTH-RUNTIME-MAP-01 — Runtime Comparison

**Date:** 2026-08-03
**Sprint:** AUTH-RUNTIME-MAP-01

---

## Comparison: Current Runtime vs AUTH-ADMIN-01 Approved Architecture

### 1. Admin Login Component

| Aspect | AUTH-ADMIN-01 Spec | Current Code | Status |
|--------|-------------------|--------------|--------|
| Mode selector (Founder/Admin) | Radio group with Crown/UserCheck icons | Lines 185-220 in AdminLoginForm.tsx | ✅ MATCH |
| Master Key field | Conditional on Founder mode | Lines 223-261, `{mode === "founder" && ...}` | ✅ MATCH |
| Email field | Always visible | Lines 263-283 | ✅ MATCH |
| Password field | Always visible with toggle | Lines 285-315 | ✅ MATCH |
| Remember Me checkbox | Present | Lines 317-329 | ✅ MATCH |
| CSRF token | Sent via x-csrf-token header | Line 113 | ✅ MATCH |
| Error handling | Generic messages, i18n | Lines 32-39, 121-128 | ✅ MATCH |
| Success state | Checkmark + redirect message | Lines 151-168 | ✅ MATCH |
| Accessibility | ARIA attributes, focus management | Lines 57-63, 188-189, etc. | ✅ MATCH |

### 2. Admin Login Business Logic

| Aspect | AUTH-ADMIN-01 Spec | Current Code | Status |
|--------|-------------------|--------------|--------|
| adminKey parameter | Optional | `adminKey?: string` (line 11) | ✅ MATCH |
| Founder mode detection | `!!credentials.adminKey` | Line 15 | ✅ MATCH |
| Master key verification | First step in founder mode | Lines 17-32 | ✅ MATCH |
| Founder-without-key | Rejected with invalid_master_key | Lines 79-91 | ✅ MATCH |
| Password minimum | 12 characters | Line 34 | ✅ MATCH |
| Session creation | UUID, 24h expiry | Lines 112-121 | ✅ MATCH |
| Old session cleanup | Delete before create | Line 115 | ✅ MATCH |
| Audit logging | On success | Lines 124-128 | ✅ MATCH |
| Failed login recording | recordFailedLogin() | Multiple locations | ✅ MATCH |

### 3. Admin Login API Route

| Aspect | AUTH-ADMIN-01 Spec | Current Code | Status |
|--------|-------------------|--------------|--------|
| Rate limiting | 5 req/15min | Lines 11-17 | ✅ MATCH |
| Content type support | JSON + form data | Lines 19-34 | ✅ MATCH |
| adminKey optional | Not in required check | Line 36 (only email + password) | ✅ MATCH |
| Cookie setting | httpOnly, secure, sameSite: lax, 24h | Lines 61-67 | ✅ MATCH |
| Audit logging | logAdminAction() | Lines 71-79 | ✅ MATCH |

### 4. Admin Session Management

| Aspect | AUTH-ADMIN-01 Spec | Current Code | Status |
|--------|-------------------|--------------|--------|
| Type | AdminRole type | `type AdminRole = "admin" \| "founder"` | ✅ MATCH |
| Secure cookie flag | `process.env.NODE_ENV === "production"` | Line 70 | ✅ MATCH |
| Sliding window | Extend if >50% elapsed | Lines 32-36 | ✅ MATCH |
| Active check | Verify admin isActive | Lines 38-41 | ✅ MATCH |

### 5. Admin Sidebar

| Aspect | AUTH-ADMIN-01 Spec | Current Code | Status |
|--------|-------------------|--------------|--------|
| Permission field | Each nav item has permission | Lines 68-115 | ✅ MATCH |
| Filtering | useAdminPermissions().hasPermission() | Lines 165-171 | ✅ MATCH |
| Founder visibility | All items | Founder has all permissions | ✅ MATCH |
| Admin visibility | Operational only | Admin lacks system-critical perms | ✅ MATCH |

### 6. Route Protection (CRITICAL GAP)

| Aspect | AUTH-PLATFORM-LOCK-01 Spec | Current Code | Status |
|--------|--------------------------|--------------|--------|
| Middleware file | `src/middleware.ts` | DOES NOT EXIST | ❌ MISSING |
| Middleware function | `export function middleware()` | `export function proxy()` | ❌ WRONG NAME |
| Admin route protection | Middleware redirects anonymous | proxy.ts lines 127-170 | ⚠️ CODE EXISTS BUT INACTIVE |
| Auth route redirect | Middleware redirects logged-in users | proxy.ts lines 172-184 | ⚠️ CODE EXISTS BUT INACTIVE |
| User session check | Middleware validates session | proxy.ts lines 186-194 | ⚠️ CODE EXISTS BUT INACTIVE |
| Security headers | Applied by middleware | proxy.ts lines 10-24 | ⚠️ CODE EXISTS BUT INACTIVE |

### 7. Layout Guards

| Aspect | AUTH-PLATFORM-LOCK-01 Spec | Current Code | Status |
|--------|--------------------------|--------------|--------|
| Admin guard | getAdminSession() → redirect | Lines 9-13 in admin/(protected)/layout.tsx | ✅ MATCH |
| Dashboard guard | getServerSession() → redirect | Lines 12-16 in (dashboard)/layout.tsx | ✅ MATCH |
| Auth layout | Visual shell only | (auth)/layout.tsx | ✅ MATCH |

---

## Regression Analysis

### No Code Regression Detected

All AUTH-ADMIN-01 approved code is present and correct:
- AdminLoginForm.tsx has Founder/Admin mode selector
- login.ts has optional adminKey with founder-without-key rejection
- route.ts has optional adminKey validation
- session.ts has AdminRole type and secure cookie flag
- AdminSidebar.tsx has permission-based filtering

### Infrastructure Regression Detected

| Issue | Severity | Impact |
|-------|----------|--------|
| `src/middleware.ts` does not exist | P0 | Edge-level route protection INACTIVE |
| `src/proxy.ts` exports `proxy`, not `middleware` | P0 | Next.js ignores the file entirely |
| Security headers not applied at edge | P1 | Pages served without security headers from middleware |
| No credential-in-URL blocking at edge | P1 | Suspicious URLs not blocked before reaching pages |
| No localization cookie setting at edge | P2 | tamer_country cookie not set by middleware |

---

## Root Cause Analysis

### Why Middleware Is Missing

The `auth-admin-fix-audit.md` (dated 2026-08-03) documents:
> - **4 files modified**: middleware.ts (created), session.ts (hardened), LogoutPageClient.tsx (fixed), logout route.ts (form POST redirect)
> - **1 file deleted**: proxy.ts (merged into middleware.ts)

However:
1. `src/middleware.ts` was NEVER created (git history confirms)
2. `src/proxy.ts` was NEVER deleted (still exists)
3. The audit document is INACCURATE about what was actually implemented

### Why Proxy Is Not Middleware

Next.js middleware requirements:
1. File MUST be named `middleware.ts` (at project root or in `src/`)
2. Function MUST be exported as `middleware` (named export)
3. Optional `config` export for matcher

Current proxy.ts:
1. File is named `proxy.ts` ✗
2. Function is exported as `proxy` ✗
3. Config export exists ✓

Result: Next.js completely ignores `src/proxy.ts`.

---

## Summary

| Category | Status |
|----------|--------|
| Admin Login UI | ✅ AUTH-ADMIN-01 APPROVED CODE INTACT |
| Admin Login Logic | ✅ AUTH-ADMIN-01 APPROVED CODE INTACT |
| Admin Session | ✅ AUTH-ADMIN-01 APPROVED CODE INTACT |
| Admin Sidebar | ✅ AUTH-ADMIN-01 APPROVED CODE INTACT |
| User Login | ✅ INTACT |
| User Session | ✅ INTACT |
| RBAC | ✅ INTACT |
| API Protection | ✅ ACTIVE |
| Layout Guards | ✅ ACTIVE |
| Edge Middleware | ❌ INACTIVE (proxy.ts not named middleware.ts) |
