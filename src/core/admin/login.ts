import { hashPassword, verifyPassword } from "@/core/security/hash";
import { verifyMasterKey } from "./verify";
import { adminRepository, adminSessionRepository } from "./admin.repository";
import { logger } from "@/core/logger";
import { recordFailedLogin } from "@/core/auth/events";
import { randomUUID } from "crypto";

export async function loginAdmin(credentials: {
  email: string;
  password: string;
  adminKey: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const isValidMasterKey = await verifyMasterKey(credentials.adminKey);
  if (!isValidMasterKey) {
    logger.security("Admin login attempt with invalid master key", {
      email: credentials.email,
    });
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
    logger.security("Admin login attempt with weak password", {
      email: credentials.email,
    });
    await recordFailedLogin({
      email: credentials.email,
      identifier: credentials.ipAddress ?? "unknown",
      reason: "weak_password",
      userAgent: credentials.userAgent,
      ipAddress: credentials.ipAddress,
    });
    return { success: false, reason: "invalid_credentials" as const };
  }

  if (process.env.NODE_ENV === "development") {
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (
      envEmail &&
      envPassword &&
      credentials.email === envEmail &&
      credentials.password === envPassword
    ) {
      logger.info("[DEV] Admin login via environment credentials", {
        email: credentials.email,
      });

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return {
        success: true,
        reason: undefined,
        session: {
          id: token,
          token,
          adminId: randomUUID(),
          expiresAt,
          createdAt: new Date(),
        },
      };
    }
  }

  try {
    const adminRecord = await adminRepository.findByEmail(credentials.email);

    if (!adminRecord) {
      logger.security("Admin login attempt with non-existent email", {
        email: credentials.email,
      });
      await recordFailedLogin({
        email: credentials.email,
        identifier: credentials.ipAddress ?? "unknown",
        reason: "email_not_found",
        userAgent: credentials.userAgent,
        ipAddress: credentials.ipAddress,
      });
      return { success: false, reason: "invalid_credentials" as const };
    }

    if (!adminRecord.isActive) {
      logger.security("Admin login attempt for inactive account", {
        adminId: adminRecord.id,
      });
      await recordFailedLogin({
        email: credentials.email,
        identifier: credentials.ipAddress ?? "unknown",
        reason: "account_inactive",
        userAgent: credentials.userAgent,
        ipAddress: credentials.ipAddress,
      });
      return { success: false, reason: "account_inactive" as const };
    }

    const isValid = await verifyPassword(
      credentials.password,
      adminRecord.passwordHash
    );

    if (!isValid) {
      logger.security("Admin login attempt with invalid password", {
        adminId: adminRecord.id,
      });
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

    await adminSessionRepository.deleteByAdminId(adminRecord.id);
    await adminSessionRepository.create({
      id: randomUUID(),
      token,
      adminId: adminRecord.id,
      expiresAt,
    });
    await adminRepository.updateLastLogin(adminRecord.id);

    logger.audit("Admin logged in", {
      adminId: adminRecord.id,
      email: adminRecord.email,
    });

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
  } catch (err) {
    logger.error("Database error during admin login", err instanceof Error ? err : new Error(String(err)));

    if (process.env.NODE_ENV === "development") {
      logger.warn(
        "[DEV] Database unavailable, falling back to environment credentials"
      );

      const envEmail = process.env.ADMIN_EMAIL;
      const envPassword = process.env.ADMIN_PASSWORD;

      if (
        envEmail &&
        envPassword &&
        credentials.email === envEmail &&
        credentials.password === envPassword
      ) {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        return {
          success: true,
          reason: undefined,
          session: {
            id: token,
            token,
            adminId: randomUUID(),
            expiresAt,
            createdAt: new Date(),
          },
        };
      }
    }

    throw err;
  }
}

export { hashPassword };
