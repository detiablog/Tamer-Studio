import type { NavigationItem, NavigationMenu, NavigationPermissionCheck } from "./navigation.types";

export class PermissionAwareNavigation {
  private permissionChecks: Map<string, NavigationPermissionCheck> = new Map();
  private rolePermissions: Map<string, string[]> = new Map();
  private workspacePermissions: Map<string, string[]> = new Map();
  private organizationPermissions: Map<string, string[]> = new Map();
  private featureFlags: Map<string, boolean> = new Map();

  checkPermission(check: NavigationPermissionCheck): boolean {
    const key = this.buildCheckKey(check);
    this.permissionChecks.set(key, check);
    return check.result;
  }

  private buildCheckKey(check: NavigationPermissionCheck): string {
    return `${check.permission}:${check.role}:${check.workspace}:${check.organization}:${check.featureFlag}`;
  }

  canAccessItem(
    item: NavigationItem,
    context: {
      role?: string;
      permissions?: string[];
      workspace?: string;
      organization?: string;
      featureFlags?: string[];
    }
  ): boolean {
    if (item.permissions.length > 0 && context.permissions) {
      const hasPermission = item.permissions.some((p) => context.permissions!.includes(p));
      if (!hasPermission) return false;
    }

    if (item.featureFlags.length > 0 && context.featureFlags) {
      const allFlagsEnabled = item.featureFlags.every((flag) =>
        context.featureFlags!.includes(flag)
      );
      if (!allFlagsEnabled) return false;
    }

    if (item.workspaces.length > 0 && context.workspace) {
      if (!item.workspaces.includes(context.workspace)) return false;
    }

    if (item.organizations.length > 0 && context.organization) {
      if (!item.organizations.includes(context.organization)) return false;
    }

    return true;
  }

  filterItemsByPermission(
    items: NavigationItem[],
    context: {
      role?: string;
      permissions?: string[];
      workspace?: string;
      organization?: string;
      featureFlags?: string[];
    }
  ): NavigationItem[] {
    return items.filter((item) => this.canAccessItem(item, context));
  }

  filterMenuByPermission(
    menu: NavigationMenu,
    context: {
      role?: string;
      permissions?: string[];
      workspace?: string;
      organization?: string;
      featureFlags?: string[];
    }
  ): NavigationMenu {
    const filteredItems = this.filterItemsByPermission(menu.items, context);
    const filteredGroups = menu.groups.filter((group) => {
      if (group.permissions.length > 0 && context.permissions) {
        return group.permissions.some((p) => context.permissions!.includes(p));
      }
      return true;
    });
    return {
      ...menu,
      items: filteredItems,
      groups: filteredGroups.map((group) => ({
        ...group,
        items: this.filterItemsByPermission(group.items, context),
      })),
    };
  }

  registerRolePermissions(role: string, permissions: string[]): void {
    this.rolePermissions.set(role, permissions);
  }

  getRolePermissions(role: string): string[] {
    return this.rolePermissions.get(role) || [];
  }

  registerWorkspacePermissions(workspace: string, permissions: string[]): void {
    this.workspacePermissions.set(workspace, permissions);
  }

  getWorkspacePermissions(workspace: string): string[] {
    return this.workspacePermissions.get(workspace) || [];
  }

  registerOrganizationPermissions(organization: string, permissions: string[]): void {
    this.organizationPermissions.set(organization, permissions);
  }

  getOrganizationPermissions(organization: string): string[] {
    return this.organizationPermissions.get(organization) || [];
  }

  setFeatureFlag(flag: string, enabled: boolean): void {
    this.featureFlags.set(flag, enabled);
  }

  isFeatureFlagEnabled(flag: string): boolean {
    return this.featureFlags.get(flag) ?? false;
  }

  getActiveFeatureFlags(): string[] {
    return Array.from(this.featureFlags.entries())
      .filter(([, enabled]) => enabled)
      .map(([flag]) => flag);
  }

  getPermissionCheck(key: string): NavigationPermissionCheck | undefined {
    return this.permissionChecks.get(key);
  }

  getAllPermissionChecks(): NavigationPermissionCheck[] {
    return Array.from(this.permissionChecks.values());
  }

  clearPermissionChecks(): void {
    this.permissionChecks.clear();
  }
}

let permissionNavigationInstance: PermissionAwareNavigation | null = null;

export function getPermissionNavigation(): PermissionAwareNavigation {
  if (!permissionNavigationInstance) {
    permissionNavigationInstance = new PermissionAwareNavigation();
  }
  return permissionNavigationInstance;
}

export function resetPermissionNavigation(): void {
  permissionNavigationInstance = null;
}