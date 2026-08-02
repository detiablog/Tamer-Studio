export { InstallationService, installationService } from "./installation.service";
export { loadState, saveState, clearState, isInstalled, loadFileState, saveFileState, clearFileState, loadDbState, saveDbState, migrateToFileToDb } from "./installation.repository";
export {
  createInitialState,
  getPhaseIndex,
  getNextPhase,
  isPhaseCompleted,
  canExecutePhase,
  markPhaseStarted,
  markPhaseCompleted,
  markPhaseFailed,
  stateToProgress,
} from "./installation.state";
export type {
  InstallationPhase,
  InstallationStatus,
  InstallationProgress,
  InstallationState,
  InstallationError,
  AdminCreationInput,
  StepResult,
} from "./installation.types";
export { INSTALLATION_PHASES, PHASE_DESCRIPTIONS } from "./installation.types";
