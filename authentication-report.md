# Authentication Report

**Sprint:** CMS-01 B3 — Application Layer Refactor
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the authentication centralization across all API endpoints. Authentication is now handled exclusively by middleware. Services receive authenticated identity only and never parse tokens.

---

## 2. Authentication Standards

### 2.1 Centralized Authentication

Authentication is handled by middleware hooks (`adminAuthentication`, `userAuthentication`, `eitherAuthentication`) in `src/core/middleware/auth.middleware.ts`.

### 2.2 Authentication Flow

```
HTTP Request
  ↓
Auth Middleware (extracts token, validates session)
  ↓
Request Context (contains authenticated identity)
  ↓
Service (receives authenticated identity, never parses tokens)
```

### 2.3 Authentication Rules

- Authentication happens before Services
- Services receive authenticated identity only
- Services never parse tokens
- Token parsing is centralized in middleware

---

## 3. Authentication Middleware

### 3.1 Admin Authentication

`adminAuthentication(allowAnonymous = false)` — Validates admin sessions via Bearer token or admin_session cookie. Sets `ctx.state.adminSession` with admin ID, role, and expiration.

### 3.2 User Authentication

`userAuthentication(allowAnonymous = false)` — Validates user sessions via Bearer token or better-auth.session_token cookie. Sets `ctx.state.userSession` with user ID, role, and expiration.

### 3.3 Either Authentication

`eitherAuthentication()` — Tries admin authentication first, then falls back to user authentication. Used for endpoints accessible by both admin and user roles.

---

## 4. Authentication State

The `SecurityState` interface in `src/core/middleware/types.ts` defines the authentication state:

```typescript
export interface SecurityState {
  adminSession?: {
    id: string;
    adminId: string;
    expiresAt: Date;
    role: string;
  };
  userSession?: {
    id: string;
    userId: string;
    expiresAt: Date;
    role: string;
  };
  // ... other state fields
}
```

---

## 5. Token Parsing

Token extraction is centralized in `extractToken()` in `auth.middleware.ts`:

1. Checks `Authorization: Bearer <token>` header
2. Checks `admin_session` cookie
3. Checks `better-auth.session_token` cookie

No service ever parses tokens directly.

---

## 6. Conclusion

Authentication is now fully centralized in middleware. Services receive authenticated identity only and never parse tokens. All API routes use the standardized authentication middleware.
