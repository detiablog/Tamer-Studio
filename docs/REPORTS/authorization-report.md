# Authorization Report

**Sprint:** CMS-01 B3 — Application Layer Refactor
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the authorization centralization across all API endpoints. RBAC checks are now handled by centralized middleware. No duplicated permission checks exist in API routes.

---

## 2. Authorization Standards

### 2.1 Centralized Authorization

Authorization is handled by middleware hooks in `src/core/middleware/authz.middleware.ts`.

### 2.2 Authorization Flow

```
HTTP Request
  ↓
Authentication Middleware
  ↓
Authorization Middleware (RBAC check)
  ↓
Service (assumes authorization has occurred)
```

---

## 3. Authorization Middleware

### 3.1 Admin Permission Check

`requireAdminPermission(requiredPermission: string)` — Checks if the admin session has the required permission based on role-based permissions.

### 3.2 User Permission Check

`requireUserPermission(requiredPermission: string)` — Checks if the user session has the required permission based on role-based permissions.

### 3.3 Workspace Ownership Check

`requireWorkspaceOwnership(resourceParam = "workspaceId")` — Checks if the authenticated user owns the specified workspace.

### 3.4 Role Check

`requireAnyRole(allowedRoles: string[])` — Checks if the authenticated user has any of the specified roles.

---

## 4. RBAC Integration

### 4.1 Admin RBAC

Admin permissions are defined in `ADMIN_ROLE_PERMISSIONS` in `src/core/admin/rbac`. The middleware checks the admin's role against required permissions.

### 4.2 User RBAC

User permissions are resolved via `getEffectivePermissions()` from `src/core/auth/permissions`. The middleware checks the user's role against required permissions.

---

## 5. Authorization State

The `SecurityState` interface includes:

```typescript
permissionError?: {
  status: number;
  message: string;
};
```

---

## 6. Conclusion

Authorization is now fully centralized in middleware. No duplicated permission checks exist in API routes. Services assume authorization has occurred unless business rules require additional checks.
