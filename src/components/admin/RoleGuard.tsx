"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

type UserRole = "user" | "admin" | "super_admin";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  admin: 1,
  super_admin: 2,
};

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as { role?: UserRole } | undefined)?.role ?? "user";
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const allowed = allowedRoles.some((role) => userLevel >= (ROLE_HIERARCHY[role] ?? 0));

  if (!allowed) {
    return fallback ?? (
      <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
        You do not have permission to view this page.
      </div>
    );
  }

  return <>{children}</>;
}
