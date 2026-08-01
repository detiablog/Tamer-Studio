import type { IdentityContext } from "./identity.types";
import type { UserRole, Permission } from "../auth/permissions";
import { getEffectivePermissions, hasPermission as checkPerm } from "../auth/permissions";

import { UserService } from "../users/user.service";
import { WorkspaceService } from "../workspace/workspace.service";
import { MembershipService } from "../membership/membership.service";
import { ApiKeyService } from "../apikey/apikey.service";

export class IdentityService {
  private userService = new UserService();
  private workspaceService = new WorkspaceService();
  private membershipService = new MembershipService();
  private apiKeyService = new ApiKeyService();

  async getIdentityContext(userId: string): Promise<IdentityContext> {
    const [profile, preferences, workspaces] = await Promise.all([
      this.userService.getProfile(userId),
      this.userService.getPreferences(userId),
      this.getUserWorkspaces(userId),
    ]);
    const user = await this.userService.getUserById(userId);
    const userRole: UserRole = (user?.role as UserRole) ?? "user";
    const permissions = getEffectivePermissions(userRole).map((p) => p as string);
    return {
      user: {
        id: userId,
        email: user?.email ?? "",
        name: user?.name ?? "",
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
      permissions,
      roles: [userRole],
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
    }] : [];
    return ownedWs;
  }

  async getAllUserRoles(_userId: string): Promise<string[]> {
    return [];
  }

  async checkPermission(userId: string, permission: string, _workspaceId?: string, _organizationId?: string): Promise<{ allowed: boolean; roles: string[]; permissions: string[] }> {
    const user = await this.userService.getUserById(userId);
    const userRole: UserRole = (user?.role as UserRole) ?? "user";
    const permissions = getEffectivePermissions(userRole).map((p) => p as string);
    const allowed = permissions.includes(permission);
    return { allowed, roles: [userRole], permissions };
  }

  async hasPermission(userId: string, permission: string, _workspaceId?: string, _organizationId?: string): Promise<boolean> {
    const user = await this.userService.getUserById(userId);
    const userRole: UserRole = (user?.role as UserRole) ?? "user";
    return checkPerm(userRole, permission as Permission);
  }
}
