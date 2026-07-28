import { authEventsRepository } from "./auth-events.repository";
import { logger } from "@/core/logger";

export interface FailedLoginRecordInput {
  email: string;
  identifier: string;
  reason: string;
  userAgent?: string;
  ipAddress?: string;
}

export async function recordFailedLogin(input: FailedLoginRecordInput): Promise<void> {
  try {
    await authEventsRepository.recordFailedLogin({
      id: crypto.randomUUID(),
      email: input.email,
      identifier: input.identifier,
      reason: input.reason,
      userAgent: input.userAgent ?? null,
      ipAddress: input.ipAddress ?? null,
    });
  } catch (error) {
    logger.error("Failed to persist failed login attempt", error instanceof Error ? error : undefined, {
      email: input.email,
      identifier: input.identifier,
    });
  }
}

export async function getFailedLoginCountForIdentifier(identifier: string, windowMs = 15 * 60 * 1000): Promise<number> {
  return authEventsRepository.getFailedLoginCountForIdentifier(identifier, windowMs);
}

export async function getFailedLoginCountForEmail(email: string, windowMs = 60 * 60 * 1000): Promise<number> {
  return authEventsRepository.getFailedLoginCountForEmail(email, windowMs);
}
