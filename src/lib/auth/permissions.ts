export type UserRole = "user" | "admin" | "super_admin";

export type Permission =
  | "dashboard:read"
  | "workspace:read"
  | "workspace:write"
  | "project:read"
  | "project:write"
  | "media:read"
  | "media:write"
  | "production:read"
  | "production:write"
  | "ai:read"
  | "ai:write"
  | "publishing:read"
  | "publishing:write"
  | "settings:read"
  | "settings:write"
  | "billing:read"
  | "billing:write"
  | "admin:read"
  | "admin:write";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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
  admin: [
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
    "admin:read",
    "admin:write",
  ],
  super_admin: [
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
    "admin:read",
    "admin:write",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
