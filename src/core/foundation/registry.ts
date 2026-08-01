import { container } from "./container";

export class ServiceRegistry {
  static register<T>(name: string, factory: () => T, scope: "singleton" | "scoped" | "transient" = "singleton", dependencies?: string[], replaceable = true): void {
    container.register({ name, factory, scope, dependencies, replaceable });
  }

  static get<T>(name: string): T {
    return container.resolve<T>(name);
  }

  static has(name: string): boolean {
    return container.has(name);
  }

  static getStats() {
    return container.getStats();
  }

  static setTestOverride<T>(name: string, mock: T): void {
    container.setTestOverride(name, mock);
  }

  static clearTestOverrides(): void {
    container.clearTestOverrides();
  }
}

export function initializeServices(): void {
  ServiceRegistry.register("container", () => container, "singleton", [], false);
  ServiceRegistry.register("lifecycle", () => require("./lifecycle").lifecycle, "singleton");
  ServiceRegistry.register("eventBus", () => require("../events").eventBus, "singleton");
  ServiceRegistry.register("identity", () => new (require("../identity").IdentityService)(), "singleton");
  ServiceRegistry.register("userService", () => new (require("../users").UserService)(), "singleton");
  ServiceRegistry.register("workspaceService", () => new (require("../workspace").WorkspaceService)(), "singleton");
  ServiceRegistry.register("roleService", () => new (require("../roles").RoleService)(), "singleton");
  ServiceRegistry.register("permissionService", () => new (require("../permissions").PermissionService)(), "singleton");
  ServiceRegistry.register("membershipService", () => new (require("../membership").MembershipService)(), "singleton");
  ServiceRegistry.register("apiKeyService", () => new (require("../apikey").ApiKeyService)(), "singleton");
  ServiceRegistry.register("rbacService", () => new (require("../rbac").RbacService)(), "singleton");
  ServiceRegistry.register("ticketService", () => new (require("../tickets").TicketService)(), "singleton");
  ServiceRegistry.register("supportService", () => new (require("../support").SupportService)(), "singleton");
  ServiceRegistry.register("knowledgeService", () => new (require("../knowledge").KnowledgeService)(), "singleton");
  ServiceRegistry.register("feedbackService", () => new (require("../feedback").FeedbackService)(), "singleton");
  ServiceRegistry.register("customerService", () => new (require("../customer").CustomerService)(), "singleton");
  ServiceRegistry.register("slaService", () => new (require("../sla").SLAService)(), "singleton");
  ServiceRegistry.register("attachmentService", () => new (require("../attachments").AttachmentService)(), "singleton");
  ServiceRegistry.register("internalNoteService", () => new (require("../internal-notes").InternalNoteService)(), "singleton");
  ServiceRegistry.register("adminDashboardService", () => new (require("../admin/dashboard").DashboardService)(), "singleton");
  ServiceRegistry.register("adminSystemService", () => new (require("../admin/system").SystemService)(), "singleton");
  ServiceRegistry.register("adminSettingsService", () => new (require("../admin/settings").SettingsService)(), "singleton");
  ServiceRegistry.register("adminModerationService", () => new (require("../admin/moderation").ModerationService)(), "singleton");
  ServiceRegistry.register("adminProvidersService", () => new (require("../admin/providers").ProvidersService)(), "singleton");
  ServiceRegistry.register("adminOperationsService", () => new (require("../admin/operations").OperationsService)(), "singleton");
  ServiceRegistry.register("adminFeatureFlagsService", () => new (require("../admin/feature-flags").FeatureFlagsService)(), "singleton");
  ServiceRegistry.register("adminMaintenanceService", () => new (require("../admin/maintenance").MaintenanceService)(), "singleton");
}
