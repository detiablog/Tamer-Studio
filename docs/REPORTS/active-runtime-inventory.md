# AUTH-RUNTIME-MAP-01 — Active Runtime Inventory

**Date:** 2026-08-03
**Sprint:** AUTH-RUNTIME-MAP-01

---

## Complete Authentication Runtime Inventory

### 1. Admin Authentication

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Login Form | `src/components/admin/AdminLoginForm.tsx` | ✅ ACTIVE | Founder/Admin mode selector |
| Login Page | `src/app/admin/(public)/login/page.tsx` | ✅ ACTIVE | Server component |
| Login Client | `src/app/admin/(public)/login/_components/LoginPageClient.tsx` | ✅ ACTIVE | Themed wrapper |
| Login API | `src/app/api/admin/auth/login/route.ts` | ✅ ACTIVE | Rate limited, dual content-type |
| Login Logic | `src/core/admin/login.ts` | ✅ ACTIVE | Founder + Admin flows |
| Master Key Verify | `src/core/admin/verify.ts` | ✅ ACTIVE | scrypt + SHA256 |
| Session Mgmt | `src/core/admin/session.ts` | ✅ ACTIVE | AdminRole type, sliding window |
| Logout Logic | `src/core/admin/logout.ts` | ✅ ACTIVE | Token-based cleanup |
| Logout API | `src/app/api/admin/auth/logout/route.ts` | ✅ ACTIVE | Cookie + DB cleanup |
| Logout Page | `src/app/admin/(public)/logout/page.tsx` | ✅ ACTIVE | Server action |
| Guards | `src/core/admin/guards.ts` | ✅ ACTIVE | requireAdmin, requireAdminPermission |
| RBAC | `src/core/admin/rbac.ts` | ✅ ACTIVE | Route + role permissions |
| Types | `src/core/admin/types.ts` | ✅ ACTIVE | AdminRole, AdminSession |
| Repository | `src/core/admin/admin.repository.ts` | ✅ ACTIVE | DB queries |
| Barrel Export | `src/core/admin/index.ts` | ✅ ACTIVE | Re-exports login |

### 2. User Authentication

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Login Page | `src/app/(auth)/login/page.tsx` | ✅ ACTIVE | Client component |
| Login Form | `src/features/auth/components/login-form.tsx` | ✅ ACTIVE | react-hook-form + Zod |
| Login Hook | `src/features/auth/hooks/use-login.ts` | ✅ ACTIVE | authClient wrapper |
| Login Schema | `src/features/auth/schemas/login.schema.ts` | ✅ ACTIVE | Email + password (min 12) |
| Register Page | `src/app/(auth)/register/page.tsx` | ✅ ACTIVE | Client component |
| Register Form | `src/features/auth/components/register-form.tsx` | ✅ ACTIVE | Full registration flow |
| Register Hook | `src/features/auth/hooks/use-register.ts` | ✅ ACTIVE | authClient wrapper |
| Register Schema | `src/features/auth/schemas/register.schema.ts` | ✅ ACTIVE | Name + email + password |
| Forgot Password | `src/app/(auth)/forgot-password/page.tsx` | ✅ ACTIVE | Client component |
| Forgot Form | `src/features/auth/components/forgot-password-form.tsx` | ✅ ACTIVE | Email submission |
| Reset Password | `src/app/(auth)/reset-password/page.tsx` | ✅ ACTIVE | Token validation |
| Reset Form | `src/features/auth/components/reset-password-form.tsx` | ✅ ACTIVE | New password entry |
| 2FA Page | `src/app/(auth)/2fa/page.tsx` | ✅ ACTIVE | TOTP verification |
| 2FA Client | `src/app/(auth)/2fa/pageClient.tsx` | ✅ ACTIVE | Code submission |
| Password Strength | `src/features/auth/lib/password-strength.ts` | ✅ ACTIVE | 5-requirement check |
| Strength Meter | `src/features/auth/components/password-strength-meter.tsx` | ✅ ACTIVE | Visual indicator |
| Auth Types | `src/features/auth/types.ts` | ✅ ACTIVE | LoginSchema, RegisterSchema |
| Barrel Export | `src/features/auth/index.ts` | ✅ ACTIVE | Re-exports login, register |

### 3. Core Auth Runtime

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Better Auth Config | `src/core/auth/auth.ts` | ✅ ACTIVE | betterAuth() config |
| Auth Client | `src/core/auth/client.ts` | ✅ ACTIVE | createAuthClient() |
| Session Mgmt | `src/core/auth/session.ts` | ✅ ACTIVE | getServerSession, requireUser |
| Permissions | `src/core/auth/permissions.ts` | ✅ ACTIVE | 4 roles, 76 permissions |
| Auth Types | `src/core/auth/types.ts` | ✅ ACTIVE | UserSession interface |
| Auth Errors | `src/core/auth/errors.ts` | ✅ ACTIVE | Re-exports error classes |
| Auth Events | `src/core/auth/events.ts` | ✅ ACTIVE | Failed login tracking |
| Events Repo | `src/core/auth/auth-events.repository.ts` | ✅ ACTIVE | DB operations |
| TOTP | `src/core/auth/totp.ts` | ✅ ACTIVE | 2FA implementation |
| Barrel Export | `src/core/auth/index.ts` | ✅ ACTIVE | Re-exports all + handler |

