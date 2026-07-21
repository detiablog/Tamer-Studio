import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import type { AuditEntry, AuditAction } from "./audit.types";
import { logger } from "@/core/logger";
import { randomUUID } from "crypto";

export async function createAuditEntry(entry: Omit<AuditEntry, "id" | "createdAt">): Promise<void> {
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      action: entry.action,
      actorId: entry.actorId ?? null,
      actorType: entry.actorType ?? null,
      resourceType: entry.resourceType ?? null,
      resourceId: entry.resourceId ?? null,
      metadata: entry.metadata ?? {},
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      createdAt: new Date(),
    });

    logger.audit(`Audit: ${entry.action}`, entry);
  } catch (error) {
    logger.error("Failed to create audit entry", error instanceof Error ? error : undefined);
  }
}

export async function getAuditEntries(filters?: {
  action?: AuditAction;
  actorId?: string;
  resourceType?: string;
  limit?: number;
}): Promise<AuditEntry[]> {
  const limit = filters?.limit ?? 100;

  const entries = await db.select().from(auditLog).limit(limit);

  return entries.map((entry) => ({
    id: entry.id,
    action: entry.action as AuditAction,
    actorId: entry.actorId ?? undefined,
    actorType: entry.actorType as AuditEntry["actorType"] ?? undefined,
    resourceType: entry.resourceType ?? undefined,
    resourceId: entry.resourceId ?? undefined,
    metadata: entry.metadata as Record<string, unknown> | undefined,
    ipAddress: entry.ipAddress ?? undefined,
    userAgent: entry.userAgent ?? undefined,
    createdAt: entry.createdAt,
  }));
}
