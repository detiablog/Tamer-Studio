# Session Lifecycle Report

**Date:** 2026-07-29  
**Sprint:** AUTH-03  

---

## Session Lifecycle

### Creation
1. User submits POST /api/auth/sign-in/email (or /api/auth/sign-in)
2. Better Auth validates email + password against `user` table
3. Creates session record in `session` table with:
   - id: auto-generated
   - token: 32-char alphanumeric
   - userId: references user.id
   - expiresAt: now + 7 days
   - ipAddress: from request
   - userAgent: from request
4. Sets `better-auth.session_token` cookie with:
   - httpOnly: true
   - secure: true (production)
   - sameSite: lax
   - path: /
   - maxAge: 604800 (7 days)
5. Returns token + user object

### Retrieval
1. Request includes `better-auth.session_token` cookie
2. `auth.api.getSession({ headers })` reads cookie
3. Looks up session in `session` table by token
4. Validates expiry
5. Returns user + session objects

### Validation
- `getServerSession()` → reads cookies → `auth.api.getSession()`
- `userAuthentication()` middleware → checks cookie presence → `getServerSession()`
- `requireUser()` → `getServerSession()` → throws if null

### Deletion
1. `auth.api.signOut()` clears cookie
2. Session record remains in DB (not deleted, just expired)

### Expiry
- Session expires after 7 days
- No sliding window — fixed expiry
- Expired sessions are not cleaned up automatically

---

## Test Results

| Test | Status |
|------|--------|
| Session creation on login | PASS |
| Session stored in DB | PASS |
| Session cookie set | PASS |
| Session retrieval via API | PASS |
| Session contains user data | PASS |
| Cookie persists across requests | PASS |
