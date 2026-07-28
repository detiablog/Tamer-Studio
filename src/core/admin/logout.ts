import { adminSessionRepository } from "./admin.repository";
import { logger } from "@/core/logger";

export async function logoutAdmin(sessionId: string): Promise<void> {
  const session = await adminSessionRepository.findByToken(sessionId);
  if (session) {
    await adminSessionRepository.deleteByAdminId(session.adminId);
    logger.audit("Admin logged out", { sessionId });
  }
}

export async function logoutAdminByToken(token: string): Promise<void> {
  const session = await adminSessionRepository.findByToken(token);
  if (session) {
    await adminSessionRepository.deleteByAdminId(session.adminId);
    logger.audit("Admin logged out", { sessionId: session.id });
  }
}
