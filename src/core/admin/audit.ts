import { logger } from "@/core/logger";

export function logAdminAction(action: string, adminId: string, details?: Record<string, unknown>): void {
  logger.audit(`Admin action: ${action}`, { adminId, ...details });
}
