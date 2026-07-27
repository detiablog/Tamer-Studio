import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class AdminService {
  async getAdminProfile(adminId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
  } | undefined> {
    const rows = await db.select().from(admin).where(eq(admin.id, adminId)).limit(1);
    if (rows.length === 0) return undefined;
    const record = rows[0];
    const initials = record.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      isActive: record.isActive,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      initials,
    };
  }
}
