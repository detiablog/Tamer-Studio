"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { hasAnyPermission, hasAllPermissions, getEffectivePermissions, type UserRole, type Permission } from "@/lib/auth/permissions";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  fallback = null,
  redirectTo = "/login",
}: RoleGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push(redirectTo as Parameters<typeof router.push>[0]);
    }
  }, [isPending, session, router, redirectTo]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as { role?: UserRole } | undefined)?.role ?? "guest";

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(userRole, requiredPermissions)
      : hasAnyPermission(userRole, requiredPermissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

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
