# Client-Side Authentication Audit

**Date:** 2026-07-29 | **Status:** VERIFIED | **Environment:** Tamer Studio

## Overview

Client components in Tamer Studio use two distinct mechanisms for authentication, neither of which duplicates server-side auth state.

## User Client Authentication

### authClient.useSession()

**Used by:** User-facing dashboard client components

**Mechanism:**
- Better Auth provides `authClient` with `useSession()` hook
- Returns session data reactively
- Session data sourced from HTTP-only cookie (not accessible to JS)
- Client receives user metadata only (id, name, email, role)

### Usage Pattern

```typescript
const { data: session, isPending } = authClient.useSession();
// session?.user contains: id, name, email, role, status
// isPending indicates loading state
```

### No Duplicate State

- Server components use `getServerSession()` — reads cookie + DB lookup
- Client components use `authClient.useSession()` — reads same cookie via API
- Both reference the same `better-auth.session_token` cookie
- No separate client-side session store or localStorage

## Admin Client Authentication

### fetch('/api/admin/me')

**Used by:** Admin panel client components

**Mechanism:**
- Client makes GET request to `/api/admin/me`
- Server validates `admin_session` cookie via `requireAdminSession()`
- Returns admin profile data or 401
- Client stores response in React state only

### Usage Pattern

```typescript
const response = await fetch('/api/admin/me');
if (response.ok) {
  const admin = await response.json();
  // Use admin data in component
} else {
  // Redirect to /admin/login
}
```

### No Duplicate State

- Server components use `getAdminSession()` — reads cookie + DB lookup
- Client components use `/api/admin/me` — same cookie, same DB validation
- No client-side session caching beyond React component state
- No localStorage or sessionStorage for auth data

## Session Data Isolation

| Data | Server Access | Client Access |
|------|---------------|---------------|
| Session token | ✓ (cookie) | ✗ (HttpOnly) |
| User ID | ✓ (DB) | ✓ (via API response) |
| User email | ✓ (DB) | ✓ (via API response) |
| User role | ✓ (DB) | ✓ (via API response) |
| Admin token | ✓ (cookie) | ✗ (HttpOnly) |
| Admin permissions | ✓ (DB) | ✓ (via API response) |

## Security Properties

1. **HttpOnly cookies:** Session tokens are never accessible to client-side JavaScript
2. **No localStorage:** Auth tokens are never stored in browser storage
3. **No duplication:** Server and client auth use the same underlying session
4. **Single source of truth:** Database is the only session store
5. **CSRF protection:** SameSite=Lax cookies + CSRF tokens for state-changing operations

## Known Limitation

One user page uses `authClient.useSession()` for auth gating instead of server-side middleware. This allows a brief content flash before client-side redirect. Functionally secure but not server-enforced at the middleware layer.
