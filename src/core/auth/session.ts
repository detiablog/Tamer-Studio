import { auth } from "./auth";
import { cookies } from "next/headers";
import { InvalidSessionError } from "./errors";
import { getEffectivePermissions, hasPermission, hasAnyPermission, hasAllPermissions, type UserRole, type Permission } from "./permissions";
import type { UserSession } from "./types";

export async function getServerSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const headers = new Headers();
    for (const [name, value] of cookieStore) {
      if (typeof value === "string") {
        headers.set(name, value);
      }
    }
    const session = await auth.api.getSession({ headers });
    return session as UserSession | null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<UserSession> {
  const session = await getServerSession();
  if (!session) {
    throw new InvalidSessionError();
  }
  return session;
}

export async function optionalUser(): Promise<UserSession | null> {
  return getServerSession();
}

export async function guestOnly(): Promise<void> {
  const session = await getServerSession();
  if (session) {
    throw new InvalidSessionError();
  }
}

export async function requireAuth(): Promise<UserSession> {
  return requireUser();
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "guest";
  if (!allowedRoles.includes(role)) {
    throw new InvalidSessionError();
  }
  return { session, role };
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "guest";
  if (!hasPermission(role, permission)) {
    throw new InvalidSessionError();
  }
  return { session, role };
}

export async function requireAnyPermission(permissions: Permission[]) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "guest";
  if (!hasAnyPermission(role, permissions)) {
    throw new InvalidSessionError();
  }
  return { session, role };
}

export async function requireAllPermissions(permissions: Permission[]) {
  const session = await requireAuth();
  const role = (session.user as { role?: UserRole } | undefined)?.role ?? "guest";
  if (!hasAllPermissions(role, permissions)) {
    throw new InvalidSessionError();
  }
  return { session, role };
}

export function getRoleFromSession(session: UserSession | null): UserRole {
  return (session?.user as { role?: UserRole } | undefined)?.role ?? "guest";
}

export function getUserPermissions(session: UserSession | null): string[] {
  const role = getRoleFromSession(session);
  return getEffectivePermissions(role);
}
