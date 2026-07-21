export interface PermissionResolution {
  userId: string;
  workspaceId?: string;
  organizationId?: string;
  permissions: string[];
  roles: string[];
  source: "system" | "workspace" | "organization" | "combined";
}

export interface RbacContext {
  userId: string;
  workspaceId?: string;
  organizationId?: string;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export interface RbacResult {
  allowed: boolean;
  permissions: string[];
  roles: string[];
  missingPermissions: string[];
}

export interface AccessPolicy {
  id: string;
  name: string;
  permissions: string[];
  effect: "allow" | "deny";
  resource?: string;
  action?: string;
  conditions?: Record<string, unknown>;
}
