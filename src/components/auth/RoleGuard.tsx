"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { type UserRole, type Permission } from "@/lib/auth/permissions";
import { usePermissions } from "./use-permissions";

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
    const { hasAnyPermission: hasAny, hasAllPermissions: hasAll } = usePermissions();
    const hasAccess = requireAll ? hasAll(requiredPermissions) : hasAny(requiredPermissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

export { usePermissions };
