import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema/admin";
import { hashPassword } from "@/core/security/hash";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { logger } from "@/core/logger";

export interface AdminBootstrapInput {
  email: string;
  password: string;
  name?: string;
}

export interface AdminBootstrapResult {
  success: boolean;
  adminId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Bootstrap the Founder account during installation.
 * 
 * The Founder is created only during installation.
 * There can only be one active Founder account.
 * 
 * Founder:
 *   - Cannot be deleted by Admin
 *   - Cannot be demoted by Admin
 *   - Requires Master Key for login
 *   - Requires Master Key for critical actions
 */
export async function bootstrapFounder(input: AdminBootstrapInput): Promise<AdminBootstrapResult> {
  if (!input.email || !input.password) {
    return { success: false, error: "Founder email and password are required" };
  }

  if (input.password.length < 12) {
    return { success: false, error: "Founder password must be at least 12 characters" };
  }

  const existingFounder = await db.select().from(admin).where(eq(admin.role, "founder")).limit(1);
  if (existingFounder.length > 0) {
    logger.info("Founder already exists, skipping creation", { adminId: existingFounder[0].id });
    return { success: true, adminId: existingFounder[0].id, skipped: true };
  }

  const existing = await db.select().from(admin).where(eq(admin.email, input.email)).limit(1);
  if (existing.length > 0) {
    logger.info("Admin user with this email already exists, skipping Founder creation", { email: input.email });
    return { success: true, adminId: existing[0].id, skipped: true };
  }

  const adminId = `admin_${randomUUID()}`;
  const passwordHash = await hashPassword(input.password);

  await db.insert(admin).values({
    id: adminId,
    email: input.email,
    passwordHash,
    name: input.name ?? "Founder",
    role: "founder",
    isActive: true,
  });

  logger.audit("Founder account created during installation", { adminId, email: input.email });
  return { success: true, adminId };
}

/**
 * Bootstrap an Admin account.
 * 
 * Admin authentication:
 *   - Email/password (no Master Key)
 *   - Permissions granted from database
 *   - Capabilities never hardcoded
 */
export async function bootstrapAdmin(input: AdminBootstrapInput): Promise<AdminBootstrapResult> {
  if (!input.email || !input.password) {
    return { success: false, error: "Admin email and password are required" };
  }

  if (input.password.length < 12) {
    return { success: false, error: "Admin password must be at least 12 characters" };
  }

  const existing = await db.select().from(admin).where(eq(admin.email, input.email)).limit(1);
  if (existing.length > 0) {
    logger.info("Admin user already exists, skipping creation", { email: input.email });
    return { success: true, adminId: existing[0].id, skipped: true };
  }

  const adminId = `admin_${randomUUID()}`;
  const passwordHash = await hashPassword(input.password);

  await db.insert(admin).values({
    id: adminId,
    email: input.email,
    passwordHash,
    name: input.name ?? "Admin",
    role: "admin",
    isActive: true,
  });

  logger.audit("Admin user created", { adminId, email: input.email });
  return { success: true, adminId };
}
