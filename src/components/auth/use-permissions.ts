"use client";

import * as React from "react";
import { authClient } from "@/lib/auth/auth-client";
import { type UserRole, type Permission } from "@/lib/auth/permissions";

export function usePermissions() {
  const { data: session } = authClient.useSession();

  const userRole = (session?.user as { role?: UserRole } | undefined)?.role ?? "guest";

  const permissions = React.useMemo(() => {
    const effective: Permission[] = [];
    const roleLevel = { guest: 0, user: 1, workspace_admin: 2, organization_admin: 3, system_admin: 4, super_admin: 5 } as const;
    const userLevel = (roleLevel as Record<string, number>)[userRole] ?? 0;

    for (const [r, level] of Object.entries(roleLevel)) {
      if (level <= userLevel) {
        const perms = getRolePermissions(r as UserRole);
        perms.forEach((p) => {
          if (!effective.includes(p)) effective.push(p);
        });
      }
    }
    return effective;
  }, [userRole]);

  const check = (permission: Permission) => permissions.includes(permission);
  const checkAny = (perms: Permission[]) => perms.some((p) => permissions.includes(p));
  const checkAll = (perms: Permission[]) => perms.every((p) => permissions.includes(p));

  return {
    role: userRole,
    permissions,
    hasPermission: check,
    hasAnyPermission: checkAny,
    hasAllPermissions: checkAll,
    isGuest: userRole === "guest",
    isUser: userRole === "user",
    isWorkspaceAdmin: userRole === "workspace_admin" || check("workspace:admin"),
    isOrganizationAdmin: userRole === "organization_admin" || check("admin:organizations"),
    isSystemAdmin: userRole === "system_admin" || check("admin:system"),
    isSuperAdmin: userRole === "super_admin",
    isAdmin: ["workspace_admin", "organization_admin", "system_admin", "super_admin"].includes(userRole),
  };
}

function getRolePermissions(role: UserRole): Permission[] {
  const map: Record<UserRole, Permission[]> = {
    guest: [],
    user: [
      "dashboard:read",
      "workspace:read",
      "workspace:write",
      "project:read",
      "project:write",
      "media:read",
      "media:write",
      "production:read",
      "production:write",
      "ai:read",
      "ai:write",
      "publishing:read",
      "publishing:write",
      "settings:read",
      "settings:write",
      "billing:read",
      "billing:write",
    ],
    workspace_admin: [
      "dashboard:read",
      "workspace:read",
      "workspace:write",
      "workspace:admin",
      "project:read",
      "project:write",
      "project:admin",
      "media:read",
      "media:write",
      "media:admin",
      "production:read",
      "production:write",
      "production:admin",
      "ai:read",
      "ai:write",
      "ai:admin",
      "publishing:read",
      "publishing:write",
      "publishing:admin",
      "settings:read",
      "settings:write",
      "settings:admin",
      "billing:read",
      "billing:write",
      "billing:admin",
    ],
    organization_admin: [
      "dashboard:read",
      "workspace:read",
      "workspace:write",
      "workspace:admin",
      "project:read",
      "project:write",
      "project:admin",
      "media:read",
      "media:write",
      "media:admin",
      "production:read",
      "production:write",
      "production:admin",
      "ai:read",
      "ai:write",
      "ai:admin",
      "publishing:read",
      "publishing:write",
      "publishing:admin",
      "settings:read",
      "settings:write",
      "settings:admin",
      "billing:read",
      "billing:write",
      "billing:admin",
      "admin:read",
      "admin:write",
      "admin:users",
      "admin:organizations",
      "admin:workspaces",
    ],
    system_admin: [
      "dashboard:read",
      "workspace:read",
      "workspace:write",
      "workspace:admin",
      "project:read",
      "project:write",
      "project:admin",
      "media:read",
      "media:write",
      "media:admin",
      "production:read",
      "production:write",
      "production:admin",
      "ai:read",
      "ai:write",
      "ai:admin",
      "publishing:read",
      "publishing:write",
      "publishing:admin",
      "settings:read",
      "settings:write",
      "settings:admin",
      "billing:read",
      "billing:write",
      "billing:admin",
      "admin:read",
      "admin:write",
      "admin:users",
      "admin:organizations",
      "admin:workspaces",
      "admin:ai_providers",
      "admin:jobs",
      "admin:queues",
      "admin:billing",
      "admin:subscriptions",
      "admin:coupons",
      "admin:analytics",
      "admin:audit_logs",
      "admin:feature_flags",
      "admin:system",
    ],
    super_admin: [
      "dashboard:read",
      "workspace:read",
      "workspace:write",
      "workspace:admin",
      "project:read",
      "project:write",
      "project:admin",
      "media:read",
      "media:write",
      "media:admin",
      "production:read",
      "production:write",
      "production:admin",
      "ai:read",
      "ai:write",
      "ai:admin",
      "publishing:read",
      "publishing:write",
      "publishing:admin",
      "settings:read",
      "settings:write",
      "settings:admin",
      "billing:read",
      "billing:write",
      "billing:admin",
      "admin:read",
      "admin:write",
      "admin:users",
      "admin:organizations",
      "admin:workspaces",
      "admin:ai_providers",
      "admin:jobs",
      "admin:queues",
      "admin:billing",
      "admin:subscriptions",
      "admin:coupons",
      "admin:analytics",
      "admin:audit_logs",
      "admin:feature_flags",
      "admin:system",
    ],
  };
  return map[role];
}
