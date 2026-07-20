"use client";

import * as React from "react";
import { RoleGuard } from "./RoleGuard";
import { type Permission } from "@/lib/auth/permissions";

type PermissionGuardProps = {
  permissions: Permission | Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const permArray = Array.isArray(permissions) ? permissions : [permissions];

  return (
    <RoleGuard
      requiredPermissions={permArray}
      requireAll={requireAll}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
}
