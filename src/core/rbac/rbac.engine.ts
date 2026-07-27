import { MembershipRepository } from "@/core/membership/membership.repository";
import { RoleRepository } from "@/core/roles/role.repository";
import { PermissionRepository } from "@/core/permissions/permission.repository";
import type { PermissionResolution, RbacContext, RbacResult } from "./rbac.types";
import { ROLE_PERMISSIONS, ROLE_HIERARCHY, type UserRole } from "@/core/auth/permissions";

export class RbacEngine {
  private membershipRepository = new MembershipRepository();
  private roleRepository = new RoleRepository();
  private permissionRepository = new PermissionRepository();

  async resolvePermissions(context: RbacContext): Promise<PermissionResolution> {
    const workspaceRole = await this.getWorkspaceRole(context.userId, context.workspaceId);
    const organizationRole = await this.getOrganizationRole(context.userId, context.organizationId);
    const effectiveRole = this.getEffectiveRole(workspaceRole, organizationRole);
    const rolePermissions = ROLE_PERMISSIONS[effectiveRole] ?? [];
    const dbPermissions = await this.getDatabasePermissions(workspaceRole, organizationRole);
    const allPermissions = Array.from(new Set([...rolePermissions, ...dbPermissions]));
    const roles = [effectiveRole];
    if (workspaceRole) roles.push(workspaceRole);
    if (organizationRole && organizationRole !== workspaceRole) roles.push(organizationRole);
    return {
      userId: context.userId,
      workspaceId: context.workspaceId,
      organizationId: context.organizationId,
      permissions: allPermissions,
      roles: Array.from(new Set(roles)),
      source: this.getSource(workspaceRole, organizationRole),
    };
  }

  async checkPermission(context: RbacContext): Promise<RbacResult> {
    const resolution = await this.resolvePermissions(context);
    const required = context.requiredPermissions ?? (context.requiredPermission ? [context.requiredPermission] : []);
    const missing = required.filter(p => !resolution.permissions.includes(p));
    return {
      allowed: context.requireAll ? missing.length === 0 : missing.length < required.length,
      permissions: resolution.permissions,
      roles: resolution.roles,
      missingPermissions: missing,
    };
  }

  async hasPermission(userId: string, permission: string, workspaceId?: string, organizationId?: string): Promise<boolean> {
    const result = await this.checkPermission({
      userId,
      workspaceId,
      organizationId,
      requiredPermission: permission,
    });
    return result.allowed;
  }

  private async getWorkspaceRole(userId: string, workspaceId?: string): Promise<UserRole | undefined> {
    if (!workspaceId) return undefined;
    const member = await this.membershipRepository.getWorkspaceMember(workspaceId, userId);
    if (!member || !member.roleId) return undefined;
    const role = await this.roleRepository.getRole(member.roleId);
    return role?.name as UserRole | undefined;
  }

  private async getOrganizationRole(userId: string, organizationId?: string): Promise<UserRole | undefined> {
    if (!organizationId) return undefined;
    const member = await this.membershipRepository.getOrganizationMember(organizationId, userId);
    if (!member || !member.roleId) return undefined;
    const role = await this.roleRepository.getRole(member.roleId);
    return role?.name as UserRole | undefined;
  }

  private async getDatabasePermissions(workspaceRole?: UserRole, organizationRole?: UserRole): Promise<string[]> {
    const roleIds: string[] = [];
    if (workspaceRole) {
      const role = await this.roleRepository.getRoleByName(workspaceRole);
      if (role) roleIds.push(role.id);
    }
    if (organizationRole && organizationRole !== workspaceRole) {
      const role = await this.roleRepository.getRoleByName(organizationRole);
      if (role) roleIds.push(role.id);
    }
    if (roleIds.length === 0) return [];
    const permissions = await this.permissionRepository.getRolePermissions(roleIds[0]);
    return permissions.map(p => p.key);
  }

  private getEffectiveRole(workspaceRole?: UserRole, organizationRole?: UserRole): UserRole {
    const wsLevel = workspaceRole ? ROLE_HIERARCHY[workspaceRole] ?? 0 : 0;
    const orgLevel = organizationRole ? ROLE_HIERARCHY[organizationRole] ?? 0 : 0;
    if (wsLevel > orgLevel) return workspaceRole ?? "user";
    if (orgLevel > wsLevel) return organizationRole ?? "user";
    return workspaceRole ?? organizationRole ?? "user";
  }

  private getSource(workspaceRole?: UserRole, organizationRole?: UserRole): PermissionResolution["source"] {
    if (workspaceRole && organizationRole) return "combined";
    if (workspaceRole) return "workspace";
    if (organizationRole) return "organization";
    return "system";
  }
}