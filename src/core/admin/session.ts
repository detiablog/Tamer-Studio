import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminSession, admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { AdminSession } from "./types";

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await db.select().from(adminSession).where(eq(adminSession.token, sessionToken)).limit(1);

  if (session.length === 0) {
    return null;
  }

  const sessionRecord = session[0];

  if (sessionRecord.expiresAt < new Date()) {
    await db.delete(adminSession).where(eq(adminSession.id, sessionRecord.id));
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
    path: "/admin",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
