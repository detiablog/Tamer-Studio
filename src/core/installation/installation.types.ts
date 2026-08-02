export type InstallationPhase =
  | "env_validation"
  | "config_validation"
  | "database_migration"
  | "foundation_init"
  | "event_runtime_init"
  | "navigation_init"
  | "admin_creation"
  | "roles_init"
  | "permissions_init"
  | "commerce_init"
  | "landing_init"
  | "settings_init"
  | "localization_init"
  | "complete";

export type InstallationStatus = "not_started" | "in_progress" | "completed" | "failed";

export interface InstallationProgress {
  status: InstallationStatus;
  currentPhase: InstallationPhase;
  completedPhases: InstallationPhase[];
  failedPhase: InstallationPhase | null;
  error: InstallationError | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface InstallationError {
  phase: InstallationPhase;
  message: string;
  details?: Record<string, unknown>;
}

export interface StepResult<T = void> {
  success: boolean;
  data?: T;
  error?: InstallationError;
}

export interface AdminCreationInput {
  email: string;
  password: string;
  name?: string;
}

export interface InstallationState {
  status: InstallationStatus;
  currentPhase: InstallationPhase;
  completedPhases: InstallationPhase[];
  failedPhase: InstallationPhase | null;
  error: InstallationError | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const INSTALLATION_PHASES: InstallationPhase[] = [
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

export const PHASE_DESCRIPTIONS: Record<InstallationPhase, string> = {
  env_validation: "Validating environment variables",
  config_validation: "Validating application configuration",
  database_migration: "Running database migrations",
  foundation_init: "Initializing application foundation",
  event_runtime_init: "Initializing event runtime",
  navigation_init: "Initializing navigation system",
  admin_creation: "Creating administrator account",
  roles_init: "Initializing system roles",
  permissions_init: "Initializing system permissions",
  commerce_init: "Initializing commerce plans",
  landing_init: "Initializing landing page content",
  settings_init: "Initializing default settings",
  localization_init: "Initializing localization defaults",
  complete: "Installation complete",
};
