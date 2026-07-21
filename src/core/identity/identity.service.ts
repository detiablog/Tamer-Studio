import type { IdentityContext } from "./identity.types";
import type { RbacResult } from "../rbac/rbac.types";

import { UserService } from "../users/user.service";
import { WorkspaceService } from "../workspace/workspace.service";
import { OrganizationService } from "../organization/organization.service";
import { RoleService } from "../roles/role.service";
import { PermissionService } from "../permissions/permission.service";
import { MembershipService } from "../membership/membership.service";
import { ApiKeyService } from "../apikey/apikey.service";
import { RbacService } from "../rbac/rbac.service";

export class IdentityService {
  private userService = new UserService();
  private workspaceService = new WorkspaceService();
  private organizationService = new OrganizationService();
  private roleService = new RoleService();
  private permissionService = new PermissionService();
  private membershipService = new MembershipService();
  private apiKeyService = new ApiKeyService();
  private rbacService = new RbacService();

  async getIdentityContext(userId: string): Promise<IdentityContext> {
    const [profile, preferences, workspaces, organizations, permissionResolution] = await Promise.all([
      this.userService.getProfile(userId),
      this.userService.getPreferences(userId),
      this.getUserWorkspaces(userId),
      this.getUserOrganizations(userId),
      this.rbacService.resolvePermissions({ userId }),
    ]);
    return {
      user: {
        id: userId,
        email: "",
        name: "",
      },
      profile: profile ? {
        avatar: profile.avatar,
        timezone: profile.timezone,
        language: profile.language,
        country: profile.country,
        status: profile.status,
        verificationStatus: profile.verificationStatus,
      } : null,
      preferences: preferences?.preferences ?? null,
      workspaces,
      organizations,
      permissions: permissionResolution.permissions,
      roles: permissionResolution.roles,
    };
  }

  async getUserWorkspaces(userId: string): Promise<IdentityContext["workspaces"]> {
    const owned = await this.workspaceService.getWorkspace(userId);
    const ownedWs = owned ? [{
      id: owned.id,
      name: owned.name,
      slug: owned.slug,
      type: owned.type,
      role: "owner",
      organizationId: owned.organizationId,
    }] : [];
    return ownedWs;
  }

  async getUserOrganizations(userId: string): Promise<IdentityContext["organizations"]> {
    const owned = await this.organizationService.getOrganization(userId);
    const ownedOrgs = owned ? [{
      id: owned.id,
      name: owned.name,
      slug: owned.slug,
      role: "owner",
    }] : [];
    return ownedOrgs;
  }

  async getAllUserRoles(_userId: string): Promise<string[]> {
    return [];
  }

  async checkPermission(userId: string, permission: string, workspaceId?: string, organizationId?: string): Promise<RbacResult> {
    return this.rbacService.checkPermission({ userId, workspaceId, organizationId, requiredPermission: permission });
  }

  async hasPermission(userId: string, permission: string, workspaceId?: string, organizationId?: string): Promise<boolean> {
    return this.rbacService.hasPermission(userId, permission, workspaceId, organizationId);
  }
}
