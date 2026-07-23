export { auth } from "@/core/auth/auth";
export type { UserRole, Permission } from "@/core/auth/permissions";
export { getServerSession, requireAuth, requireRole, requirePermission, requireAnyPermission, requireAllPermissions, getRoleFromSession, getUserPermissions } from "@/core/auth/session";
export { hasPermission, hasAnyPermission, hasAllPermissions, getEffectivePermissions, ROLE_PERMISSIONS, ROLE_HIERARCHY } from "@/core/auth/permissions";

import { auth } from "@/core/auth/auth";
export const handler = auth.handler;
