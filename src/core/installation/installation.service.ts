import { logger } from "@/core/logger";
import type {
  InstallationPhase,
  InstallationProgress,
  InstallationState,
  AdminCreationInput,
  StepResult,
} from "./installation.types";
import { PHASE_DESCRIPTIONS } from "./installation.types";
import {
  loadState,
  saveState,
  isInstalled,
  migrateToFileToDb,
} from "./installation.repository";
import {
  createInitialState,
  markPhaseStarted,
  markPhaseCompleted,
  markPhaseFailed,
  stateToProgress,
  canExecutePhase,
} from "./installation.state";

export class InstallationService {
  getState(): InstallationProgress {
    const state = loadState();
    return stateToProgress(state);
  }

  isInstalled(): boolean {
    return isInstalled();
  }

  async runFullInstallation(adminInput?: AdminCreationInput): Promise<InstallationProgress> {
    const state = loadState();

    if (state.status === "completed") {
      logger.info("Installation already complete");
      return stateToProgress(state);
    }

    let current = state.status === "not_started" ? createInitialState() : state;

    if (current.status === "failed") {
      logger.info("Resuming installation from failed state", {
        failedPhase: current.failedPhase,
      });
      current = {
        ...current,
        status: "in_progress",
        failedPhase: null,
        error: null,
      };
    }

    const phases: InstallationPhase[] = [
      "env_validation",
      "config_validation",
      "database_migration",
      "foundation_init",
      "event_runtime_init",
      "navigation_init",
      "admin_creation",
      "roles_init",
      "permissions_init",
      "commerce_init",
      "landing_init",
      "settings_init",
      "localization_init",
      "complete",
    ];

    for (const phase of phases) {
      if (!canExecutePhase(current, phase)) {
        if (current.completedPhases.includes(phase)) continue;
        break;
      }

      current = markPhaseStarted(current, phase);
      saveState(current);

      logger.info(PHASE_DESCRIPTIONS[phase], { phase });

      const result = await this.executePhase(phase, current, adminInput);

      if (!result.success) {
        current = markPhaseFailed(current, phase, result.error!);
        saveState(current);
        logger.error(`Installation failed at ${phase}`, new Error(result.error?.message || "Unknown error"));
        return stateToProgress(current);
      }

      current = markPhaseCompleted(current, phase);
      saveState(current);
      logger.info(`Completed: ${PHASE_DESCRIPTIONS[phase]}`, { phase });

      if (phase === "database_migration") {
        migrateToFileToDb();
        logger.info("Installation state migrated from file to database");
      }
    }

    return stateToProgress(current);
  }

  private async executePhase(
    phase: InstallationPhase,
    state: InstallationState,
    adminInput?: AdminCreationInput
  ): Promise<StepResult> {
    switch (phase) {
      case "env_validation":
        return this.stepValidateEnv();
      case "config_validation":
        return this.stepValidateConfig();
      case "database_migration":
        return this.stepRunMigrations();
      case "foundation_init":
        return this.stepInitFoundation();
      case "event_runtime_init":
        return this.stepInitEventRuntime();
      case "navigation_init":
        return this.stepInitNavigation();
      case "admin_creation":
        return this.stepCreateAdmin(adminInput);
      case "roles_init":
        return this.stepInitRoles();
      case "permissions_init":
        return this.stepInitPermissions();
      case "commerce_init":
        return this.stepInitCommerce();
      case "landing_init":
        return this.stepInitLanding();
      case "settings_init":
        return this.stepInitSettings();
      case "localization_init":
        return this.stepInitLocalization();
      case "complete":
        return { success: true };
      default:
        return {
          success: false,
          error: {
            phase,
            message: `Unknown phase: ${phase}`,
          },
        };
    }
  }

