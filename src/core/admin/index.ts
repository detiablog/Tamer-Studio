export * from "./login";
export * from "./logout";
export * from "./session";
export * from "./verify";
export * from "./guards";
export * from "./cookies";
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

import { DashboardService } from "./dashboard";
import { SystemService } from "./system";
import { SettingsService } from "./settings";
import { ModerationService } from "./moderation";
import { ProvidersService } from "./providers";
import { OperationsService } from "./operations";
import { FeatureFlagsService } from "./feature-flags";
import { MaintenanceService } from "./maintenance";

export class AdminServices {
  static dashboard = new DashboardService();
  static system = new SystemService();
  static settings = new SettingsService();
  static moderation = new ModerationService();
  static providers = new ProvidersService();
  static operations = new OperationsService();
  static featureFlags = new FeatureFlagsService();
  static maintenance = new MaintenanceService();
}
