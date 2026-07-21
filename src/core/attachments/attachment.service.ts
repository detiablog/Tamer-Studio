import { db } from "@/lib/db";
import { supportAttachment } from "@/lib/db/schema/support";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { SupportAttachment, CreateAttachmentInput, AttachmentFilter, AttachmentType } from "./types";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

export class AttachmentService {
  constructor(private eventPublisher?: EventPublisher) {}

  async create(input: CreateAttachmentInput): Promise<SupportAttachment> {
    const id = `attach_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportAttachment).values({
      id,
      ticketId: input.ticketId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      storagePath: input.storagePath,
      uploadedBy: input.uploadedBy,
      createdAt: now,
    }).returning();

    const attachment = this.mapAttachment(row);

    logAction("ticket.attachment.added", undefined, undefined, { attachmentId: attachment.id, ticketId: input.ticketId });
    logger.info("Attachment created", { attachmentId: attachment.id, ticketId: input.ticketId });

    if (this.eventPublisher) {
      await this.eventPublisher.publishDomainEvent("support.attachment.added", { attachmentId: attachment.id, ticketId: input.ticketId, fileType: input.fileType }, "support", { resourceId: input.ticketId, resourceType: "ticket" });
    }

    return attachment;
  }

  async get(attachmentId: string): Promise<SupportAttachment | undefined> {
    const rows = await db.select().from(supportAttachment).where(eq(supportAttachment.id, attachmentId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapAttachment(rows[0]);
  }

  async list(filter?: AttachmentFilter): Promise<SupportAttachment[]> {
    const conditions = [];

    if (filter?.ticketId) conditions.push(eq(supportAttachment.ticketId, filter.ticketId));
    if (filter?.uploadedBy) conditions.push(eq(supportAttachment.uploadedBy, filter.uploadedBy));

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const rows = await db.select().from(supportAttachment).where(and(...conditions)).orderBy(desc(supportAttachment.createdAt)).limit(limit).offset(offset);

    return rows.map(this.mapAttachment);
  }

  async delete(attachmentId: string): Promise<void> {
    await db.delete(supportAttachment).where(eq(supportAttachment.id, attachmentId));
    logAction("ticket.attachment.deleted", undefined, undefined, { attachmentId });
    logger.info("Attachment deleted", { attachmentId });
  }

  private mapAttachment(row: typeof supportAttachment.$inferSelect): SupportAttachment {
    return {
      id: row.id,
      ticketId: row.ticketId,
      fileName: row.fileName,
      fileType: row.fileType as AttachmentType,
      fileSize: row.fileSize,
      storagePath: row.storagePath,
      uploadedBy: row.uploadedBy,
      createdAt: row.createdAt,
    };
  }
}