  private async stepValidateEnv(): Promise<StepResult> {
    try {
      const { validateEnv } = await import("@/core/config/env");
      validateEnv();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "env_validation",
          message: err instanceof Error ? err.message : "Environment validation failed",
        },
      };
    }
  }

  private async stepValidateConfig(): Promise<StepResult> {
    try {
      const { loadConfig } = await import("@/core/config/config");
      loadConfig();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "config_validation",
          message: err instanceof Error ? err.message : "Configuration validation failed",
        },
      };
    }
  }

  private async stepRunMigrations(): Promise<StepResult> {
    try {
      const { runMigrations } = await import("@/core/database");
      const result = await runMigrations();
      if (!result.success) {
        return {
          success: false,
          error: {
            phase: "database_migration",
            message: result.error || "Database migration failed",
          },
        };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "database_migration",
          message: err instanceof Error ? err.message : "Database migration failed",
        },
      };
    }
  }

  private async stepInitFoundation(): Promise<StepResult> {
    try {
      const { bootstrap } = await import("@/core/foundation/bootstrap");
      await bootstrap();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "foundation_init",
          message: err instanceof Error ? err.message : "Foundation initialization failed",
        },
      };
    }
  }

  private async stepInitEventRuntime(): Promise<StepResult> {
    try {
      const { bootstrapEventRuntime } = await import("@/lib/bootstrap");
      await bootstrapEventRuntime();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "event_runtime_init",
          message: err instanceof Error ? err.message : "Event runtime initialization failed",
        },
      };
    }
  }

  private async stepInitNavigation(): Promise<StepResult> {
    try {
      const { bootstrapNavigation } = await import(
        "@/core/navigation/navigation-bootstrap"
      );
      bootstrapNavigation();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "navigation_init",
          message: err instanceof Error ? err.message : "Navigation initialization failed",
        },
      };
    }
  }

  private async stepCreateAdmin(input?: AdminCreationInput): Promise<StepResult> {
    try {
      if (!input?.email || !input?.password) {
        return {
          success: false,
          error: {
            phase: "admin_creation",
            message: "Admin email and password are required",
          },
        };
      }

      const { bootstrapFounder } = await import("@/core/admin/admin-bootstrap.service");
      const result = await bootstrapFounder(input);

      if (!result.success) {
        return {
          success: false,
          error: {
            phase: "admin_creation",
            message: result.error ?? "Founder creation failed",
          },
        };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "admin_creation",
          message: err instanceof Error ? err.message : "Founder creation failed",
        },
      };
    }
  }

  private async stepInitRoles(): Promise<StepResult> {
    try {
      const { db } = await import("@/lib/db");
      const { role } = await import("@/lib/db/schema/identity");
      const { randomUUID } = await import("crypto");

      const existingRoles = await db.select().from(role).limit(5);
      if (existingRoles.length > 0) {
        logger.info("Roles already exist, skipping initialization");
        return { success: true };
      }

      const founderRoleId = `role_${randomUUID()}`;
      const adminRoleId = `role_${randomUUID()}`;
      const userRoleId = `role_${randomUUID()}`;

      await db.insert(role).values([
        {
          id: founderRoleId,
          name: "Founder",
          description: "Platform founder — created during installation, cannot be deleted or demoted",
          level: "3",
          isSystem: true,
        },
        {
          id: adminRoleId,
          name: "Admin",
          description: "Administrator — email/password authentication, database-driven permissions",
          level: "2",
          isSystem: true,
        },
        {
          id: userRoleId,
          name: "User",
          description: "Standard user — capabilities depend on subscription, credits, and permissions",
          level: "1",
          isSystem: true,
        },
      ]);

      logger.audit("System roles initialized", { founderRoleId, adminRoleId, userRoleId });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "roles_init",
          message: err instanceof Error ? err.message : "Roles initialization failed",
        },
      };
    }
  }

  private async stepInitPermissions(): Promise<StepResult> {
    try {
      const { db } = await import("@/lib/db");
      const { permission, rolePermission, role } = await import("@/lib/db/schema/identity");
      const { randomUUID } = await import("crypto");

      const existingPerms = await db.select().from(permission).limit(5);
      if (existingPerms.length > 0) {
        logger.info("Permissions already exist, skipping initialization");
        return { success: true };
      }

      /**
       * Permission seeding follows the RBAC architecture:
       * 
       * Founder receives ALL system permissions:
       *   - User-level: dashboard, workspace, project, media, production, ai, publishing, settings, billing
       *   - Admin operational: admin:read, admin:users, admin:workspaces, admin:billing, etc.
       *   - Admin system-critical: admin:system, admin:feature_flags, admin:audit_logs, etc.
       * 
       * Admin receives operational permissions only:
       *   - User-level: same as Founder
       *   - Admin operational: admin:read, admin:users, admin:workspaces, admin:billing, etc.
       *   - NO system-critical permissions
       * 
       * User receives user-level permissions only (enforced via TypeScript ROLE_PERMISSIONS).
       * Guest receives no permissions (virtual role).
       */

      // User-level permissions
      const userPermissions = [
        { key: "dashboard:read", description: "Read dashboard", category: "user" },
        { key: "workspace:read", description: "Read workspace", category: "user" },
        { key: "workspace:write", description: "Write workspace", category: "user" },
        { key: "workspace:admin", description: "Admin workspace", category: "user" },
        { key: "project:read", description: "Read projects", category: "user" },
        { key: "project:write", description: "Write projects", category: "user" },
        { key: "project:admin", description: "Admin projects", category: "user" },
        { key: "media:read", description: "Read media", category: "user" },
        { key: "media:write", description: "Write media", category: "user" },
        { key: "media:admin", description: "Admin media", category: "user" },
        { key: "production:read", description: "Read production", category: "user" },
        { key: "production:write", description: "Write production", category: "user" },
        { key: "production:admin", description: "Admin production", category: "user" },
        { key: "ai:read", description: "Read AI", category: "user" },
        { key: "ai:write", description: "Write AI", category: "user" },
        { key: "ai:admin", description: "Admin AI", category: "user" },
        { key: "publishing:read", description: "Read publishing", category: "user" },
        { key: "publishing:write", description: "Write publishing", category: "user" },
        { key: "publishing:admin", description: "Admin publishing", category: "user" },
        { key: "settings:read", description: "Read settings", category: "user" },
        { key: "settings:write", description: "Write settings", category: "user" },
        { key: "settings:admin", description: "Admin settings", category: "user" },
        { key: "billing:read", description: "Read billing", category: "user" },
        { key: "billing:write", description: "Write billing", category: "user" },
        { key: "billing:admin", description: "Admin billing", category: "user" },
      ];

      // Admin operational permissions (daily operations)
      const adminOperationalPermissions = [
        { key: "admin:read", description: "Read admin panel", category: "admin" },
        { key: "admin:write", description: "Write admin panel", category: "admin" },
        { key: "admin:users", description: "Manage users", category: "admin" },
        { key: "admin:workspaces", description: "Manage workspaces", category: "admin" },
        { key: "admin:billing", description: "Manage billing", category: "admin" },
        { key: "admin:subscriptions", description: "Manage subscriptions", category: "admin" },
        { key: "admin:coupons", description: "Manage coupons", category: "admin" },
        { key: "admin:analytics", description: "View analytics", category: "admin" },
        { key: "admin:email", description: "Manage email", category: "admin" },
        { key: "admin:commerce", description: "Manage commerce", category: "admin" },
        { key: "admin:workflows", description: "Manage workflows", category: "admin" },
        { key: "admin:pricing", description: "Manage pricing", category: "admin" },
        { key: "admin:landing_builder", description: "Manage landing pages", category: "admin" },
        { key: "admin:stats", description: "View statistics", category: "admin" },
      ];

      // Founder system-critical permissions (Founder-only)
      const founderSystemPermissions = [
        { key: "admin:ai_providers", description: "Manage AI providers", category: "founder" },
        { key: "admin:jobs", description: "Manage background jobs", category: "founder" },
        { key: "admin:queues", description: "Manage job queues", category: "founder" },
        { key: "admin:audit_logs", description: "View audit logs", category: "founder" },
        { key: "admin:feature_flags", description: "Manage feature flags", category: "founder" },
        { key: "admin:system", description: "System settings", category: "founder" },
      ];

      const allPermissions = [...userPermissions, ...adminOperationalPermissions, ...founderSystemPermissions];

      const permIds = await db.insert(permission).values(
        allPermissions.map((p) => ({ id: `perm_${randomUUID()}`, ...p }))
      ).returning({ id: permission.id });

      const roles = await db.select().from(role);
      const founderRole = roles.find((r) => r.name === "Founder");
      const adminRole = roles.find((r) => r.name === "Admin");

      // Founder gets ALL permissions (user + admin operational + system-critical)
      if (founderRole) {
        await db.insert(rolePermission).values(
          permIds.map((pid) => ({
            id: `rp_${randomUUID()}`,
            roleId: founderRole.id,
            permissionId: pid.id,
          }))
        );
      }

      // Admin gets only user + operational permissions (NO system-critical)
      if (adminRole) {
        // Get the actual permission IDs for user and admin categories
        const adminPermIds = permIds.filter((pid, index) => {
          return index < userPermissions.length + adminOperationalPermissions.length;
        });
        
        await db.insert(rolePermission).values(
          adminPermIds.map((pid) => ({
            id: `rp_${randomUUID()}`,
            roleId: adminRole.id,
            permissionId: pid.id,
          }))
        );
      }

      logger.audit("System permissions initialized", {
        permissionCount: permIds.length,
        founderRoleId: founderRole?.id,
        adminRoleId: adminRole?.id,
        userPermissionCount: userPermissions.length,
        adminOperationalCount: adminOperationalPermissions.length,
        founderSystemCount: founderSystemPermissions.length,
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "permissions_init",
          message: err instanceof Error ? err.message : "Permissions initialization failed",
        },
      };
    }
  }

  private async stepInitCommerce(): Promise<StepResult> {
    try {
      const { ensureSeeded } = await import("@/core/commerce/seed");
      await ensureSeeded();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: {
          phase: "commerce_init",
          message: err instanceof Error ? err.message : "Commerce initialization failed",
        },
      };
    }
  }

  private async stepInitLanding(): Promise<StepResult> {
    try {
      const { seedLandingSections } = await import("@/core/landing");
      const result = await seedLandingSections();
      if (!result.success) {
        return {
          success: false,
          error: {
            phase: "landing_init",
            message: result.error ?? "Landing seed failed",
          },
        };
      }
      return { success: true };
    } catch (err) {
      logger.warn("Landing seed failed, skipping", {
        error: err instanceof Error ? err.message : String(err),
      });
      return { success: true };
    }
  }

  private async stepInitSettings(): Promise<StepResult> {
    try {
      const { SettingsService } = await import(
        "@/core/admin/settings/settings.service"
      );
      const service = new SettingsService();
      await service.getSettings();
      return { success: true };
    } catch (err) {
      logger.warn("Settings initialization skipped (in-memory defaults active)", {
        error: err instanceof Error ? err.message : String(err),
      });
      return { success: true };
    }
  }

  private async stepInitLocalization(): Promise<StepResult> {
    try {
      const { regionService } = await import("@/core/localization/region.service");
      await regionService.adminGetSettings();
      return { success: true };
    } catch (err) {
      logger.warn("Localization initialization skipped (defaults active)", {
        error: err instanceof Error ? err.message : String(err),
      });
      return { success: true };
    }
  }

  async getProgress(): Promise<InstallationProgress> {
    return this.getState();
  }

  async reset(): Promise<void> {
    const { clearState } = await import("./installation.repository");
    clearState();
    logger.info("Installation state reset");
  }
}

export const installationService = new InstallationService();
