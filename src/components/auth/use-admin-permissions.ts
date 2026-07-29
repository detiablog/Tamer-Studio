"use client";

import * as React from "react";
import { ADMIN_ROUTE_PERMISSIONS, type AdminPermission } from "@/core/admin/rbac";

export function useAdminPermissions() {
  const [isAdmin, setIsAdmin] = React.useState(true);
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
        if (data?.data?.role || data?.admin?.role) {
          setIsAdmin(true);
          const allPerms = Object.values(ADMIN_ROUTE_PERMISSIONS).flat();
          setPermissions([...new Set(allPerms)] as AdminPermission[]);
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
    mounted,
    hasPermission,
    permissions: isAdmin && mounted ? permissions : [],
  };
}
