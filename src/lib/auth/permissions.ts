export type UserRole = "guest" | "user" | "workspace_admin" | "organization_admin" | "system_admin" | "super_admin";

export type Permission =
  | "dashboard:read"
  | "workspace:read"
  | "workspace:write"
  | "workspace:admin"
  | "project:read"
  | "project:write"
  | "project:admin"
  | "media:read"
  | "media:write"
  | "media:admin"
  | "production:read"
  | "production:write"
  | "production:admin"
  | "ai:read"
  | "ai:write"
  | "ai:admin"
  | "publishing:read"
  | "publishing:write"
  | "publishing:admin"
  | "settings:read"
  | "settings:write"
  | "settings:admin"
  | "billing:read"
  | "billing:write"
  | "billing:admin"
  | "admin:read"
  | "admin:write"
  | "admin:users"
  | "admin:organizations"
  | "admin:workspaces"
  | "admin:ai_providers"
  | "admin:jobs"
  | "admin:queues"
  | "admin:billing"
  | "admin:subscriptions"
  | "admin:coupons"
  | "admin:analytics"
  | "admin:audit_logs"
  | "admin:feature_flags"
  | "admin:system";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  workspace_admin: 2,
  organization_admin: 3,
  system_admin: 4,
  super_admin: 5,
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [],

  user: [
    "dashboard:read",
    "workspace:read",
    "workspace:write",
    "project:read",
    "project:write",
    "media:read",
    "media:write",
    "production:read",
    "production:write",
    "ai:read",
    "ai:write",
    "publishing:read",
    "publishing:write",
    "settings:read",
    "settings:write",
    "billing:read",
    "billing:write",
  ],

  workspace_admin: [
    "dashboard:read",
    "workspace:read",
    "workspace:write",
    "workspace:admin",
    "project:read",
    "project:write",
    "project:admin",
    "media:read",
    "media:write",
    "media:admin",
    "production:read",
    "production:write",
    "production:admin",
    "ai:read",
    "ai:write",
    "ai:admin",
    "publishing:read",
    "publishing:write",
    "publishing:admin",
    "settings:read",
    "settings:write",
    "settings:admin",
    "billing:read",
    "billing:write",
    "billing:admin",
  ],

  organization_admin: [
    "dashboard:read",
    "workspace:read",
    "workspace:write",
    "workspace:admin",
    "project:read",
    "project:write",
    "project:admin",
    "media:read",
    "media:write",
    "media:admin",
    "production:read",
    "production:write",
    "production:admin",
    "ai:read",
    "ai:write",
    "ai:admin",
    "publishing:read",
    "publishing:write",
    "publishing:admin",
    "settings:read",
    "settings:write",
    "settings:admin",
    "billing:read",
    "billing:write",
    "billing:admin",
    "admin:read",
    "admin:write",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
  ],

  system_admin: [
    "dashboard:read",
    "workspace:read",
    "workspace:write",
    "workspace:admin",
    "project:read",
    "project:write",
    "project:admin",
    "media:read",
    "media:write",
    "media:admin",
    "production:read",
    "production:write",
    "production:admin",
    "ai:read",
    "ai:write",
    "ai:admin",
    "publishing:read",
    "publishing:write",
    "publishing:admin",
    "settings:read",
    "settings:write",
    "settings:admin",
    "billing:read",
    "billing:write",
    "billing:admin",
    "admin:read",
    "admin:write",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:audit_logs",
    "admin:feature_flags",
    "admin:system",
  ],

  super_admin: [
    "dashboard:read",
    "workspace:read",
    "workspace:write",
    "workspace:admin",
    "project:read",
    "project:write",
    "project:admin",
    "media:read",
    "media:write",
    "media:admin",
    "production:read",
    "production:write",
    "production:admin",
    "ai:read",
    "ai:write",
    "ai:admin",
    "publishing:read",
    "publishing:write",
    "publishing:admin",
    "settings:read",
    "settings:write",
    "settings:admin",
    "billing:read",
    "billing:write",
    "billing:admin",
    "admin:read",
    "admin:write",
    "admin:users",
    "admin:organizations",
    "admin:workspaces",
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:audit_logs",
    "admin:feature_flags",
    "admin:system",
  ],
};

export function getEffectivePermissions(role: UserRole): Permission[] {
  const roleLevel = ROLE_HIERARCHY[role] ?? 0;
  const effective = new Set<Permission>();

  for (const [r, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= roleLevel) {
      const perms = ROLE_PERMISSIONS[r as UserRole];
      if (perms) {
        perms.forEach((p) => effective.add(p));
      }
    }
  }

  return Array.from(effective);
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const effective = getEffectivePermissions(role);
  return effective.includes(permission);
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

export function getHighestRole(roles: UserRole[]): UserRole {
  return roles.reduce((highest, role) => {
    const roleLevel = ROLE_HIERARCHY[role] ?? 0;
    const highestLevel = ROLE_HIERARCHY[highest] ?? 0;
    return roleLevel > highestLevel ? role : highest;
  }, roles[0] ?? "guest");
}
