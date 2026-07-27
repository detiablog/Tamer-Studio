import type { Role, CreateRoleInput, UpdateRoleInput } from "./role.types";
import { RoleRepository } from "./role.repository";
import { logAction } from "@/core/audit";

export class RoleService {
  private repository = new RoleRepository();

  async getRole(roleId: string): Promise<Role | undefined> {
    return this.repository.getRole(roleId);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return this.repository.getRoleByName(name);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.repository.getAllRoles();
  }

  async createRole(input: CreateRoleInput): Promise<Role> {
    const result = await this.repository.createRole(input);
    logAction("role.created", undefined, undefined, { roleId: result.id, name: input.name });
    return result;
  }

  async updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
    const result = await this.repository.updateRole(roleId, input);
    logAction("role.updated", undefined, undefined, { roleId, changes: input });
    return result;
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.repository.deleteRole(roleId);
    logAction("role.deleted", undefined, undefined, { roleId });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.repository.setRolePermissions(roleId, permissionIds);
    logAction("role.permissions.updated", undefined, undefined, { roleId, permissionCount: permissionIds.length });
  }
}
