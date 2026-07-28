"use client";

import * as React from "react";

const ADMIN_PERMISSIONS = [
  "admin:users",
  "admin:organizations",
  "admin:workspaces",
  "admin:ai_providers",
  "admin:landing_builder",
  "admin:jobs",
  "admin:queues",
  "admin:billing",
  "admin:subscriptions",
  "admin:coupons",
  "admin:analytics",
  "admin:audit_logs",
  "admin:feature_flags",
  "admin:system",
  "admin:email",
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

export function useAdminPermissions() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const hasAdminSession = document.cookie
      .split("; ")
      .some((row) => row.startsWith("admin_session="));

    setIsAdmin(hasAdminSession);
    setMounted(true);
  }, []);

  const hasPermission = (permission: AdminPermission) => {
    return isAdmin && mounted;
  };

  return {
    isAdmin,
    mounted,
    hasPermission,
    permissions: isAdmin && mounted ? ADMIN_PERMISSIONS : [],
  };
}
