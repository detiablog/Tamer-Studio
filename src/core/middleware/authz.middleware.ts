import type { Middleware, RequestContext, SecurityError } from "./types";
import { ADMIN_ROLE_PERMISSIONS } from "@/core/admin/rbac";
import { getEffectivePermissions } from "@/core/auth/permissions";
import type { AdminRole } from "@/core/admin/types";
import type { UserRole } from "@/core/auth/permissions";

export function requireAdminPermission(requiredPermission: string): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    if (!ctx.state.adminSession) {
      return {
        status: 401,
        message: "Admin session required",
      };
    }

    const role = ctx.state.adminSession.role as AdminRole;
    const permissions = ADMIN_ROLE_PERMISSIONS[role] || [];
    if (permissions.indexOf(requiredPermission) === -1) {
      return {
        status: 403,
        message: `Missing permission: ${requiredPermission}`,
      };
    }
  };
}

export function requireUserPermission(requiredPermission: string): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    if (!ctx.state.userSession) {
      return {
        status: 401,
        message: "User session required",
      };
    }

    const userRole = ctx.state.userSession.role as UserRole;
    const permissions = getEffectivePermissions(userRole);
    if ((permissions as readonly string[]).indexOf(requiredPermission) === -1) {
      return {
        status: 403,
        message: `Missing permission: ${requiredPermission}`,
      };
    }
  };
}

export function requireWorkspaceOwnership(resourceParam = "workspaceId"): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    if (!ctx.state.userSession) {
      return {
        status: 401,
        message: "User session required",
      };
    }

    const resourceId = ctx.params?.[resourceParam];
    if (!resourceId) {
      return {
        status: 400,
        message: `Missing ${resourceParam}`,
      };
    }

    const workspaceService = (await import("@/core/workspace/workspace.service")).WorkspaceService;
    const service = new workspaceService();
    const workspace = await service.getWorkspace(ctx.state.userSession.userId);

    if (!workspace || workspace.id !== resourceId) {
      return {
        status: 403,
        message: "Access denied: not your workspace",
      };
    }
  };
}

export function requireAnyRole(allowedRoles: string[]): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    const adminSession = ctx.state.adminSession;
    if (adminSession && allowedRoles.includes(adminSession.role)) {
      return;
    }

    const userSession = ctx.state.userSession;
    if (userSession && allowedRoles.includes(userSession.role)) {
      return;
    }

    return {
      status: 403,
      message: "Insufficient role privileges",
    };
  };
}
