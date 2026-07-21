import type { PermissionResolution, RbacContext, RbacResult } from "./rbac.types";
import { RbacEngine } from "./rbac.engine";

export class RbacService {
  private engine = new RbacEngine();

  async resolvePermissions(context: RbacContext): Promise<PermissionResolution> {
    return this.engine.resolvePermissions(context);
  }

  async checkPermission(context: RbacContext): Promise<RbacResult> {
    return this.engine.checkPermission(context);
  }

  async hasPermission(userId: string, permission: string, workspaceId?: string, organizationId?: string): Promise<boolean> {
    return this.engine.hasPermission(userId, permission, workspaceId, organizationId);
  }
}
