import { requireAdminSession } from "./session";
import type { Permission } from "@/core/auth/permissions";

export async function requireAdmin(): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  return { session };
}

export async function requireAdminPermission(_permission: Permission): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  return { session };
}