# AUTH-03: Admin Middleware Audit

**Date:** 2026-07-29 | **Status:** PASS

## Two-Layer Protection Model

| Layer | File | Scope | On Failure |
|---|---|---|---|
| Layer 1: Proxy | `src/proxy.ts` | Page routes (`/admin/*`) | 307/302 → `/admin/login` |
| Layer 2: API middleware | `adminAuthentication()` | API routes (`/api/admin/*`) | 401 JSON response |

## Layer 1: proxy.ts (Route-Level)

```
Request → proxy.ts
  ├─ Is /admin/login? → Check session, redirect to /admin if valid, allow if not
  ├─ Is /admin/* (not login)?
  │    ├─ Extract token from cookie or Bearer header
  │    ├─ No token? → 307 redirect to /admin/login
  │    ├─ getAdminSessionFromToken() → DB lookup
  │    ├─ No session or expired? → 307 redirect to /admin/login
  │    ├─ adminRepository.findById() → isActive check
  │    └─ Invalid admin? → 307 redirect to /admin/login
  └─ Pass through
```

- Accepts both `admin_session` cookie and `Authorization: Bearer` header
- Checks `admin.isActive` after session validation
- Returns security headers on all responses

## Layer 2: adminAuthentication() (API-Level)

```
API Request → adminAuthentication() middleware
  ├─ Extract token from cookie or Bearer header
  ├─ No token? → 401
  ├─ getAdminSessionFromToken() → DB lookup
  ├─ No session? → 401
  └─ Attach AdminSession to request context
```

- Used by all `/api/admin/*` routes (except `/api/admin/auth/*`)
- Returns `401 { error: "Unauthorized" }`

## Token Validation Flow

1. `getAdminSessionFromToken(token)` queries `adminSessionRepository.findByToken()`
2. Checks `sessionRecord.expiresAt < new Date()` → deletes if expired
3. `adminRepository.findById()` verifies admin exists and `isActive`
4. Returns `AdminSession` with `id`, `token`, `adminId`, `role`, `expiresAt`

## Test Results

| Test | Result |
|---|---|
| Fake token → 401 | PASS |
| Empty token → 401 | PASS |
| No cookie → redirect (pages) / 401 (APIs) | PASS |
| Valid token → 200 | PASS |

**VERDICT: PASS** — Both layers correctly enforce authentication.
