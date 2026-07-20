import { auth } from "@/lib/auth/auth";
import { cookies } from "next/headers";
import { hasPermission, hasAnyPermission, hasAllPermissions, type UserRole, type Permission } from "./permissions";

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const headers = new Headers();
    for (const [name, value] of Object.entries(cookieStore)) {
      if (typeof value === "string") {
        headers.set(name, value);
      }
    }
    const session = await auth.api.getSession({
      headers,
    });
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "user";
  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden");
  }
  return { session, role };
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "user";
  if (!hasPermission(role, permission)) {
    throw new Error("Forbidden");
  }
  return { session, role };
}

export async function requireAnyPermission(permissions: Permission[]) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "user";
  if (!hasAnyPermission(role, permissions)) {
    throw new Error("Forbidden");
  }
  return { session, role };
}

export async function requireAllPermissions(permissions: Permission[]) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "user";
  if (!hasAllPermissions(role, permissions)) {
    throw new Error("Forbidden");
  }
  return { session, role };
}
