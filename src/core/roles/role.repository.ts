import { db } from "@/lib/db";
import { role, rolePermission } from "@/lib/db/schema/identity";
import { eq } from "drizzle-orm";
import type { Role, CreateRoleInput, UpdateRoleInput } from "./role.types";
import { randomUUID } from "crypto";
import { logAction } from "@/core/audit";

export class RoleRepository {
  async getRole(roleId: string): Promise<Role | undefined> {
    const rows = await db.select().from(role).where(eq(role.id, roleId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRole(rows[0]);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const rows = await db.select().from(role).where(eq(role.name, name)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRole(rows[0]);
  }

  async getAllRoles(): Promise<Role[]> {
    const rows = await db.select().from(role).orderBy(role.level);
    return rows.map(this.mapRole);
  }

  async createRole(input: CreateRoleInput): Promise<Role> {
    const id = `role_${randomUUID()}`;
    const now = new Date();
    const r: Role = {
      id,
      name: input.name,
      description: input.description ?? null,
      level: input.level ?? "0",
      isSystem: input.isSystem ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(role).values({
      id,
      name: input.name,
      description: input.description ?? undefined,
      level: r.level,
      isSystem: r.isSystem,
      createdAt: now,
      updatedAt: now,
    });
    logAction("role.created", undefined, undefined, {  roleId: id, name: input.name  });
    return r;
  }

  async updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
    const existing = await this.getRole(roleId);
    if (!existing) throw new Error("Role not found");
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.level !== undefined) updates.level = input.level;
    if (input.isSystem !== undefined) updates.isSystem = input.isSystem;
    await db.update(role).set(updates).where(eq(role.id, roleId));
    logAction("role.updated", undefined, undefined, {  roleId, changes: input  });
    return { ...existing, ...updates } as Role;
  }

  async deleteRole(roleId: string): Promise<void> {
    const existing = await this.getRole(roleId);
    if (!existing) throw new Error("Role not found");
    if (existing.isSystem) throw new Error("Cannot delete system role");
    await db.delete(role).where(eq(role.id, roleId));
    logAction("role.deleted", undefined, undefined, {  roleId  });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await db.delete(rolePermission).where(eq(rolePermission.roleId, roleId));
    const values = permissionIds.map(pid => ({
      id: `rp_${randomUUID()}`,
      roleId,
      permissionId: pid,
    }));
    if (values.length > 0) {
      await db.insert(rolePermission).values(values);
    }
    logAction("role.permissions.updated", undefined, undefined, {  roleId, permissionCount: permissionIds.length  });
  }

  private mapRole(row: typeof role.$inferSelect): Role {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      level: row.level,
      isSystem: row.isSystem,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
