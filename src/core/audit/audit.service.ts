import {
  createAuditEntry,
  getAuditEntries,
  queryAuditLog as repoQueryAuditLog,
  getAuditTimeline as repoGetAuditTimeline,
  searchAuditLog as repoSearchAuditLog,
  exportAuditLog as repoExportAuditLog,
} from "./audit.repository";
import type { AuditAction, AuditEntry, AuditQuery } from "./audit.types";

export async function logAction(
  action: AuditAction,
  actorId?: string,
  actorType?: AuditEntry["actorType"],
  details?: Record<string, unknown>
): Promise<void> {
  await createAuditEntry({
    action,
    actorId,
    actorType,
    metadata: details,
  });
}

export async function logUserAction(action: AuditAction, userId: string, details?: Record<string, unknown>): Promise<void> {
  await logAction(action, userId, "user", details);
}

export async function logAdminAction(action: AuditAction, adminId: string, details?: Record<string, unknown>): Promise<void> {
  await logAction(action, adminId, "admin", details);
}

export async function getAuditLog(filters?: Parameters<typeof getAuditEntries>[0]): Promise<AuditEntry[]> {
  return getAuditEntries(filters);
}

export async function queryAuditLog(filters: AuditQuery): Promise<AuditEntry[]> {
  return repoQueryAuditLog(filters);
}

export async function getAuditTimeline(resourceType: string, resourceId: string): Promise<AuditEntry[]> {
  return repoGetAuditTimeline(resourceType, resourceId);
}

export async function searchAuditLog(query: string): Promise<AuditEntry[]> {
  return repoSearchAuditLog(query);
}

export async function exportAuditLog(filters?: AuditQuery): Promise<string> {
  return repoExportAuditLog(filters);
}
