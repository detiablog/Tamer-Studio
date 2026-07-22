import { requireAdminSession } from "./session";
import type { AdminRole } from "./types";
import type { Permission } from "@/core/auth/permissions";
import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  admin: [
    "admin:read",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:audit_logs",
    "admin:feature_flags",
    "admin:system",
  ],
  super_admin: [
    "admin:read",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:audit_logs",
    "admin:feature_flags",
    "admin:system",
  ],
};

export async function requireAdmin(): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  return { session };
}

export async function requireAdminPermission(permission: Permission): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  const adminRecord = await db.select().from(admin).where(eq(admin.id, session.adminId)).limit(1);
  if (adminRecord.length === 0) {
    throw new Error("Forbidden: admin not found");
  }
  const permissions = ADMIN_ROLE_PERMISSIONS[adminRecord[0].role as AdminRole] || [];
  if (!permissions.includes(permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
  return { session };
}