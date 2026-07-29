# Server Component Authentication

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Overview

Server components in Tamer Studio authenticate users via database-backed session lookups. No manual cookie parsing occurs — all session validation uses dedicated helper functions.

## User Server Authentication

### getServerSession()

**Used by:** User dashboard server components

**Flow:**
1. Reads `better-auth.session_token` from cookies via `next/headers`
2. Performs DB lookup through Better Auth adapter
3. Returns session object with user data or null

**Implementation:** Better Auth library handles all session validation internally.

### Where Used

- User dashboard page components
- Server-side data fetching in layout files
- API route authentication checks

### Key Properties

| Property | Value |
|----------|-------|
| Cookie source | `better-auth.session_token` |
| DB table | `session` |
| Lookup method | Better Auth adapter |
| Returns | Session with user data or null |
| Error handling | Returns null (no exceptions to client) |

## Admin Server Authentication

### getAdminSession()

**File:** `src/core/admin/session.ts:6-53`

**Flow:**
1. Reads `admin_session` cookie via `cookies()` from `next/headers`
2. DB lookup via `adminSessionRepository.findByToken(token)`
3. Expiry check — deletes expired sessions
4. Admin record lookup via `adminRepository.findById(adminId)`
5. Active status check
6. Returns `AdminSession` or null

### AdminSession Type

```typescript
{
  id: string;
  token: string;
  adminId: string;
  role: "admin" | "super_admin";
  expiresAt: Date;
  createdAt: Date;
}
```

### Session Sliding

`getAdminSession()` implements session sliding (`src/core/admin/session.ts:27-33`):
- If session has less than 24h remaining, extends expiry
- Prevents session expiry during active use
- Creates new record with updated expiry

### requireAdminSession()

**File:** `src/core/admin/session.ts:55-61`

Wraps `getAdminSession()` and throws if unauthorized. Used by admin API routes and server components.

## Comparison

| Aspect | User | Admin |
|--------|------|-------|
| Cookie name | better-auth.session_token | admin_session |
| Session table | session | admin_session |
| Lookup function | Better Auth adapter | getAdminSession() |
| Expiry | 7 days | 24 hours |
| Session sliding | No | Yes |
| Token format | 32+ char string | UUID |
| Error on invalid | Returns null | Returns null |
| Manual cookie parsing | No | No |

## Security Properties

1. **No manual parsing:** Both systems use framework-provided cookie access (`next/headers`)
2. **DB-backed:** All session validation queries the database
3. **Expiry enforced:** Expired sessions are deleted and rejected
4. **Active check:** Admin sessions verify the admin record is active
5. **No client exposure:** Session tokens never returned to client-side code
