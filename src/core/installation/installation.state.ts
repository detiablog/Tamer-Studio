import type {
  InstallationPhase,
  InstallationStatus,
  InstallationProgress,
  InstallationState,
  InstallationError,
} from "./installation.types";
import { INSTALLATION_PHASES } from "./installation.types";

export function createInitialState(): InstallationState {
  const now = new Date().toISOString();
  return {
    status: "not_started",
    currentPhase: INSTALLATION_PHASES[0],
    completedPhases: [],
    failedPhase: null,
    error: null,
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getPhaseIndex(phase: InstallationPhase): number {
  return INSTALLATION_PHASES.indexOf(phase);
}

export function getNextPhase(current: InstallationPhase): InstallationPhase | null {
  const idx = getPhaseIndex(current);
  if (idx < 0 || idx >= INSTALLATION_PHASES.length - 1) return null;
  return INSTALLATION_PHASES[idx + 1];
}

export function isPhaseCompleted(state: InstallationState, phase: InstallationPhase): boolean {
  return state.completedPhases.includes(phase);
}

export function canExecutePhase(state: InstallationState, phase: InstallationPhase): boolean {
  if (state.status === "completed") return false;
  if (state.status === "failed") return false;
  if (isPhaseCompleted(state, phase)) return false;

  const phaseIdx = getPhaseIndex(phase);
  if (phaseIdx <= 0) return true;

  const prevPhase = INSTALLATION_PHASES[phaseIdx - 1];
  return isPhaseCompleted(state, prevPhase);
}

export function markPhaseStarted(state: InstallationState, phase: InstallationPhase): InstallationState {
  return {
    ...state,
    status: "in_progress",
    currentPhase: phase,
    startedAt: state.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function markPhaseCompleted(state: InstallationState, phase: InstallationPhase): InstallationState {
  const completedPhases = [...state.completedPhases, phase];
  const nextPhase = getNextPhase(phase);
  const isComplete = nextPhase === null;

  return {
    ...state,
    status: isComplete ? "completed" : "in_progress",
    currentPhase: nextPhase ?? phase,
    completedPhases,
    failedPhase: null,
    error: null,
    completedAt: isComplete ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };
}

export function markPhaseFailed(
  state: InstallationState,
  phase: InstallationPhase,
  error: InstallationError
): InstallationState {
  return {
    ...state,
    status: "failed",
    currentPhase: phase,
    failedPhase: phase,
    error,
    updatedAt: new Date().toISOString(),
  };
}

export function stateToProgress(state: InstallationState): InstallationProgress {
  return {
    status: state.status,
    currentPhase: state.currentPhase,
    completedPhases: state.completedPhases,
    failedPhase: state.failedPhase,
    error: state.error,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
  };
}
