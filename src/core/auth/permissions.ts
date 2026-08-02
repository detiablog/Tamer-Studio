/**
 * RBAC Architecture — Single Source of Truth
 * 
 * Four System Roles:
 *   Guest  (level 0) — Unauthenticated visitor. Public access only.
 *   User   (level 1) — Authenticated customer. User-level permissions.
 *   Admin  (level 2) — Admin panel access. Operational permissions only.
 *   Founder (level 3) — Created during installation only. ALL system permissions.
 *                        Unique, cannot be deleted/demoted, requires Master Key.
 * 
 * Permission Separation:
 *   - Feature Flag → Controls feature availability (is the feature turned on?)
 *   - Permission   → Controls feature authorization (is the user allowed to use it?)
 *   - Required flow: Feature Enabled → Permission Granted → Access Allowed
 *   - Never allow Role alone to control feature visibility.
 */

export type UserRole = "guest" | "user" | "admin" | "founder";

/**
 * All system permissions organized by category.
 * 
 * Categories:
 *   - User-level: dashboard, workspace, project, media, production, ai, publishing, settings, billing
 *   - Admin operational: admin:read, admin:users, admin:workspaces, admin:billing, etc.
 *   - Admin system-critical (Founder-only): admin:system, admin:feature_flags, admin:audit_logs, etc.
 */
export type Permission =
  // User-level permissions (available to User, Admin, Founder)
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
  // Admin operational permissions (available to Admin, Founder)
  | "admin:read"
  | "admin:write"
  | "admin:users"
  | "admin:workspaces"
  | "admin:billing"
  | "admin:subscriptions"
  | "admin:coupons"
  | "admin:analytics"
  | "admin:email"
  | "admin:commerce"
  | "admin:workflows"
  | "admin:pricing"
  | "admin:landing_builder"
  | "admin:stats"
  // Admin system-critical permissions (Founder-only)
  | "admin:ai_providers"
  | "admin:jobs"
  | "admin:queues"
  | "admin:audit_logs"
  | "admin:feature_flags"
  | "admin:system";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  admin: 2,
  founder: 3,
};

/**
 * Default permissions for each role.
 * 
 * Founder receives ALL system permissions — the only role with full system access.
 * Admin receives operational permissions only — daily operations, not system-critical.
 * User receives user-level permissions only — standard customer capabilities.
 * Guest receives no permissions — public access only.
 * 
 * Permission assignment must remain database-driven.
 * Do not hardcode permission rules in business logic.
 */
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

  /**
   * Admin — Operational permissions only.
   * 
   * Allowed by default:
   *   Dashboard, Users, Landing Builder, CMS, Commerce, Pricing, Coupons,
   *   Analytics, Email, Projects, Workflows, Jobs, Queues
   * 
   * Restricted by default (Founder-only):
   *   System Settings, Recovery, Installation, Master Key, Secret Management,
   *   Environment, AI Provider Configuration, Feature Flag Management,
   *   Audit Log Management, Database Maintenance
   * 
   * Founder may manually grant additional permissions later.
   */
  admin: [
    // User-level permissions
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
    // Admin operational permissions
    "admin:read",
    "admin:write",
    "admin:users",
    "admin:workspaces",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:email",
    "admin:commerce",
    "admin:workflows",
    "admin:pricing",
    "admin:landing_builder",
    "admin:stats",
  ],

  /**
   * Founder — ALL system permissions.
   * 
   * Founder is the only role allowed to perform:
   *   System configuration, Master Key verification, Recovery mode,
   *   Installation management, Security configuration, Environment management,
   *   Feature management, AI Provider management, Secret management,
   *   Audit Log management, Database maintenance, License management.
   * 
   * Founder is always the highest privilege role.
   */
  founder: [
    // User-level permissions
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
    // Admin operational permissions
    "admin:read",
    "admin:write",
    "admin:users",
    "admin:workspaces",
    "admin:billing",
    "admin:subscriptions",
    "admin:coupons",
    "admin:analytics",
    "admin:email",
    "admin:commerce",
    "admin:workflows",
    "admin:pricing",
    "admin:landing_builder",
    "admin:stats",
    // Admin system-critical permissions (Founder-only)
    "admin:ai_providers",
    "admin:jobs",
    "admin:queues",
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
