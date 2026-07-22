export * from "./login";
export * from "./logout";
export * from "./session";
export * from "./verify";
export * from "./guards";
export * from "./audit";
export * from "./types";
export * from "./dashboard";
export * from "./system";
export * from "./settings";
export * from "./moderation";
export * from "./providers";
export * from "./operations";
export * from "./feature-flags";
export * from "./maintenance";

import { ServiceRegistry } from "@/core/foundation";
import type { DashboardService } from "./dashboard";
import type { SystemService } from "./system";
import type { SettingsService } from "./settings";
import type { ModerationService } from "./moderation";
import type { ProvidersService } from "./providers";
import type { OperationsService } from "./operations";
import type { FeatureFlagsService } from "./feature-flags";
import type { MaintenanceService } from "./maintenance";

export class AdminServices {
  static get dashboard() { return ServiceRegistry.get<DashboardService>("adminDashboardService"); }
  static get system() { return ServiceRegistry.get<SystemService>("adminSystemService"); }
  static get settings() { return ServiceRegistry.get<SettingsService>("adminSettingsService"); }
  static get moderation() { return ServiceRegistry.get<ModerationService>("adminModerationService"); }
  static get providers() { return ServiceRegistry.get<ProvidersService>("adminProvidersService"); }
  static get operations() { return ServiceRegistry.get<OperationsService>("adminOperationsService"); }
  static get featureFlags() { return ServiceRegistry.get<FeatureFlagsService>("adminFeatureFlagsService"); }
  static get maintenance() { return ServiceRegistry.get<MaintenanceService>("adminMaintenanceService"); }
}
