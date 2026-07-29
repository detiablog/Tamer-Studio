"use client";

import * as React from "react";
import { ADMIN_ROUTE_PERMISSIONS, type AdminPermission } from "@/core/admin/rbac";

export function useAdminPermissions() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [permissions, setPermissions] = React.useState<AdminPermission[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const hasAdminSession = document.cookie
      .split("; ")
      .some((row) => row.startsWith("admin_session="));

    setIsAdmin(hasAdminSession);
    setMounted(true);

    if (hasAdminSession) {
      fetch("/api/admin/me")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data?.admin?.role) {
            const allPerms = Object.values(ADMIN_ROUTE_PERMISSIONS).flat();
            setPermissions([...new Set(allPerms)] as AdminPermission[]);
          }
        })
        .catch(() => {});
    }
  }, []);

  const hasPermission = (permission: AdminPermission) => {
    return isAdmin && mounted && permissions.includes(permission);
  };

  return {
    isAdmin,
    mounted,
    hasPermission,
    permissions: isAdmin && mounted ? permissions : [],
  };
}
