import { DefaultAuditRepository } from "./audit.repository";
import type { AuditAction, AuditEntry, AuditQuery } from "./audit.types";

export interface AuditService {
  logAction(action: AuditAction, actorId?: string, actorType?: AuditEntry["actorType"], details?: Record<string, unknown>): Promise<void>;
  logUserAction(action: AuditAction, userId: string, details?: Record<string, unknown>): Promise<void>;
  logAdminAction(action: AuditAction, adminId: string, details?: Record<string, unknown>): Promise<void>;
  getAuditLog(filters?: Parameters<typeof DefaultAuditRepository.prototype.getAuditEntries>[0]): Promise<AuditEntry[]>;
  queryAuditLog(filters: AuditQuery): Promise<AuditEntry[]>;
  getAuditTimeline(resourceType: string, resourceId: string): Promise<AuditEntry[]>;
  searchAuditLog(query: string): Promise<AuditEntry[]>;
  exportAuditLog(filters?: AuditQuery): Promise<string>;
}

export class DefaultAuditService implements AuditService {
  private repository = new DefaultAuditRepository();

  async logAction(
    action: AuditAction,
    actorId?: string,
    actorType?: AuditEntry["actorType"],
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.repository.createAuditEntry({
      action,
      actorId,
      actorType,
      metadata: details,
    });
  }

  async logUserAction(action: AuditAction, userId: string, details?: Record<string, unknown>): Promise<void> {
    await this.logAction(action, userId, "user", details);
  }

  async logAdminAction(action: AuditAction, adminId: string, details?: Record<string, unknown>): Promise<void> {
    await this.logAction(action, adminId, "admin", details);
  }

  async getAuditLog(filters?: {
    action?: AuditAction;
    actorId?: string;
    resourceType?: string;
    limit?: number;
  }): Promise<AuditEntry[]> {
    return this.repository.getAuditEntries(filters);
  }

  async queryAuditLog(filters: AuditQuery): Promise<AuditEntry[]> {
    return this.repository.queryAuditLog(filters);
  }

  async getAuditTimeline(resourceType: string, resourceId: string): Promise<AuditEntry[]> {
    return this.repository.getAuditTimeline(resourceType, resourceId);
  }

  async searchAuditLog(query: string): Promise<AuditEntry[]> {
    return this.repository.searchAuditLog(query);
  }

  async exportAuditLog(filters?: AuditQuery): Promise<string> {
    return this.repository.exportAuditLog(filters);
  }
}

export const auditService = new DefaultAuditService();

export async function logAction(
  action: AuditAction,
  actorId?: string,
  actorType?: AuditEntry["actorType"],
  details?: Record<string, unknown>
): Promise<void> {
  await auditService.logAction(action, actorId, actorType, details);
}

export async function logUserAction(action: AuditAction, userId: string, details?: Record<string, unknown>): Promise<void> {
  await auditService.logUserAction(action, userId, details);
}

export async function logAdminAction(action: AuditAction, adminId: string, details?: Record<string, unknown>): Promise<void> {
  await auditService.logAdminAction(action, adminId, details);
}

export async function getAuditLog(filters?: {
  action?: AuditAction;
  actorId?: string;
  resourceType?: string;
  limit?: number;
}): Promise<AuditEntry[]> {
  return auditService.getAuditLog(filters);
}

export async function queryAuditLog(filters: AuditQuery): Promise<AuditEntry[]> {
  return auditService.queryAuditLog(filters);
}

export async function getAuditTimeline(resourceType: string, resourceId: string): Promise<AuditEntry[]> {
  return auditService.getAuditTimeline(resourceType, resourceId);
}

export async function searchAuditLog(query: string): Promise<AuditEntry[]> {
  return auditService.searchAuditLog(query);
}

export async function exportAuditLog(filters?: AuditQuery): Promise<string> {
  return auditService.exportAuditLog(filters);
}