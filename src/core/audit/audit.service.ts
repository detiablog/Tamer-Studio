import { createAuditEntry, getAuditEntries } from "./audit.repository";
import type { AuditAction, AuditEntry } from "./audit.types";

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
