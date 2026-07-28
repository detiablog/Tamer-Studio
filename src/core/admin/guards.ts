import { requireAdminSession } from "./session";
import type { AdminRole } from "./types";
import type { Permission } from "@/core/auth/permissions";
import { adminRepository } from "./admin.repository";
import { ADMIN_ROLE_PERMISSIONS } from "./rbac";

export async function requireAdmin(): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  return { session };
}

export async function requireAdminPermission(permission: Permission): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  const adminRecord = await adminRepository.findById(session.adminId);
  if (!adminRecord) {
    throw new Error("Forbidden: admin not found");
  }
  const permissions = ADMIN_ROLE_PERMISSIONS[adminRecord.role as AdminRole] || [];
  if (!permissions.includes(permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
  return { session };
}
