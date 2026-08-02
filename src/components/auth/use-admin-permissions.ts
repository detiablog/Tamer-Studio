"use client";

import * as React from "react";
import { ADMIN_ROLE_PERMISSIONS, type AdminPermission } from "@/core/admin/rbac";
import type { AdminRole } from "@/core/admin/types";

export function useAdminPermissions() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [role, setRole] = React.useState<AdminRole | null>(null);
  const [permissions, setPermissions] = React.useState<AdminPermission[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => {
        const adminRole = data?.data?.role || data?.admin?.role;
        if (adminRole && (adminRole === "admin" || adminRole === "founder")) {
          setIsAdmin(true);
          setRole(adminRole as AdminRole);
          const rolePerms = ADMIN_ROLE_PERMISSIONS[adminRole] || [];
          setPermissions([...new Set(rolePerms)] as AdminPermission[]);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  const hasPermission = (permission: AdminPermission) => {
    return isAdmin && mounted && permissions.includes(permission);
  };

  return {
    isAdmin,
    role,
    isFounder: role === "founder",
    mounted,
    hasPermission,
    permissions: isAdmin && mounted ? permissions : [],
  };
}
