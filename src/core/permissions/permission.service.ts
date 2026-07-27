import type { Permission, CreatePermissionInput } from "./permission.types";
import { PermissionRepository } from "./permission.repository";
import { logAction } from "@/core/audit";

export class PermissionService {
  private repository = new PermissionRepository();

  async getPermission(permissionId: string): Promise<Permission | undefined> {
    return this.repository.getPermission(permissionId);
  }

  async getPermissionByKey(key: string): Promise<Permission | undefined> {
    return this.repository.getPermissionByKey(key);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.repository.getAllPermissions();
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    return this.repository.getPermissionsByCategory(category);
  }

  async createPermission(input: CreatePermissionInput): Promise<Permission> {
    const result = await this.repository.createPermission(input);
    logAction("permission.created", undefined, undefined, { permissionId: result.id, key: input.key });
    return result;
  }

  async deletePermission(permissionId: string): Promise<void> {
    await this.repository.deletePermission(permissionId);
    logAction("permission.deleted", undefined, undefined, { permissionId });
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.repository.getRolePermissions(roleId);
  }

  async bulkCreatePermissions(keys: string[], category?: string): Promise<Permission[]> {
    return this.repository.bulkCreatePermissions(keys, category);
  }
}
