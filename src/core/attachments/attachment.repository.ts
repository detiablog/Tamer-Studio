import { db } from "@/lib/db";
import { supportAttachment } from "@/lib/db/schema/support";
import { eq, and, desc } from "drizzle-orm";
import type { SupportAttachment, AttachmentFilter, AttachmentType } from "./types";
import { randomUUID } from "crypto";

export class AttachmentRepository {
  async create(input: {
    ticketId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string;
    uploadedBy: string;
  }): Promise<SupportAttachment> {
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

    return this.mapAttachment(row);
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
