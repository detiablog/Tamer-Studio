# AUTH-03: Admin Session Lifecycle Audit

**Date:** 2026-07-29 | **Status:** PASS

## Session Lifecycle

```
Login → DB session created → Cookie set → Validated on each request → Logout → Session deleted → Cookie cleared
```

## Phase 1: Session Creation (Login)

| Step | Detail |
|---|---|
| Token generation | `randomUUID()` — cryptographically random UUID v4 |
| DB insert | `adminSessionRepository.create({ id, token, adminId, expiresAt })` |
| Previous sessions | `adminSessionRepository.deleteByAdminId()` — one session per admin |
| Cookie set | `admin_session` cookie with 24h `maxAge` |
| Audit log | `logAdminAction("admin.login", adminId)` |

Source: `src/core/admin/login.ts:94-103`

## Phase 2: Session Validation (Each Request)

| Step | Detail |
|---|---|
| Token extraction | From `admin_session` cookie or `Authorization: Bearer` header |
| DB lookup | `adminSessionRepository.findByToken(token)` |
| Expiry check | `sessionRecord.expiresAt < new Date()` → deletes session if expired |
| Sliding window | `getAdminSession()` extends expiry by 24h on active use |
| Admin check | `adminRepository.findById()` → verifies `isActive` |

Source: `src/core/admin/session.ts:79-113`

## Phase 3: Session Destruction (Logout)

| Step | Detail |
|---|---|
| Token extraction | From `admin_session` cookie header |
| DB delete | `logoutAdminByToken(token)` |
| Cookie clear | `response.cookies.delete("admin_session")` |

Source: `src/app/api/admin/auth/logout/route.ts:6-16`

## Session Properties

| Property | Value |
|---|---|
| Storage | `admin_sessions` DB table |
| Token type | UUID v4 |
| Expiry | 24 hours |
| Sliding window | Yes — extended on `getAdminSession()` |
| Per-admin limit | 1 (new login replaces old) |
| Dev bypass | None |
| Cookie `httpOnly` | `true` (prod) / `false` (dev) |
| Cookie `secure` | `true` (prod) / `false` (dev) |

## Test Results

| Test | Result |
|---|---|
| Login creates session + cookie | PASS |
| `/api/admin/me` works with valid cookie | PASS |
| Logout destroys session + clears cookie | PASS |
| Post-logout requests → 401 | PASS |
| Re-login creates new session → 200 | PASS |
| Session persistence across requests | PASS |

**VERDICT: PASS** — Full lifecycle verified: create → validate → destroy.
