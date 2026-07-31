import { auth } from "./auth";
import { cookies } from "next/headers";
import { InvalidSessionError } from "./errors";
import { getEffectivePermissions, hasPermission, hasAnyPermission, hasAllPermissions, type UserRole, type Permission } from "./permissions";
import type { UserSession } from "./types";
import { logger } from "@/core/logger";

export async function getServerSession(request?: Request): Promise<UserSession | null> {
  try {
    let headers: Headers;

    if (request) {
      headers = new Headers(request.headers);
    } else {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      headers = new Headers();
      if (allCookies.length > 0) {
        const cookieString = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");
        headers.append("Cookie", cookieString);
      }
    }

    const session = await auth.api.getSession({ headers });
    return session as UserSession | null;
  } catch (err) {
    logger.error("getServerSession error", err as Error);
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
