import type { Role, CreateRoleInput, UpdateRoleInput } from "./role.types";
import { RoleRepository } from "./role.repository";

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
    return this.repository.createRole(input);
  }

  async updateRole(roleId: string, input: UpdateRoleInput): Promise<Role> {
    return this.repository.updateRole(roleId, input);
  }

  async deleteRole(roleId: string): Promise<void> {
    return this.repository.deleteRole(roleId);
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    return this.repository.setRolePermissions(roleId, permissionIds);
  }
}
