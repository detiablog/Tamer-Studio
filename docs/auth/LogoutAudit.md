# Logout Authentication Audit

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Test Summary

| Action | DB Session Deleted | Cookie Cleared | Post-Logout Auth | Result |
|--------|-------------------|----------------|-------------------|--------|
| Admin logout | ✓ | ✓ | 401 | PASS |
| User sign-out | ✓ | ✓ | Redirect to /login | PASS |

## Admin Logout Flow

### API Endpoint

**File:** `src/app/api/admin/auth/logout/route.ts`

### Steps

1. **Token extraction:** Reads `admin_session` from cookie header
   ```typescript
   const sessionMatch = cookieHeader.match(/admin_session=([^;]+)/);
   ```

2. **DB session deletion:** Calls `logoutAdminByToken(token)`
   - Looks up session by token
   - Deletes session record via `adminSessionRepository.deleteByAdminId()`
   - Logs audit event

3. **Cookie clearance:** Deletes `admin_session` cookie
   ```typescript
   response.cookies.delete("admin_session");
   ```

4. **Response:** Returns `{ success: true }`

### Post-Logout Verification

- Subsequent requests to `/admin/*` → 307 redirect to `/admin/login`
- Subsequent API calls to `/api/admin/*` → 401
- DB record confirmed deleted — no orphaned sessions

### Code Reference

**Logout function** (`src/core/admin/logout.ts:12-17`):
```typescript
export async function logoutAdminByToken(token: string): Promise<void> {
  const session = await adminSessionRepository.findByToken(token);
  if (session) {
    await adminSessionRepository.deleteByAdminId(session.adminId);
    logger.audit("Admin logged out", { sessionId: session.id });
  }
}
```

## User Logout Flow

### Mechanism

User logout is handled by Better Auth's built-in sign-out functionality.

### Steps

1. **Session deletion:** Better Auth deletes session from `session` table
2. **Cookie clearance:** `better-auth.session_token` cookie is cleared
3. **Redirect:** Client redirects to `/login`

### Post-Logout Verification

- Subsequent requests to `/dashboard/*` → 307 redirect to `/login`
- Subsequent API calls to protected endpoints → 401
- DB record confirmed deleted

## Logout Security Properties

| Property | User | Admin |
|----------|------|-------|
| DB session deleted | ✓ | ✓ |
| Cookie cleared | ✓ | ✓ |
| Audit logged | ✓ (via Better Auth) | ✓ (via logger.audit) |
| Immediate effect | ✓ | ✓ |
| No session reuse possible | ✓ | ✓ |

## Double Logout Handling

Both systems handle logout gracefully when session is already invalid:
- **Admin:** `logoutAdminByToken()` checks if session exists before deletion — no error if already gone
- **User:** Better Auth handles missing sessions gracefully

## Session Invalidation After Logout

| Scenario | Result |
|----------|--------|
| Use same cookie after logout | 401 / redirect |
| Use deleted DB session | 401 |
| Try to access protected page | 307 → login |
| Try to access protected API | 401 |
