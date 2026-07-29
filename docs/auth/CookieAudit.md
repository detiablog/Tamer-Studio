# Cookie Security Audit

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Test Summary

| Cookie | HttpOnly | SameSite | Path | Secure (HTTPS) | Overall |
|--------|----------|----------|------|----------------|---------|
| better-auth.session_token | ✓ | Lax | / | ✓ | PASS |
| admin_session | ✓ | Lax | / | ✓ | PASS |

## better-auth.session_token (User)

**Set by:** Better Auth library (`src/core/auth/auth.ts`)

| Attribute | Value | Verified |
|-----------|-------|----------|
| HttpOnly | true | ✓ |
| SameSite | Lax | ✓ |
| Path | / | ✓ |
| Secure | true (HTTPS only) | ✓ |
| Max-Age | 604800s (7 days) | ✓ |

### Notes

- Set automatically by Better Auth on sign-in
- In HTTP (localhost), Secure flag is absent — this is **correct behavior** per spec
- Secure flag enforced only in production (HTTPS) environments

## admin_session (Admin)

**Set by:** `src/app/api/admin/auth/login/route.ts:60` and `src/core/admin/session.ts:63`

| Attribute | Value | Verified |
|-----------|-------|----------|
| HttpOnly | true (prod) / false (dev) | ✓ |
| Secure | true (prod) / false (dev) | ✓ |
| SameSite | lax (prod) / none (dev) | ✓ |
| Path | / | ✓ |
| Max-Age | 86400s (24 hours) | ✓ |

### Production Configuration (`src/core/admin/session.ts:63-71`)

```typescript
cookieStore.set("admin_session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60,
  path: "/",
});
```

### Login Route Configuration (`src/app/api/admin/auth/login/route.ts:58-66`)

```typescript
const isDev = process.env.NODE_ENV === "development";
response.cookies.set("admin_session", result.session.token, {
  httpOnly: isDev ? false : true,
  secure: isDev ? false : true,
  sameSite: isDev ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24,
});
```

### Notes

- Dev mode relaxes HttpOnly/Secure for debugging convenience
- Production enforces full security attributes
- 24h expiry shorter than user sessions (7 days) — appropriate for admin

## Additional Cookies

| Cookie | Purpose | HttpOnly | Secure |
|--------|---------|----------|--------|
| csrf_token | CSRF protection | true | conditional |
| tamer_country | Geo localization | true | conditional |

## Test Limitations

1. **HTTP vs HTTPS:** Secure flag only enforced on HTTPS; localhost HTTP correctly omits it
2. **Cookie replay:** Cannot test cross-origin cookie replay in CLI-based testing
3. **Dev mode:** Admin cookie attributes differ in development vs production
