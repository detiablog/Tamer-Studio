import { db } from "@/lib/db";
import { permission, rolePermission } from "@/lib/db/schema/identity";
import { eq, sql } from "drizzle-orm";
import type { Permission, CreatePermissionInput } from "./permission.types";
import { randomUUID } from "crypto";
import { logAction } from "@/core/audit";

export class PermissionRepository {
  async getPermission(permissionId: string): Promise<Permission | undefined> {
    const rows = await db.select().from(permission).where(eq(permission.id, permissionId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapPermission(rows[0]);
  }

  async getPermissionByKey(key: string): Promise<Permission | undefined> {
    const rows = await db.select().from(permission).where(eq(permission.key, key)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapPermission(rows[0]);
  }

  async getAllPermissions(): Promise<Permission[]> {
    const rows = await db.select().from(permission).orderBy(permission.category, permission.key);
    return rows.map(this.mapPermission);
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    const rows = await db.select().from(permission).where(eq(permission.category, category)).orderBy(permission.key);
    return rows.map(this.mapPermission);
  }

  async createPermission(input: CreatePermissionInput): Promise<Permission> {
    const id = `perm_${randomUUID()}`;
    const now = new Date();
    const p: Permission = {
      id,
      key: input.key,
      description: input.description ?? null,
      category: input.category ?? null,
      createdAt: now,
    };
    await db.insert(permission).values({
      id,
      key: input.key,
      description: input.description ?? undefined,
      category: input.category ?? undefined,
      createdAt: now,
    });
    logAction("permission.created", undefined, undefined, {  permissionId: id, key: input.key  });
    return p;
  }

  async deletePermission(permissionId: string): Promise<void> {
    const existing = await this.getPermission(permissionId);
    if (!existing) throw new Error("Permission not found");
    await db.delete(permission).where(eq(permission.id, permissionId));
    logAction("permission.deleted", undefined, undefined, {  permissionId  });
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rows = await db.select({ permission })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(eq(rolePermission.roleId, roleId))
      .orderBy(permission.category, permission.key);
    return rows.map(r => this.mapPermission(r.permission));
  }

  async bulkCreatePermissions(keys: string[], category?: string): Promise<Permission[]> {
    const now = new Date();
    const values = keys.map(key => ({
      id: `perm_${randomUUID()}`,
      key,
      description: undefined,
      category: category ?? undefined,
      createdAt: now,
    }));
    await db.insert(permission).values(values);
    const created = await db.select().from(permission).where(sql`${permission.key} = ANY(${keys})`);
    return created.map(this.mapPermission);
  }

  private mapPermission(row: typeof permission.$inferSelect): Permission {
    return {
      id: row.id,
      key: row.key,
      description: row.description,
      category: row.category,
      createdAt: row.createdAt,
    };
  }
}
