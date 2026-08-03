# AUTH-RUNTIME-MAP-01 — Active Runtime Discovery

**Date:** 2026-08-03
**Sprint:** AUTH-RUNTIME-MAP-01
**Status:** COMPLETE

---

## Executive Summary

**CRITICAL FINDING:** The Next.js middleware (`src/middleware.ts`) does NOT exist. The file `src/proxy.ts` contains all route protection logic but is NOT functioning as Next.js middleware because:

1. The file is named `proxy.ts`, not `middleware.ts`
2. The function is exported as `proxy`, not `middleware`

Next.js requires the middleware file to be named `middleware.ts` and export a function named `middleware`. Without this, **all edge-level route protection is INACTIVE**.

---

## Phase 1 — Active Runtime Discovery

### Complete Authentication Implementation Inventory

#### 1. Admin Login

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/components/admin/AdminLoginForm.tsx` | ✓ | — | `LoginPageClient.tsx` |
| `src/app/admin/(public)/login/page.tsx` | ✓ | — | Next.js routing |
| `src/app/admin/(public)/login/_components/LoginPageClient.tsx` | ✓ | — | `page.tsx` |
| `src/app/api/admin/auth/login/route.ts` | ✓ | — | HTTP POST |
| `src/core/admin/login.ts` | ✓ | — | `route.ts` |
| `src/core/admin/verify.ts` | ✓ | — | `login.ts` |
| `src/core/admin/session.ts` | ✓ | — | `login.ts`, layout, proxy |
| `src/core/admin/logout.ts` | ✓ | — | `route.ts` |
| `src/core/admin/guards.ts` | ✓ | — | API routes |
| `src/core/admin/rbac.ts` | ✓ | — | `guards.ts`, sidebar |
| `src/core/admin/types.ts` | ✓ | — | All admin files |
| `src/core/admin/admin.repository.ts` | ✓ | — | `login.ts`, `session.ts` |

**Admin Login Status:** ALL AUTH-ADMIN-01 APPROVED CODE IS INTACT.

#### 2. User Login

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/app/(auth)/login/page.tsx` | ✓ | — | Next.js routing |
| `src/features/auth/components/login-form.tsx` | ✓ | — | `page.tsx` |
| `src/features/auth/hooks/use-login.ts` | ✓ | — | `login-form.tsx` |
| `src/features/auth/schemas/login.schema.ts` | ✓ | — | `login-form.tsx` |
| `src/core/auth/client.ts` | ✓ | — | `login-form.tsx` |
| `src/core/auth/auth.ts` | ✓ | — | All auth files |
| `src/core/auth/session.ts` | ✓ | — | Layout guards, API routes |

**User Login Status:** INTACT. No regression detected.

#### 3. Registration

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/app/(auth)/register/page.tsx` | ✓ | — | Next.js routing |
| `src/features/auth/components/register-form.tsx` | ✓ | — | `page.tsx` |
| `src/features/auth/hooks/use-register.ts` | ✓ | — | `register-form.tsx` |
| `src/features/auth/schemas/register.schema.ts` | ✓ | — | `register-form.tsx` |
| `src/app/api/auth/register/route.ts` | ✓ | — | HTTP POST |

**Registration Status:** INTACT.

#### 4. Email Verification

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/app/api/auth/verify-email/route.ts` | ✓ | — | HTTP GET/POST |
| `src/app/api/auth/verify-email/resend/route.ts` | ✓ | — | HTTP POST |
| `src/app/api/auth/resend-verification/route.ts` | ✓ | — | HTTP POST |

**Email Verification Status:** INTACT.

