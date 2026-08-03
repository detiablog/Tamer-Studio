# Authentication Runtime Map

**Date:** 2026-08-03
**Sprint:** AUTH-PLATFORM-LOCK-01

---

## Architecture Overview

```
Browser Request
    │
    ▼
┌─────────────────────────────────────────┐
│  src/middleware.ts (Node.js Runtime)    │
│  ┌─────────────────────────────────────┐│
│  │ 1. Strip credentials from URL       ││
│  │ 2. Bypass static/assets/API/*       ││
│  │ 3. Public route → passthrough       ││
│  │ 4. /admin/login → validate session  ││
│  │ 5. /admin/* → validate admin cookie ││
│  │ 6. Auth routes → redirect if logged ││
│  │ 7. Other → check user session       ││
│  │ 8. Apply security headers           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Page Routes (Server Components)        │
│  ├─ (dashboard)/layout.tsx              │
│  │   → getServerSession() → redirect    │
│  ├─ admin/(protected)/layout.tsx        │
│  │   → getAdminSession() → redirect     │
│  └─ (auth)/layout.tsx (client)          │
│      → Visual shell only                │
├─────────────────────────────────────────┤
│  API Routes (Route Handlers)            │
│  ├─ /api/auth/* → Better Auth handler   │
│  ├─ /api/auth/sign-in → Zod → auth      │
│  ├─ /api/auth/register → Zod → auth     │
│  ├─ /api/auth/sign-out → auth.signOut   │
│  ├─ /api/admin/auth/login → loginAdmin  │
│  ├─ /api/admin/auth/logout → logout     │
│  └─ /api/admin/* → HTTP middleware       │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  ├─ Better Auth (user/session tables)   │
│  └─ Custom (admin/admin_sessions tables)│
└─────────────────────────────────────────┘
```

---

## User Authentication Runtime

```
Route:      /login, /register, /forgot-password, /reset-password, /verify-email
Layout:     src/app/(auth)/layout.tsx (client, visual shell only)
Middleware:  src/middleware.ts (redirects logged-in users away from auth pages)
Session:    Better Auth (better-auth.session_token cookie)
Guard:      src/app/(dashboard)/layout.tsx → getServerSession()
```

### User Runtime Chain

```
GET /login
  → middleware.ts: if valid session → redirect /dashboard
  → (auth)/layout.tsx: visual shell
  → (auth)/login/page.tsx → LoginForm

GET /dashboard (anonymous)
  → middleware.ts: no valid session → redirect /login
  → (dashboard)/layout.tsx: getServerSession() → null → redirect /login

POST /api/auth/register
  → register/route.ts: Zod validation → rate limit → auth.handler()
  → Better Auth: create user → send verification email

POST /api/auth/sign-in
  → sign-in/route.ts: Zod validation → auth.handler()
  → Better Auth: validate credentials → create session → set cookies

POST /api/auth/sign-out
  → sign-out/route.ts: auth.api.signOut() → delete all auth cookies
```

---

## Admin Authentication Runtime

```
Route:      /admin, /admin/*
Layout:     src/app/admin/(protected)/layout.tsx
Middleware:  src/middleware.ts (validates admin_session cookie)
Session:    Custom (admin_session cookie → admin_sessions DB table)
Guard:      src/core/admin/guards.ts → requireAdmin()
RBAC:       src/core/admin/rbac.ts → ADMIN_ROLE_PERMISSIONS
```

### Admin Runtime Chain

```
GET /admin (anonymous)
  → middleware.ts: isAdminRoute → no admin_session cookie → redirect /admin/login

GET /admin/login
  → middleware.ts: valid admin session? → redirect /admin : set CSRF, pass
  → (public)/login/page.tsx → LoginPageClientContent → AdminLoginForm

POST /api/admin/auth/login (admin mode)
  → login/route.ts: rate limit → loginAdmin(email, password)
  → login.ts: verify email exists → verify password → create session
  → Set admin_session cookie (httpOnly, secure, sameSite: lax, 24h)

POST /api/admin/auth/login (founder mode)
  → login/route.ts: rate limit → loginAdmin(email, password, adminKey)
  → login.ts: verifyMasterKey(adminKey) → verify password → create session
  → Set admin_session cookie

GET /admin (authenticated)
  → middleware.ts: validate admin_session → DB check → OK → pass
  → (protected)/layout.tsx: getAdminSession() → DB check + sliding window → OK
  → (protected)/page.tsx → AdminDashboardPage

POST /api/admin/auth/logout
  → logout/route.ts: extract token → logoutAdminByToken() → delete cookie
  → JSON response (fetch) or redirect (form POST)
```

