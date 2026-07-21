import { db } from "@/lib/db";
import { workspaceMember, organizationMember, rolePermission, role, permission } from "@/lib/db/schema/identity";
import { eq, and, sql } from "drizzle-orm";
import type { PermissionResolution, RbacContext, RbacResult } from "./rbac.types";
import { ROLE_PERMISSIONS, ROLE_HIERARCHY, type UserRole } from "@/core/auth/permissions";

export class RbacEngine {
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
    const rows = await db.select({ roleName: role.name })
      .from(workspaceMember)
      .innerJoin(role, eq(workspaceMember.roleId, role.id))
      .where(and(eq(workspaceMember.userId, userId), eq(workspaceMember.workspaceId, workspaceId)))
      .limit(1);
    if (rows.length === 0) return undefined;
    return rows[0].roleName as UserRole;
  }

  private async getOrganizationRole(userId: string, organizationId?: string): Promise<UserRole | undefined> {
    if (!organizationId) return undefined;
    const rows = await db.select({ roleName: role.name })
      .from(organizationMember)
      .innerJoin(role, eq(organizationMember.roleId, role.id))
      .where(and(eq(organizationMember.userId, userId), eq(organizationMember.organizationId, organizationId)))
      .limit(1);
    if (rows.length === 0) return undefined;
    return rows[0].roleName as UserRole;
  }

  private async getDatabasePermissions(workspaceRole?: UserRole, organizationRole?: UserRole): Promise<string[]> {
    const roleIds: string[] = [];
    if (workspaceRole) {
      const roleRows = await db.select({ id: role.id }).from(role).where(eq(role.name, workspaceRole)).limit(1);
      if (roleRows.length > 0) roleIds.push(roleRows[0].id);
    }
    if (organizationRole && organizationRole !== workspaceRole) {
      const roleRows = await db.select({ id: role.id }).from(role).where(eq(role.name, organizationRole)).limit(1);
      if (roleRows.length > 0) roleIds.push(roleRows[0].id);
    }
    if (roleIds.length === 0) return [];
    const rows = await db.select({ key: permission.key })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(sql`${rolePermission.roleId} = ANY(${roleIds})`);
    return rows.map(r => r.key);
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
