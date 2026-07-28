import { db } from "@/lib/db";
import { admin, adminSession } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface AdminRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSessionRecord {
  id: string;
  token: string;
  adminId: string;
  expiresAt: Date;
  createdAt: Date;
}

export class AdminRepository {
  async findByEmail(email: string): Promise<AdminRecord | undefined> {
    const rows = await db.select().from(admin).where(eq(admin.email, email)).limit(1);
    return rows[0] as AdminRecord | undefined;
  }

  async findById(id: string): Promise<AdminRecord | undefined> {
    const rows = await db.select().from(admin).where(eq(admin.id, id)).limit(1);
    return rows[0] as AdminRecord | undefined;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(admin).set({ lastLoginAt: new Date() }).where(eq(admin.id, id));
  }
}

export class AdminSessionRepository {
  async create(session: { id: string; token: string; adminId: string; expiresAt: Date }): Promise<AdminSessionRecord> {
    await db.insert(adminSession).values(session);
    return { ...session, createdAt: new Date() };
  }

  async deleteByAdminId(adminId: string): Promise<void> {
    await db.delete(adminSession).where(eq(adminSession.adminId, adminId));
  }

  async findByToken(token: string): Promise<AdminSessionRecord | undefined> {
    const rows = await db.select().from(adminSession).where(eq(adminSession.token, token)).limit(1);
    return rows[0] as AdminSessionRecord | undefined;
  }

  async findByAdminId(adminId: string): Promise<AdminSessionRecord | undefined> {
    const rows = await db.select().from(adminSession).where(eq(adminSession.adminId, adminId)).limit(1);
    return rows[0] as AdminSessionRecord | undefined;
  }

  async deleteExpired(): Promise<void> {
    await db.delete(adminSession).where(eq(adminSession.expiresAt, new Date()));
  }
}

export const adminRepository = new AdminRepository();
export const adminSessionRepository = new AdminSessionRepository();
