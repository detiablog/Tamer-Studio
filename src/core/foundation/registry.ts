import { container } from "./container";
import { lifecycle } from "./lifecycle";
import { IdentityService } from "../identity";
import { UserService } from "../users";
import { WorkspaceService } from "../workspace";
import { OrganizationService } from "../organization";
import { RoleService } from "../roles";
import { PermissionService } from "../permissions";
import { MembershipService } from "../membership";
import { ApiKeyService } from "../apikey";
import { RbacService } from "../rbac";
import { eventBus } from "../events";

export class ServiceRegistry {
  static register(name: string, factory: () => unknown): void {
    const instance = factory();
    container.register(name, instance);
  }

  static get<T>(name: string): T {
    return container.resolve<T>(name);
  }

  static has(name: string): boolean {
    return container.has(name);
  }
}

export function initializeServices(): void {
  ServiceRegistry.register("container", () => container);
  ServiceRegistry.register("lifecycle", () => lifecycle);
  ServiceRegistry.register("eventBus", () => eventBus);
  ServiceRegistry.register("identity", () => new IdentityService());
  ServiceRegistry.register("userService", () => new UserService());
  ServiceRegistry.register("workspaceService", () => new WorkspaceService());
  ServiceRegistry.register("organizationService", () => new OrganizationService());
  ServiceRegistry.register("roleService", () => new RoleService());
  ServiceRegistry.register("permissionService", () => new PermissionService());
  ServiceRegistry.register("membershipService", () => new MembershipService());
  ServiceRegistry.register("apiKeyService", () => new ApiKeyService());
  ServiceRegistry.register("rbacService", () => new RbacService());
}
