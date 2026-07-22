import { hashPassword, verifyPassword } from "@/core/security/hash";
import { verifyMasterKey } from "./verify";
import { db } from "@/lib/db";
import { admin, adminSession } from "@/lib/db/schema";
import { logger } from "@/core/logger";
import { recordFailedLogin } from "@/lib/auth/events";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function loginAdmin(credentials: { email: string; password: string; adminKey: string; ipAddress?: string; userAgent?: string }) {
  if (!verifyMasterKey(credentials.adminKey)) {
    logger.security("Admin login attempt with invalid master key", { email: credentials.email });
    await recordFailedLogin({
      email: credentials.email,
      identifier: credentials.ipAddress ?? "unknown",
      reason: "invalid_master_key",
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });
    return { success: false, reason: "invalid_master_key" as const };
  }

  if (credentials.password.length < 12) {
    logger.security("Admin login attempt with weak password", { email: credentials.email });
    await recordFailedLogin({
      email: credentials.email,
      identifier: credentials.ipAddress ?? "unknown",
      reason: "weak_password",
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });
    return { success: false, reason: "invalid_credentials" as const };
  }

  const existingAdmin = await db.select().from(admin).where(eq(admin.email, credentials.email)).limit(1);

  if (existingAdmin.length === 0) {
    logger.security("Admin login attempt with non-existent email", { email: credentials.email });
    await recordFailedLogin({
      email: credentials.email,
      identifier: credentials.ipAddress ?? "unknown",
      reason: "email_not_found",
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });
    return { success: false, reason: "invalid_credentials" as const };
  }

  const adminRecord = existingAdmin[0];

  if (!adminRecord.isActive) {
    logger.security("Admin login attempt for inactive account", { adminId: adminRecord.id });
    await recordFailedLogin({
      email: credentials.email,
      identifier: credentials.ipAddress ?? "unknown",
      reason: "account_inactive",
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });
    return { success: false, reason: "account_inactive" as const };
  }

  const isValid = await verifyPassword(credentials.password, adminRecord.passwordHash);

  if (!isValid) {
    logger.security("Admin login attempt with invalid password", { adminId: adminRecord.id });
    await recordFailedLogin({
      email: credentials.email,
      identifier: credentials.ipAddress ?? "unknown",
      reason: "invalid_password",
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });
    return { success: false, reason: "invalid_credentials" as const };
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.delete(adminSession).where(eq(adminSession.adminId, adminRecord.id));

  await db.insert(adminSession).values({
    id: randomUUID(),
    token,
    adminId: adminRecord.id,
    expiresAt,
  });

  await db.update(admin).set({ lastLoginAt: new Date() }).where(eq(admin.id, adminRecord.id));

  logger.audit("Admin logged in", { adminId: adminRecord.id, email: adminRecord.email });

  return {
    success: true,
    reason: undefined,
    session: {
      id: token,
      token,
      adminId: adminRecord.id,
      expiresAt,
      createdAt: new Date(),
    },
  };
}

export { hashPassword };
