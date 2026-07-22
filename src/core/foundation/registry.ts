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
import { TicketService } from "../tickets";
import { SupportService } from "../support";
import { KnowledgeService } from "../knowledge";
import { FeedbackService } from "../feedback";
import { CustomerService } from "../customer";
import { SLAService } from "../sla";
import { AttachmentService } from "../attachments";
import { InternalNoteService } from "../internal-notes";
import { DashboardService } from "../admin/dashboard";
import { SystemService } from "../admin/system";
import { SettingsService } from "../admin/settings";
import { ModerationService } from "../admin/moderation";
import { ProvidersService } from "../admin/providers";
import { OperationsService } from "../admin/operations";
import { FeatureFlagsService } from "../admin/feature-flags";
import { MaintenanceService } from "../admin/maintenance";

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
  ServiceRegistry.register("ticketService", () => new TicketService());
  ServiceRegistry.register("supportService", () => new SupportService());
  ServiceRegistry.register("knowledgeService", () => new KnowledgeService());
  ServiceRegistry.register("feedbackService", () => new FeedbackService());
  ServiceRegistry.register("customerService", () => new CustomerService());
  ServiceRegistry.register("slaService", () => new SLAService());
  ServiceRegistry.register("attachmentService", () => new AttachmentService());
  ServiceRegistry.register("internalNoteService", () => new InternalNoteService());

  ServiceRegistry.register("adminDashboardService", () => new DashboardService());
  ServiceRegistry.register("adminSystemService", () => new SystemService());
  ServiceRegistry.register("adminSettingsService", () => new SettingsService());
  ServiceRegistry.register("adminModerationService", () => new ModerationService());
  ServiceRegistry.register("adminProvidersService", () => new ProvidersService());
  ServiceRegistry.register("adminOperationsService", () => new OperationsService());
  ServiceRegistry.register("adminFeatureFlagsService", () => new FeatureFlagsService());
  ServiceRegistry.register("adminMaintenanceService", () => new MaintenanceService());
}
