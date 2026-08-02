/**
 * Admin RBAC — synchronized with RBAC architecture
 * 
 * Admin roles:
 *   admin    — Email/password, operational permissions only
 *   founder  — Master Key required, ALL system permissions
 * 
 * Permission separation:
 *   - Founder receives ALL permissions including system-critical ones
 *   - Admin receives operational permissions only (no system-critical)
 *   - Feature Flag controls availability, Permission controls authorization
 */

export type AdminPermission = string;

/**
 * Route-to-permission mapping for admin panel routes.
 * Used by useAdminPermissions() hook and authz middleware.
 */
export const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin": "admin:read",
  "/admin/users": "admin:users",
  "/admin/workspaces": "admin:workspaces",
  "/admin/ai-providers": "admin:ai_providers",
  "/admin/jobs": "admin:jobs",
  "/admin/queues": "admin:queues",
  "/admin/billing": "admin:billing",
  "/admin/subscriptions": "admin:subscriptions",
  "/admin/coupons": "admin:coupons",
  "/admin/analytics": "admin:analytics",
  "/admin/audit-logs": "admin:audit_logs",
  "/admin/feature-flags": "admin:feature_flags",
  "/admin/settings": "admin:system",
  "/admin/stats": "admin:stats",
  "/admin/cache": "admin:system",
  "/admin/email": "admin:email",
  "/admin/email/providers": "admin:email",
  "/admin/email/templates": "admin:email",
  "/admin/email/queue": "admin:email",
  "/admin/email/logs": "admin:email",
  "/admin/email/health": "admin:email",
  "/admin/email/statistics": "admin:email",
  "/admin/workflows": "admin:workflows",
  "/admin/pricing": "admin:pricing",
  "/admin/landing-builder": "admin:landing_builder",
  "/admin/commerce": "admin:commerce",
};

/**
 * Admin operational permissions — daily operations only.
 * Does NOT include system-critical permissions.
 */
const ADMIN_OPERATIONAL_PERMISSIONS = [
  "admin:read",
  "admin:users",
  "admin:workspaces",
  "admin:billing",
  "admin:subscriptions",
  "admin:coupons",
  "admin:analytics",
  "admin:email",
  "admin:write",
  "admin:commerce",
  "admin:workflows",
  "admin:pricing",
  "admin:landing_builder",
  "admin:stats",
];

/**
 * Founder system-critical permissions — only Founder gets these.
 * Includes: AI Provider config, Jobs, Queues, Audit Logs, Feature Flags, System Settings
 */
const FOUNDER_SYSTEM_PERMISSIONS = [
  "admin:ai_providers",
  "admin:jobs",
  "admin:queues",
  "admin:audit_logs",
  "admin:feature_flags",
  "admin:system",
];

/**
 * Role-to-permissions mapping for admin authentication.
 * 
 * Admin: Operational permissions only (daily operations).
 * Founder: ALL permissions (operational + system-critical).
 */
export const ADMIN_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [...ADMIN_OPERATIONAL_PERMISSIONS],
  founder: [...ADMIN_OPERATIONAL_PERMISSIONS, ...FOUNDER_SYSTEM_PERMISSIONS],
};
