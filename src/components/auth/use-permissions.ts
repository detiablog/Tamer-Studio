"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/auth-client";
import { type UserRole, type Permission, getEffectivePermissions } from "@/lib/auth/permissions";

export function usePermissions() {
  const { data: session } = authClient.useSession();

  const userRole = (session?.user as { role?: UserRole } | undefined)?.role ?? "guest";
  const permissions = React.useMemo(() => getEffectivePermissions(userRole), [userRole]);

  const hasPermission = (permission: Permission) => permissions.includes(permission);
  const hasAnyPermission = (perms: Permission[]) => perms.some((p) => permissions.includes(p));
  const hasAllPermissions = (perms: Permission[]) => perms.every((p) => permissions.includes(p));
  const hasRole = (role: UserRole) => permissions.includes(permissionForRole(role));

  return {
    role: userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isGuest: userRole === "guest",
    isUser: userRole === "user",
    isWorkspaceAdmin: userRole === "workspace_admin" || permissions.includes("workspace:admin"),
    isOrganizationAdmin: userRole === "organization_admin" || permissions.includes("admin:organizations"),
    isSystemAdmin: userRole === "system_admin" || permissions.includes("admin:system"),
    isSuperAdmin: userRole === "super_admin",
    isAdmin: ["workspace_admin", "organization_admin", "system_admin", "super_admin"].includes(userRole),
  };
}

function permissionForRole(role: UserRole): Permission {
  const map: Record<UserRole, Permission> = {
    guest: "dashboard:read",
    user: "dashboard:read",
    workspace_admin: "workspace:admin",
    organization_admin: "admin:organizations",
    system_admin: "admin:system",
    super_admin: "admin:system",
  };
  return map[role];
}
