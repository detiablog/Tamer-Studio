# Runtime Recovery Audit

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Test Summary

| Scenario | User Response | Admin Response | Stack Trace Exposed | Result |
|----------|---------------|----------------|---------------------|--------|
| Expired session | 401 / 302 | 401 / 302 | No | PASS |
| Deleted session | 401 | 401 | No | PASS |
| Tampered cookie | 401 | 401 | No | PASS |
| Missing cookie | 401 / 302 | 401 / 302 | No | PASS |

## Expired Session Handling

### User System

- Better Auth checks `expires_at` on every session lookup
- Expired sessions return null from `getServerSession()`
- Result: 302 redirect to `/login` (pages) or 401 (APIs)

### Admin System

- `getAdminSessionFromToken()` checks `sessionRecord.expiresAt < new Date()` (`src/core/admin/session.ts:91-93`)
- Expired session is **deleted from DB** on detection
- `getAdminSession()` also checks and deletes (`src/core/admin/session.ts:21-24`)
- Result: 302 redirect to `/admin/login` (pages) or 401 (APIs)

### Verified Behavior

```
Request with expired cookie:
→ Middleware: reads cookie → getAdminSessionFromToken() → session expired
→ Session deleted from DB
→ Response: 302 redirect to /admin/login
→ No error details leaked
```

## Deleted Session Handling

### Test Procedure

1. User has valid session
2. Session record deleted from DB
3. Next request with old cookie

### Result

- DB lookup returns null
- User: 302 redirect to `/login`
- Admin: 302 redirect to `/admin/login`
- APIs: 401 response
- No stack traces or internal details exposed

## Tampered Cookie Handling

### Test Procedure

1. Valid session cookie obtained
2. Token value modified (e.g., change last character)
3. Request sent with tampered cookie

### Result

- DB lookup fails (token doesn't match any record)
- Same as missing session: 302 / 401
- No error distinguishing "invalid" vs "missing" (prevents enumeration)

## Missing Cookie Handling

### Test Procedure

- Request with no session cookie at all

### Result

- Middleware detects missing cookie
- Protected pages: 302 redirect to login
- Protected APIs: 401 response
- Public routes: normal access

## Error Handling Quality

| Property | Verified |
|----------|----------|
| No stack traces to client | ✓ |
| No internal error messages | ✓ |
| Consistent response codes | ✓ |
| Graceful degradation | ✓ |
| No information leakage | ✓ |
| Audit logging on errors | ✓ |

### Admin Session Error Handling

**File:** `src/core/admin/session.ts:49-51`

```typescript
} catch (err) {
  logger.error("Error getting admin session", err instanceof Error ? err : new Error(String(err)));
  return null;
}
```

- Catches all exceptions
- Logs to server-side logger only
- Returns null (graceful failure)
- Client sees only 401/302

## Recovery Matrix

| State | Page Request | API Request | Cookie State |
|-------|-------------|-------------|--------------|
| Valid session | 200 | 200 | Unchanged |
| Expired session | 302 → login | 401 | Deleted |
| Deleted session | 302 → login | 401 | Unchanged |
| Tampered cookie | 302 → login | 401 | Unchanged |
| Missing cookie | 302 → login | 401 | N/A |
| Inactive admin | 302 → login | 401 | Unchanged |
