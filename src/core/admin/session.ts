import { cookies } from "next/headers";
import { adminRepository, adminSessionRepository } from "./admin.repository";
import { logger } from "@/core/logger";
import type { AdminSession, AdminRole } from "./types";

export async function getAdminSession(): Promise<AdminSession | null> {
  let sessionToken: string | undefined;

  try {
    const cookieStore = await cookies();
    sessionToken = cookieStore.get("admin_session")?.value;
  } catch {
    return null;
  }

  if (!sessionToken) {
    return null;
  }

  try {
    const sessionRecord = await adminSessionRepository.findByToken(sessionToken);

    if (!sessionRecord) {
      return null;
    }

    if (sessionRecord.expiresAt < new Date()) {
      await adminSessionRepository.deleteByAdminId(sessionRecord.adminId);
      return null;
    }

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (newExpiresAt > sessionRecord.expiresAt) {
      await adminSessionRepository.extendSession(sessionRecord.id, newExpiresAt);
    }

    const adminRecord = await adminRepository.findById(sessionRecord.adminId);

    if (!adminRecord || !adminRecord.isActive) {
      return null;
    }

    return {
      id: sessionRecord.id,
      token: sessionRecord.token,
      adminId: sessionRecord.adminId,
      role: adminRecord.role as AdminRole,
      expiresAt: sessionRecord.expiresAt,
      createdAt: sessionRecord.createdAt,
    };
  } catch (err) {
    logger.error("Error getting admin session", err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function getAdminSessionFromToken(
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AdminSession | null> {
  try {
    const sessionRecord = await adminSessionRepository.findByToken(token);

    if (!sessionRecord) {
      return null;
    }

    if (sessionRecord.expiresAt < new Date()) {
      await adminSessionRepository.deleteByAdminId(sessionRecord.adminId);
      return null;
    }

    const adminRecord = await adminRepository.findById(sessionRecord.adminId);

    if (!adminRecord || !adminRecord.isActive) {
      return null;
    }

    return {
      id: sessionRecord.id,
      token: sessionRecord.token,
      adminId: sessionRecord.adminId,
      role: adminRecord.role as AdminRole,
      expiresAt: sessionRecord.expiresAt,
      createdAt: sessionRecord.createdAt,
    };
  } catch (err) {
    logger.error("Error getting admin session from token", err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}
