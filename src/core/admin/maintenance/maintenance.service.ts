import type { MaintenanceMode, MaintenanceStatus, MaintenanceSchedule, MaintenanceNotice, EmergencyShutdownStatus } from "./maintenance.types";
import { logAdminAction } from "@/core/audit";
import { logger } from "@/core/logger";

let currentMode: MaintenanceMode = "normal";
let maintenanceReason: string | undefined;
let maintenanceStartedAt: Date | undefined;
let maintenanceScheduledEnd: Date | undefined;
let maintenanceMessage: string | undefined;
let allowAdminAccess = true;
const notices: MaintenanceNotice[] = [];
const schedules: MaintenanceSchedule[] = [];

export class MaintenanceService {
  async getStatus(): Promise<MaintenanceStatus> {
    return {
      mode: currentMode,
      enabled: currentMode !== "normal",
      reason: maintenanceReason,
      startedAt: maintenanceStartedAt,
      scheduledEndAt: maintenanceScheduledEnd,
      message: maintenanceMessage,
      allowAdminAccess,
    };
  }

  async setReadOnlyMode(reason: string, adminId: string, durationMinutes?: number): Promise<MaintenanceStatus> {
    const now = new Date();
    currentMode = "read_only";
    maintenanceReason = reason;
    maintenanceStartedAt = now;
    maintenanceScheduledEnd = durationMinutes ? new Date(now.getTime() + durationMinutes * 60 * 1000) : undefined;
    maintenanceMessage = reason;
    logAdminAction("maintenance.read_only.enabled", adminId, { reason, durationMinutes });
    logger.warn("Read-only mode enabled", { adminId, reason });
    return this.getStatus();
  }

  async setMaintenanceMode(reason: string, adminId: string, durationMinutes?: number): Promise<MaintenanceStatus> {
    const now = new Date();
    currentMode = "maintenance";
    maintenanceReason = reason;
    maintenanceStartedAt = now;
    maintenanceScheduledEnd = durationMinutes ? new Date(now.getTime() + durationMinutes * 60 * 1000) : undefined;
    maintenanceMessage = reason;
    allowAdminAccess = true;
    logAdminAction("maintenance.mode.enabled", adminId, { reason, durationMinutes });
    logger.warn("Maintenance mode enabled", { adminId, reason });
    return this.getStatus();
  }

  async disableMaintenanceMode(adminId: string): Promise<MaintenanceStatus> {
    currentMode = "normal";
    maintenanceReason = undefined;
    maintenanceStartedAt = undefined;
    maintenanceScheduledEnd = undefined;
    maintenanceMessage = undefined;
    allowAdminAccess = true;
    logAdminAction("maintenance.mode.disabled", adminId, {});
    logger.info("Maintenance mode disabled", { adminId });
    return this.getStatus();
  }

  async prepareEmergencyShutdown(adminId: string): Promise<EmergencyShutdownStatus> {
    const now = new Date();
    maintenanceStartedAt = now;
    currentMode = "emergency";
    maintenanceMessage = "Emergency shutdown in progress";
    logAdminAction("maintenance.emergency.prepared", adminId, {});
    logger.security("Emergency shutdown prepared", { adminId });
    return {
      ready: true,
      gracefulShutdownInitiated: false,
      activeConnections: 0,
      pendingJobs: 0,
    };
  }

  async executeEmergencyShutdown(adminId: string): Promise<void> {
    logAdminAction("maintenance.emergency.shutdown", adminId, {});
    logger.security("Emergency shutdown executed", { adminId });
  }

  async scheduleMaintenance(schedule: Omit<MaintenanceSchedule, "id" | "createdAt">, adminId: string): Promise<MaintenanceSchedule> {
    const now = new Date();
    const maintenanceSchedule: MaintenanceSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      createdAt: now,
    };
    schedules.push(maintenanceSchedule);
    logAdminAction("maintenance.scheduled", adminId, { scheduleId: maintenanceSchedule.id, mode: schedule.mode, start: schedule.scheduledStartAt });
    logger.info("Maintenance scheduled", { scheduleId: maintenanceSchedule.id, mode: schedule.mode });
    return maintenanceSchedule;
  }

  async getSchedules(): Promise<MaintenanceSchedule[]> {
    return [...schedules];
  }

  async cancelSchedule(scheduleId: string, adminId: string): Promise<void> {
    const index = schedules.findIndex((s) => s.id === scheduleId);
    if (index >= 0) {
      schedules[index].status = "cancelled";
      logAdminAction("maintenance.schedule.cancelled", adminId, { scheduleId });
    }
  }

  async createNotice(notice: Omit<MaintenanceNotice, "id" | "createdAt">, adminId: string): Promise<MaintenanceNotice> {
    const now = new Date();
    const maintenanceNotice: MaintenanceNotice = {
      ...notice,
      id: `notice_${Date.now()}`,
      createdAt: now,
    };
    notices.push(maintenanceNotice);
    logAdminAction("maintenance.notice.created", adminId, { noticeId: maintenanceNotice.id, title: notice.title });
    logger.info("Maintenance notice created", { noticeId: maintenanceNotice.id, title: notice.title });
    return maintenanceNotice;
  }

  async getNotices(): Promise<MaintenanceNotice[]> {
    return [...notices];
  }

  async deactivateNotice(noticeId: string, adminId: string): Promise<void> {
    const notice = notices.find((n) => n.id === noticeId);
    if (notice) {
      notice.active = false;
      logAdminAction("maintenance.notice.deactivated", adminId, { noticeId });
    }
  }

  async setAdminAccess(allow: boolean, adminId: string): Promise<MaintenanceStatus> {
    allowAdminAccess = allow;
    logAdminAction("maintenance.admin.access.updated", adminId, { allowAdminAccess: allow });
    return this.getStatus();
  }

  async setMaintenanceMessage(message: string, adminId: string): Promise<MaintenanceStatus> {
    maintenanceMessage = message;
    logAdminAction("maintenance.message.updated", adminId, { message });
    return this.getStatus();
  }
}
