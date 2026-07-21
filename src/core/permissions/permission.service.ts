import type { Permission, CreatePermissionInput } from "./permission.types";
import { PermissionRepository } from "./permission.repository";

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
    return this.repository.createPermission(input);
  }

  async deletePermission(permissionId: string): Promise<void> {
    return this.repository.deletePermission(permissionId);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.repository.getRolePermissions(roleId);
  }

  async bulkCreatePermissions(keys: string[], category?: string): Promise<Permission[]> {
    return this.repository.bulkCreatePermissions(keys, category);
  }
}