#### 5. Session Management

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/core/auth/session.ts` (User) | ✓ | — | Layout guards, API routes |
| `src/core/admin/session.ts` (Admin) | ✓ | — | Layout guard, proxy, API routes |
| `src/core/auth/client.ts` (Client) | ✓ | — | Client-side hooks |

**Session Status:** DUAL SESSION SYSTEM INTACT. User (Better Auth, 7d) + Admin (Custom, 24h).

#### 6. Middleware / Route Protection

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/proxy.ts` | **PARTIAL** | — | NOT USED AS MIDDLEWARE |
| `src/middleware.ts` | **MISSING** | — | Should be Next.js middleware |
| `src/core/middleware/auth.middleware.ts` | ✓ | — | API routes |
| `src/core/middleware/authz.middleware.ts` | ✓ | — | API routes |
| `src/core/middleware/auth-ratelimit.ts` | ✓ | — | API routes |

**CRITICAL:** `src/proxy.ts` exports `proxy` function, not `middleware`. Next.js ignores it.

#### 7. Protected Layouts

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/app/admin/(protected)/layout.tsx` | ✓ | — | Admin pages |
| `src/app/(dashboard)/layout.tsx` | ✓ | — | Dashboard pages |
| `src/app/(auth)/layout.tsx` | ✓ | — | Auth pages |

**Layout Guards Status:** INTACT. Server-side session checks are functional.

#### 8. RBAC / Permissions

| File | Active | Legacy | Used By |
|------|--------|--------|---------|
| `src/core/auth/permissions.ts` | ✓ | — | All auth files |
| `src/core/admin/rbac.ts` | ✓ | — | Admin sidebar, guards |
| `src/components/auth/use-permissions.ts` | ✓ | — | Client-side |
| `src/components/auth/use-admin-permissions.ts` | ✓ | — | Admin sidebar |
| `src/components/auth/RoleGuard.tsx` | ✓ | — | Client-side |
| `src/components/auth/PermissionGuard.tsx` | ✓ | — | Client-side |

**RBAC Status:** INTACT. 4 roles, 76 permissions.

#### 9. Cookie Runtime

| Cookie | Active | System | Status |
|--------|--------|--------|--------|
| `admin_session` | ✓ | Custom Admin | INTACT |
| `better-auth.session_token` | ✓ | Better Auth | INTACT |
| `csrf_token` | ✓ | Custom | INTACT |
| `tamer_country` | ✓ | Custom | INTACT |

**Cookie Status:** INTACT.

#### 10. API Protection

| Route Pattern | Protection | Status |
|---------------|------------|--------|
| `/api/auth/*` | Better Auth handler | ✓ ACTIVE |
| `/api/admin/auth/login` | Rate limit + loginAdmin() | ✓ ACTIVE |
| `/api/admin/auth/logout` | logoutAdminByToken() | ✓ ACTIVE |
| `/api/admin/*` | adminAuthentication() middleware | ✓ ACTIVE |
| `/api/v1/*` | withApiAuth() (API key) | ✓ ACTIVE |

**API Protection Status:** ALL API ROUTES PROTECTED.

---

## Phase 2 — Login Component Discovery

### Admin Login Dependency Tree

```
Browser
  ↓
GET /admin/login
  ↓
src/proxy.ts (INACTIVE — not named middleware.ts)
  ↓
src/app/admin/(public)/login/page.tsx (Server Component)
  → Reads CSRF token from cookies
  → Reads error from search params
  ↓
src/app/admin/(public)/login/_components/LoginPageClient.tsx (Client Component)
  → Renders themed card with AdminLoginForm
  → Language switcher, theme toggle
  ↓
src/components/admin/AdminLoginForm.tsx (Client Component)
  → Founder/Admin mode selector (radio group)
  → Dynamic form fields:
    - Admin mode: Email + Password
    - Founder mode: Email + Password + Master Key
  → CSRF token in x-csrf-token header
  ↓
POST /api/admin/auth/login
  ↓
src/app/api/admin/auth/login/route.ts (Route Handler)
  → Rate limit (5 req/15min)
  → Parse JSON or form data
  ↓
src/core/admin/login.ts → loginAdmin()
  → Founder mode: verifyMasterKey() → verifyPassword()
  → Admin mode: skip master key → verifyPassword()
  → Create session (UUID, 24h)
  → Record failed login if applicable
  ↓
Set admin_session cookie (httpOnly, secure, sameSite: lax, 24h)
  ↓
Redirect to /admin
```

### User Login Dependency Tree

```
Browser
  ↓
GET /login
  ↓
src/proxy.ts (INACTIVE — not named middleware.ts)
  ↓
src/app/(auth)/layout.tsx (Client Component — visual shell)
  ↓
src/app/(auth)/login/page.tsx (Client Component)
  ↓
src/features/auth/components/login-form.tsx (Client Component)
  → react-hook-form + Zod validation
  → Email + Password + Remember Me
  ↓
authClient.signIn.email() (Better Auth React Client)
  ↓
POST /api/auth/[...all] (Better Auth catch-all)
  ↓
src/core/auth/auth.ts → betterAuth handler
  → Validate credentials
  → Create session (7 days)
  → Set better-auth.session_token cookie
  ↓
Redirect to /dashboard
```

---

## Phase 3 — Runtime Comparison

### Current Runtime vs AUTH-ADMIN-01 Approved

| Component | AUTH-ADMIN-01 Expected | Current State | Match |
|-----------|----------------------|---------------|-------|
| AdminLoginForm | Founder/Admin mode selector | Founder/Admin mode selector | ✓ MATCH |
| Master Key field | Appears only in Founder mode | Appears only in Founder mode | ✓ MATCH |
| loginAdmin() | adminKey optional | adminKey optional | ✓ MATCH |
| Founder-without-key | Rejected | Rejected (line 79-91) | ✓ MATCH |
| route.ts | adminKey optional in validation | adminKey optional | ✓ MATCH |
| session.ts | AdminRole type | AdminRole type | ✓ MATCH |
| session.ts | secure: process.env.NODE_ENV | secure: process.env.NODE_ENV | ✓ MATCH |
| AdminSidebar | Permission-based filtering | Permission-based filtering | ✓ MATCH |
| LoginPageClient | Professional layout with ARIA | Professional layout with ARIA | ✓ MATCH |

**AUTH-ADMIN-01 CODE STATUS: ALL APPROVED CODE IS INTACT. NO REVERSION DETECTED IN APPLICATION CODE.**

### Critical Gap: Middleware

| Component | AUTH-PLATFORM-LOCK-01 Expected | Current State | Match |
|-----------|-------------------------------|---------------|-------|
| `src/middleware.ts` | Exists, exports `middleware` | DOES NOT EXIST | ✗ MISSING |
| `src/proxy.ts` | Should be deleted (merged into middleware.ts) | Still exists, exports `proxy` | ✗ LEGACY |

---

## Phase 4 — Route Protection Discovery

### Active Protection Layers

```
Layer 1: Next.js Middleware (EDGE)
  src/middleware.ts → DOES NOT EXIST
  src/proxy.ts → EXISTS but NOT FUNCTIONING as middleware
  STATUS: ❌ INACTIVE

Layer 2: Layout Guards (SERVER)
  src/app/admin/(protected)/layout.tsx → getAdminSession() → redirect
  src/app/(dashboard)/layout.tsx → getServerSession() → redirect
  STATUS: ✅ ACTIVE

Layer 3: HTTP Auth Middleware (SERVER)
  src/core/middleware/auth.middleware.ts → adminAuthentication(), userAuthentication()
  STATUS: ✅ ACTIVE (API routes only)

Layer 4: HTTP Authz Middleware (SERVER)
  src/core/middleware/authz.middleware.ts → requireAdminPermission(), requireUserPermission()
  STATUS: ✅ ACTIVE (API routes only)

Layer 5: Route Guards (SERVER)
  src/core/admin/guards.ts → requireAdmin(), requireAdminPermission()
  src/core/auth/session.ts → requireUser(), requireRole(), requirePermission()
  STATUS: ✅ ACTIVE (API routes only)
```

### Missing Layer Impact

| Route | Layer 1 (Middleware) | Layer 2 (Layout) | Net Protection |
|-------|---------------------|-------------------|----------------|
| /admin (anonymous) | ❌ No redirect | ✅ Layout redirects | ⚠️ Delayed redirect |
| /admin/login (authenticated) | ❌ No redirect | N/A (public) | ⚠️ No redirect away |
| /dashboard (anonymous) | ❌ No redirect | ✅ Layout redirects | ⚠️ Delayed redirect |
| /login (authenticated) | ❌ No redirect | N/A (public) | ⚠️ No redirect away |
| /api/admin/* | N/A | N/A | ✅ HTTP middleware active |
| /api/auth/* | N/A | N/A | ✅ Better Auth handler |

---

## Phase 5 — Session Discovery

### User Session Runtime

```
Cookie: better-auth.session_token
Library: Better Auth v1.6.23
Expiry: 7 days
Validation: auth.api.getSession({ headers })
Layout Guard: (dashboard)/layout.tsx → getServerSession()
API Guard: auth.middleware.ts → userAuthentication()
Client: authClient.useSession()
```

### Admin Session Runtime

```
Cookie: admin_session
Library: Custom (UUID token, DB-backed)
Expiry: 24 hours (sliding window)
Validation: adminSessionRepository.findByToken()
Layout Guard: admin/(protected)/layout.tsx → getAdminSession()
API Guard: auth.middleware.ts → adminAuthentication()
Proxy Guard: src/proxy.ts → getAdminSessionFromToken() [INACTIVE]
```

### Session Consistency

| Check | Status |
|-------|--------|
| Layout and API use same session runtime? | ✓ YES (both use getAdminSession/adminAuthentication) |
| Cookie names consistent? | ✓ YES (admin_session, better-auth.session_token) |
| Expiry consistent? | ✓ YES (24h admin, 7d user) |
| Sliding window working? | ✓ YES (getAdminSession extends if >50% elapsed) |

---

## Deliverable: Complete Runtime Inventory

### File Count Summary

| Category | Files | Status |
|----------|-------|--------|
| Admin Auth Core | 12 | ✓ ALL ACTIVE |
| User Auth Core | 8 | ✓ ALL ACTIVE |
| Auth Feature | 12 | ✓ ALL ACTIVE |
| Auth Guards | 6 | ✓ ALL ACTIVE |
| Middleware (HTTP) | 3 | ✓ ALL ACTIVE |
| Middleware (Edge) | 1 | ❌ INACTIVE (proxy.ts) |
| Protected Layouts | 3 | ✓ ALL ACTIVE |
| API Routes (Auth) | 13 | ✓ ALL ACTIVE |
| API Routes (Admin) | 2 | ✓ ALL ACTIVE |
| DB Schema | 3 | ✓ ALL ACTIVE |
| **TOTAL** | **63** | **62 ACTIVE, 1 INACTIVE** |

### Single Source of Truth

| Concern | Source File | Status |
|---------|-------------|--------|
| User Auth Config | `src/core/auth/auth.ts` | ✓ ACTIVE |
| User Session | `src/core/auth/session.ts` | ✓ ACTIVE |
| User Permissions | `src/core/auth/permissions.ts` | ✓ ACTIVE |
| Admin Auth Logic | `src/core/admin/login.ts` | ✓ ACTIVE |
| Admin Session | `src/core/admin/session.ts` | ✓ ACTIVE |
| Admin RBAC | `src/core/admin/rbac.ts` | ✓ ACTIVE |
| Master Key Verify | `src/core/admin/verify.ts` | ✓ ACTIVE |
| Edge Protection | `src/middleware.ts` | ❌ MISSING |
