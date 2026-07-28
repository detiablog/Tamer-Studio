import { db } from "@/lib/db";
import { cmsAuditEntry } from "@/lib/db/schema/cms";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSAuditRepository } from "./audit.repository";
import type { CMSAuditEntry, CMSContentType } from "../cms.types";

export class DefaultCMSAuditRepository implements CMSAuditRepository {
  async createEntry(entry: Omit<CMSAuditEntry, "id" | "timestamp">): Promise<CMSAuditEntry> {
    const now = new Date().toISOString();
    const id = randomUUID();
    const [created] = await db.insert(cmsAuditEntry).values({
      id,
      action: entry.action,
      contentType: entry.contentType,
      contentId: entry.contentId,
      authorId: entry.authorId,
      timestamp: now,
      metadata: entry.metadata ?? {},
    }).returning();

    return this.mapRow(created);
  }

  async getEntry(id: string): Promise<CMSAuditEntry | undefined> {
    const [entry] = await db.select().from(cmsAuditEntry).where(eq(cmsAuditEntry.id, id)).limit(1);
    return entry ? this.mapRow(entry) : undefined;
  }

  async getAuditLog(contentId?: string, contentType?: CMSContentType): Promise<CMSAuditEntry[]> {
    const conditions: (ReturnType<typeof eq> | ReturnType<typeof and>)[] = [];

    if (contentId !== undefined) {
      conditions.push(eq(cmsAuditEntry.contentId, contentId));
    }
    if (contentType !== undefined) {
      conditions.push(eq(cmsAuditEntry.contentType, contentType));
    }

    const auditLog = conditions.length > 0
      ? await db.select().from(cmsAuditEntry).where(and(...conditions)).orderBy(desc(cmsAuditEntry.timestamp))
      : await db.select().from(cmsAuditEntry).orderBy(desc(cmsAuditEntry.timestamp));

    return auditLog.map(this.mapRow);
  }

  private mapRow(row: typeof cmsAuditEntry.$inferSelect): CMSAuditEntry {
    return {
      id: row.id,
      action: row.action as CMSAuditEntry["action"],
      contentType: row.contentType as CMSContentType,
      contentId: row.contentId,
      authorId: row.authorId,
      timestamp: row.timestamp.toISOString(),
      metadata: row.metadata ?? {},
    };
  }
}