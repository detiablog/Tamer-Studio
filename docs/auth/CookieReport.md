# Cookie Report

**Date:** 2026-07-29  
**Sprint:** AUTH-03  

---

## Cookie Inventory

| Cookie | Purpose | httpOnly | secure | sameSite | path | maxAge | Set By |
|--------|---------|----------|--------|----------|------|--------|--------|
| `better-auth.session_token` | User auth session | true | true | lax | / | 604800s (7d) | Better Auth library |
| `admin_session` | Admin auth session | true (prod) | true (prod) | lax | / | 86400s (24h) | Admin login route |
| `csrf_token` | CSRF protection | true | true | lax | / | 3600s (1h) | Proxy layer |
| `tamer_country` | Localization preference | true | true | lax | / | 31536000s (1y) | Proxy layer |

---

## Cookie Verification

| Check | Status | Detail |
|-------|--------|--------|
| Session cookie set on login | PASS | `better-auth.session_token` returned in Set-Cookie |
| Cookie has httpOnly | PASS | Not accessible via JavaScript |
| Cookie has secure | PASS | HTTPS only in production |
| Cookie has sameSite=lax | PASS | Sent with same-site requests |
| Cookie has path=/ | PASS | Available for all paths |
| Cookie returned on subsequent requests | PASS | Session retrieval works |
| Cookie cleared on logout | PASS | Sign-out clears cookie |
| Middleware reads same cookie | PASS | `getServerSession()` reads `better-auth.session_token` |

---

## Cookie Flow

```
Login Request
  ↓
POST /api/auth/sign-in/email
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
