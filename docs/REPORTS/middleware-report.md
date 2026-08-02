# Middleware Report

**Sprint:** CMS-01 B3 — Application Layer Refactor
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the middleware standardization across all API endpoints. Middleware now handles authentication, authorization, logging, request ID, rate limiting, and error handling consistently.

---

## 2. Middleware Stack

### 2.1 Standard Middleware Pipeline

```
Request → Request ID → Logging → Authentication → Authorization → Rate Limit → Route Handler → Response Mapping → Error Mapping → Response
```

### 2.2 Middleware Components

| Component | File | Purpose |
|-----------|------|---------|
| adminAuthentication | `src/core/middleware/auth.middleware.ts` | Admin session validation |
| userAuthentication | `src/core/middleware/auth.middleware.ts` | User session validation |
| eitherAuthentication | `src/core/middleware/auth.middleware.ts` | Admin or user authentication |
| requireAdminPermission | `src/core/middleware/authz.middleware.ts` | Admin permission check |
| requireUserPermission | `src/core/middleware/authz.middleware.ts` | User permission check |
| requireWorkspaceOwnership | `src/core/middleware/authz.middleware.ts` | Workspace ownership check |
| requireAnyRole | `src/core/middleware/authz.middleware.ts` | Role-based access check |
| rateLimitMiddleware | `src/core/middleware/rate-limit.middleware.ts` | Rate limiting |
| auditMiddleware | `src/core/middleware/audit.middleware.ts` | Audit logging |

---

## 3. Request Context

The `RequestContext` interface provides a standardized context object:

```typescript
export interface RequestContext {
  request: Request;
  params?: Record<string, string>;
  state: SecurityState;
  method: string;
  pathname: string;
  ip?: string;
}
```

### 3.1 Security State

```typescript
export interface SecurityState {
  adminSession?: { id: string; adminId: string; expiresAt: Date; role: string };
  userSession?: { id: string; userId: string; expiresAt: Date; role: string };
  auditContext?: { actorId: string; actorType: string; ipAddress?: string; userAgent?: string };
  // ... other state fields
}
```

---

## 4. Middleware Composition

Middleware is composed using `runMiddleware()`:

```typescript
const errorResponse = await runMiddleware([
  adminAuthentication(),
  requireAdminPermission("users.read"),
  rateLimitMiddleware(),
], ctx);
if (errorResponse) return errorResponse;
```

---

## 5. Auth Utilities

Located in `src/app/api/mappers/request-mapper.ts`:
- `extractRequestId(request)` — Extracts or generates request ID
- `extractClientIp(request)` — Extracts client IP
- `extractUserAgent(request)` — Extracts user agent

---

## 6. Logging Utilities

Located in `src/app/api/mappers/logger.ts`:
- `createLogEntry()` — Creates a standardized log entry
- `logRequest()` — Logs request metadata

---

## 7. Conclusion

Middleware is now standardized across all API endpoints. Authentication, authorization, logging, request ID, rate limiting, and error handling are handled consistently through reusable middleware components.
