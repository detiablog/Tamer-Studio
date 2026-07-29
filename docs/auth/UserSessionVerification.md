# User Session Verification

**Date:** 2026-07-29
**Sprint:** AUTH-02
**Status:** COMPLETE

---

## Session Lifecycle

```
Login succeeds
  → Better Auth creates session record
  → Session stored in session table (token, user_id, expires_at)
  → Set-Cookie header sent to client
  → Browser stores cookie

Logout requested
  → POST /api/auth/sign-out
  → auth.api.signOut() destroys session in DB
  → Cookie deleted from response
  → Client session invalidated

Re-login
  → New session created in DB
  → New cookie set
  → New token returned
```

## Session Verification

| Check | Status |
|-------|--------|
| Session created on login | PASS |
| Session stored in DB | PASS |
| Cookie set via Set-Cookie | PASS |
| Session token is 32-char alphanumeric | PASS |
| Session linked to correct user_id | PASS |
| Session expires after 7 days | PASS |
| Logout destroys session in DB | PASS |
| Logout clears cookie | PASS |
| Re-login creates new session | PASS |
| Re-login new token differs from old | PASS |

## Session Storage

| Location | Status |
|----------|--------|
| PostgreSQL session table | YES |
| HTTP cookie (better-auth.session_token) | YES |

## Logout Behavior

| Step | Action |
|------|--------|
| 1 | Client sends POST /api/auth/sign-out |
| 2 | auth.api.signOut() called |
| 3 | Session record deleted from DB |
| 4 | cookies.delete("session") |
| 5 | cookies.delete("auth_session") |
| 6 | cookies.delete("admin_session") |
| 7 | Response 200: { success: true, message: "Signed out successfully" } |
