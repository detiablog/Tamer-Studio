export type MaintenanceMode = "normal" | "read_only" | "maintenance" | "emergency";

export interface MaintenanceStatus {
  mode: MaintenanceMode;
  enabled: boolean;
  reason?: string;
  startedAt?: Date;
  scheduledEndAt?: Date;
  message?: string;
  allowAdminAccess: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  mode: MaintenanceMode;
  reason: string;
  message: string;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  status: "scheduled" | "active" | "completed" | "cancelled";
  createdBy: string;
  createdAt: Date;
}

export interface MaintenanceNotice {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  startAt: Date;
  endAt?: Date;
  active: boolean;
  createdAt: Date;
}

export interface EmergencyShutdownStatus {
  ready: boolean;
  gracefulShutdownInitiated: boolean;
  activeConnections: number;
  pendingJobs: number;
  shutdownInitiatedAt?: Date;
}