### 4. Middleware / Route Protection

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Edge Middleware | `src/middleware.ts` | ❌ MISSING | Should exist |
| Proxy (Legacy) | `src/proxy.ts` | ⚠️ INACTIVE | Not named middleware.ts |
| HTTP Auth | `src/core/middleware/auth.middleware.ts` | ✅ ACTIVE | API routes only |
| HTTP Authz | `src/core/middleware/authz.middleware.ts` | ✅ ACTIVE | API routes only |
| Rate Limit | `src/core/middleware/auth-ratelimit.ts` | ✅ ACTIVE | Auth endpoints |
| CSRF | `src/core/middleware/csrf.middleware.ts` | ✅ ACTIVE | Admin login |

### 5. Auth Guard Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| RoleGuard | `src/components/auth/RoleGuard.tsx` | ✅ ACTIVE | Client-side role check |
| PermissionGuard | `src/components/auth/PermissionGuard.tsx` | ✅ ACTIVE | Client-side perm check |
| usePermissions | `src/components/auth/use-permissions.ts` | ✅ ACTIVE | Client hook |
| useAdminPermissions | `src/components/auth/use-admin-permissions.ts` | ✅ ACTIVE | Fetches /api/admin/me |
| LogoutButton | `src/components/auth/logout-button.tsx` | ✅ ACTIVE | Client-side logout |

### 6. Protected Layouts

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Admin Layout | `src/app/admin/(protected)/layout.tsx` | ✅ ACTIVE | getAdminSession() guard |
| Dashboard Layout | `src/app/(dashboard)/layout.tsx` | ✅ ACTIVE | getServerSession() guard |
| Auth Layout | `src/app/(auth)/layout.tsx` | ✅ ACTIVE | Visual shell only |

### 7. API Routes

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Auth Catch-All | `src/app/api/auth/[...all]/route.ts` | ✅ ACTIVE | Better Auth handler |
| Sign-In | `src/app/api/auth/sign-in/route.ts` | ✅ ACTIVE | Zod + auth.handler() |
| Sign-Out | `src/app/api/auth/sign-out/route.ts` | ✅ ACTIVE | Clears all cookies |
| Register | `src/app/api/auth/register/route.ts` | ✅ ACTIVE | Full registration |
| Forgot Password | `src/app/api/auth/forgot-password/route.ts` | ✅ ACTIVE | Email reset link |
| Reset Password | `src/app/api/auth/reset-password/route.ts` | ✅ ACTIVE | Token validation |
| Reset Validate | `src/app/api/auth/reset-password/validate/route.ts` | ✅ ACTIVE | GET endpoint |
| Verify Email | `src/app/api/auth/verify-email/route.ts` | ✅ ACTIVE | GET + POST |
| Resend Verify | `src/app/api/auth/verify-email/resend/route.ts` | ✅ ACTIVE | With cooldown |
| Resend Verify Alt | `src/app/api/auth/resend-verification/route.ts` | ✅ ACTIVE | Rate limited |
| 2FA Challenge | `src/app/api/auth/2fa/challenge/route.ts` | ✅ ACTIVE | TOTP verification |
| Admin Login | `src/app/api/admin/auth/login/route.ts` | ✅ ACTIVE | Rate limited |
| Admin Logout | `src/app/api/admin/auth/logout/route.ts` | ✅ ACTIVE | Cookie + DB |

### 8. Security Infrastructure

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Error Classes | `src/core/errors/auth-error.ts` | ✅ ACTIVE | AuthError hierarchy |
| Crypto | `src/core/security/crypto.ts` | ✅ ACTIVE | verifySecret |
| Hash | `src/core/security/hash.ts` | ✅ ACTIVE | bcrypt password hashing |
| CSRF | `src/core/security/csrf.ts` | ✅ ACTIVE | Token generation |
| Rate Limit | `src/core/security/rate-limit.ts` | ✅ ACTIVE | In-memory limiter |
| Headers | `src/core/security/headers.ts` | ✅ ACTIVE | Security headers |

### 9. Database Schema

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Auth Schema | `src/lib/db/schema/auth.ts` | ✅ ACTIVE | user, session, account, verification |
| Auth Events | `src/lib/db/schema/auth-events.ts` | ✅ ACTIVE | failedLoginAttempt |
| Admin Schema | `src/lib/db/schema/admin.ts` | ✅ ACTIVE | admin, adminSession |
| Security Schema | `src/lib/db/schema/security.ts` | ✅ ACTIVE | secSession |

---

## Summary Statistics

| Category | Total | Active | Inactive/Missing |
|----------|-------|--------|------------------|
| Admin Auth | 15 | 15 | 0 |
| User Auth | 18 | 18 | 0 |
| Core Auth | 10 | 10 | 0 |
| Middleware | 6 | 4 | 2 (proxy.ts inactive, middleware.ts missing) |
| Guards | 5 | 5 | 0 |
| Layouts | 3 | 3 | 0 |
| API Routes | 13 | 13 | 0 |
| Security | 6 | 6 | 0 |
| DB Schema | 4 | 4 | 0 |
| **TOTAL** | **80** | **78** | **2** |
