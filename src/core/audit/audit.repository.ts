import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { eq, and, desc, gt, lt, ilike } from "drizzle-orm";
import type { AuditEntry, AuditAction, AuditQuery } from "./audit.types";
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
  const conditions = [];

  if (filters?.action) {
    conditions.push(eq(auditLog.action, filters.action));
  }
  if (filters?.actorId) {
    conditions.push(eq(auditLog.actorId, filters.actorId));
  }
  if (filters?.resourceType) {
    conditions.push(eq(auditLog.resourceType, filters.resourceType));
  }

  const baseQuery = db.select().from(auditLog);
  const rows = conditions.length > 0
    ? await baseQuery.where(and(...conditions)).orderBy(desc(auditLog.createdAt)).limit(limit)
    : await baseQuery.orderBy(desc(auditLog.createdAt)).limit(limit);

  return rows.map((entry) => ({
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

export async function queryAuditLog(filters: AuditQuery): Promise<AuditEntry[]> {
  const conditions = [];

  if (filters.action) {
    conditions.push(eq(auditLog.action, filters.action));
  }
  if (filters.actorId) {
    conditions.push(eq(auditLog.actorId, filters.actorId));
  }
  if (filters.actorType) {
    conditions.push(eq(auditLog.actorType, filters.actorType));
  }
  if (filters.resourceType) {
    conditions.push(eq(auditLog.resourceType, filters.resourceType));
  }
  if (filters.resourceId) {
    conditions.push(eq(auditLog.resourceId, filters.resourceId));
  }
  if (filters.startDate) {
    conditions.push(gt(auditLog.createdAt, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lt(auditLog.createdAt, filters.endDate));
  }

  const limit = filters.limit ?? 100;
  const offset = filters.offset ?? 0;
  const baseQuery = db.select().from(auditLog);
  const rows = conditions.length > 0
    ? await baseQuery.where(and(...conditions)).orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset)
    : await baseQuery.orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset);

  return rows.map(mapToAuditEntry);
}

export async function getAuditTimeline(resourceType: string, resourceId: string): Promise<AuditEntry[]> {
  const rows = await db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.resourceType, resourceType), eq(auditLog.resourceId, resourceId)))
    .orderBy(desc(auditLog.createdAt));

  return rows.map(mapToAuditEntry);
}

export async function searchAuditLog(queryStr: string): Promise<AuditEntry[]> {
  const rows = await db
    .select()
    .from(auditLog)
    .where(ilike(auditLog.action, `%${queryStr}%`))
    .orderBy(desc(auditLog.createdAt));

  return rows.map(mapToAuditEntry);
}

export async function exportAuditLog(filters?: AuditQuery): Promise<string> {
  const entries = filters ? await queryAuditLog(filters) : await getAuditEntries();

  const headers = ["id", "action", "actorId", "actorType", "resourceType", "resourceId", "metadata", "ipAddress", "userAgent", "createdAt"];
  const csvRows = [
    headers.join(","),
    ...entries.map((entry) =>
      [
        entry.id,
        entry.action,
        entry.actorId ?? "",
        entry.actorType ?? "",
        entry.resourceType ?? "",
        entry.resourceId ?? "",
        JSON.stringify(entry.metadata ?? {}).replace(/,/g, ";"),
        entry.ipAddress ?? "",
        entry.userAgent ?? "",
        entry.createdAt.toISOString(),
      ].join(",")
    ),
  ];

  return csvRows.join("\n");
}

function mapToAuditEntry(entry: typeof auditLog.$inferSelect): AuditEntry {
  return {
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
  };
}