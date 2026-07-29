# Cookie Verification

**Date:** 2026-07-29
**Sprint:** AUTH-02
**Status:** PASS

---

## Cookie Details

| Property | Value |
|----------|-------|
| Name | better-auth.session_token |
| HttpOnly | true |
| Secure | true (production) |
| SameSite | lax |
| Path | / |
| Max-Age | 604800s (7 days) |

## Cookie Verification

| Check | Status |
|-------|--------|
| Cookie set on login (Set-Cookie header) | PASS |
| Cookie has HttpOnly flag | PASS |
| Cookie has Secure flag | PASS |
| Cookie has SameSite=Lax | PASS |
| Cookie has Path=/ | PASS |
| Cookie not accessible via JavaScript | PASS |
| Cookie cleared on logout | PASS |

## Cookie Flow

```
Login Request
  ↓
POST /api/auth/sign-in
  ↓
Better Auth creates session in DB
  ↓
Sets Set-Cookie: better-auth.session_token=xxx; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
  ↓
Browser stores cookie
  ↓
Subsequent requests include Cookie: better-auth.session_token=xxx
  ↓
Middleware reads cookie → validates session → populates ctx.state.userSession
```

## Node.js Test Limitation

The Node.js http client does not automatically persist Set-Cookie headers. Manual cookie extraction from the response header is required for testing. Browser handles this automatically.

## Other Cookies in Project

| Cookie | Purpose | Set By |
|--------|---------|--------|
| better-auth.session_token | User auth session | Better Auth |
| session | Legacy session fallback | Proxy layer |
| admin_session | Admin auth session | Admin login route |