---

## Founder Authentication Runtime

```
Route:      Same as Admin
Layout:     Same as Admin
Middleware:  Same as Admin
Session:    Same as Admin (admin_session cookie)
Guard:      src/core/middleware/authz.middleware.ts → requireFounder()
RBAC:       src/core/admin/rbac.ts → ADMIN_ROLE_PERMISSIONS["founder"]
```

### Founder Runtime Chain

```
POST /api/admin/auth/login (founder mode)
  → login/route.ts: loginAdmin(email, password, adminKey)
  → login.ts: verifyMasterKey(adminKey) FIRST
  → If invalid master key → REJECT (even if email/password correct)
  → If valid → verify password → create session
  → Set admin_session cookie

Founder gets ALL permissions:
  - User-level: dashboard, workspace, project, media, production, ai, publishing, settings, billing
  - Admin operational: admin:read, admin:users, admin:workspaces, admin:billing, etc.
  - Admin system-critical: admin:ai_providers, admin:jobs, admin:queues, admin:audit_logs,
    admin:feature_flags, admin:system
```

---

## Session Lifecycle

### User Sessions (Better Auth)

| Event | Mechanism | Cookie |
|-------|-----------|--------|
| Create | `POST /api/auth/sign-in` → Better Auth | `better-auth.session_token` |
| Validate | `auth.api.getSession()` | Read from `next/headers` |
| Refresh | Better Auth internal | Auto-refreshed |
| Expire | 7 days (`expiresIn: 60*60*24*7`) | Cookie expires |
| Delete | `POST /api/auth/sign-out` | Delete all auth cookies |

### Admin Sessions (Custom)

| Event | Mechanism | Cookie |
|-------|-----------|--------|
| Create | `POST /api/admin/auth/login` → `loginAdmin()` | `admin_session` (UUID, 24h) |
| Validate (middleware) | `getAdminSessionFromToken()` | Read from request |
| Validate (layout) | `getAdminSession()` | Read from `next/headers` |
| Extend | `getAdminSession()` — sliding window | Auto-extend if >50% elapsed |
| Expire | 24 hours | DB check returns null |
| Delete | `POST /api/admin/auth/logout` | Delete cookie |

---

## Cookie Inventory

| Cookie | HttpOnly | Secure | SameSite | MaxAge | Purpose |
|--------|----------|--------|----------|--------|---------|
| `admin_session` | Yes | prod-only | lax | 24h | Admin auth token |
| `csrf_token` | Yes | conditional | lax | 1h | CSRF protection |
| `better-auth.session_token` | Set by Better Auth | Set by Better Auth | Set by Better Auth | Set by Better Auth | User auth token |
| `tamer_country` | Yes | prod-only | lax | 1 year | GeoIP detection |

---

## Middleware Layers

| Layer | File | Runtime | Scope |
|-------|------|---------|-------|
| 1. Next.js Middleware | `src/middleware.ts` | Node.js | All non-static routes |
| 2. HTTP Auth Middleware | `src/core/middleware/auth.middleware.ts` | Server | API route handlers |
| 3. HTTP Authz Middleware | `src/core/middleware/authz.middleware.ts` | Server | API route handlers |
| 4. Layout Guards | `(dashboard)/layout.tsx`, `admin/(protected)/layout.tsx` | Server | Page routes |
| 5. Route Guards | `src/core/admin/guards.ts`, `src/core/auth/session.ts` | Server | API route handlers |

---

## RBAC System

### Role Hierarchy

```
Guest (0) → User (1) → Admin (2) → Founder (3)
```

### Permission Sources

| Context | File | Roles |
|---------|------|-------|
| User RBAC | `src/core/auth/permissions.ts` | guest, user, admin, founder |
| Admin RBAC | `src/core/admin/rbac.ts` | admin, founder |

### Permission Separation

- **User permissions**: dashboard, workspace, project, media, production, ai, publishing, settings, billing
- **Admin operational**: admin:read, admin:users, admin:workspaces, admin:billing, admin:subscriptions, admin:coupons, admin:analytics, admin:email, admin:write, admin:commerce, admin:workflows, admin:pricing, admin:landing_builder, admin:stats
- **Admin system-critical (Founder-only)**: admin:ai_providers, admin:jobs, admin:queues, admin:audit_logs, admin:feature_flags, admin:system
