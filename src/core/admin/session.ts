import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminSession, admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/core/logger";
import type { AdminSession } from "./types";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    return null;
  }

  // In development, allow any valid session token
  if (process.env.NODE_ENV === "development") {
    logger.info("[DEV] Admin session found via cookie, allowing access");
    return {
      id: sessionToken,
      token: sessionToken,
      adminId: "dev-admin",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  // Production: validate via database
  try {
    const session = await db.select().from(adminSession).where(eq(adminSession.token, sessionToken)).limit(1);

    if (session.length === 0) {
      return null;
    }

    const sessionRecord = session[0];

    if (sessionRecord.expiresAt < new Date()) {
      await db.delete(adminSession).where(eq(adminSession.id, sessionRecord.id));
      return null;
    }

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (newExpiresAt > sessionRecord.expiresAt) {
      await db.update(adminSession).set({ expiresAt: newExpiresAt }).where(eq(adminSession.id, sessionRecord.id));
    }

    const adminRecord = await db.select().from(admin).where(eq(admin.id, sessionRecord.adminId)).limit(1);

    if (adminRecord.length === 0 || !adminRecord[0].isActive) {
      return null;
    }

    return {
      id: sessionRecord.id,
      token: sessionRecord.token,
      adminId: sessionRecord.adminId,
      expiresAt: sessionRecord.expiresAt,
      ipAddress: sessionRecord.ipAddress ?? undefined,
      userAgent: sessionRecord.userAgent ?? undefined,
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
  // In development, allow any valid token
  if (process.env.NODE_ENV === "development") {
    logger.info("[DEV] Admin session validated via token");
    return {
      id: token,
      token,
      adminId: "dev-admin",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  // Production: validate via database
  try {
    const session = await db.select().from(adminSession).where(eq(adminSession.token, token)).limit(1);

    if (session.length === 0) {
      return null;
    }

    const sessionRecord = session[0];

    if (sessionRecord.expiresAt < new Date()) {
      await db.delete(adminSession).where(eq(adminSession.id, sessionRecord.id));
      return null;
    }

    if (ipAddress && sessionRecord.ipAddress && sessionRecord.ipAddress !== ipAddress) {
      await db.delete(adminSession).where(eq(adminSession.id, sessionRecord.id));
      logger.security("Admin session invalidated due to IP mismatch", {
        sessionId: sessionRecord.id,
        adminId: sessionRecord.adminId,
        storedIp: sessionRecord.ipAddress,
        requestIp: ipAddress,
      });
      return null;
    }

    if (userAgent && sessionRecord.userAgent && sessionRecord.userAgent !== userAgent) {
      await db.delete(adminSession).where(eq(adminSession.id, sessionRecord.id));
      logger.security("Admin session invalidated due to User-Agent mismatch", {
        sessionId: sessionRecord.id,
        adminId: sessionRecord.adminId,
        storedUserAgent: sessionRecord.userAgent,
        requestUserAgent: userAgent,
      });
      return null;
    }

    const adminRecord = await db.select().from(admin).where(eq(admin.id, sessionRecord.adminId)).limit(1);

    if (adminRecord.length === 0 || !adminRecord[0].isActive) {
      return null;
    }

    return {
      id: sessionRecord.id,
      token: sessionRecord.token,
      adminId: sessionRecord.adminId,
      expiresAt: sessionRecord.expiresAt,
      ipAddress: sessionRecord.ipAddress ?? undefined,
      userAgent: sessionRecord.userAgent ?? undefined,
      createdAt: sessionRecord.createdAt,
    };
  } catch (err) {
    logger.error("Error getting admin session from token", err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}
