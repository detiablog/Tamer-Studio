import { db } from "@/lib/db";
import { supportInternalNote } from "@/lib/db/schema/support";
import { eq, and, desc } from "drizzle-orm";
import type { InternalNote, CreateInternalNoteInput, UpdateInternalNoteInput, InternalNoteFilter } from "./types";
import { randomUUID } from "crypto";

export class InternalNoteRepository {
  async create(input: CreateInternalNoteInput): Promise<InternalNote> {
    const id = `note_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportInternalNote).values({
      id,
      ticketId: input.ticketId,
      content: input.content,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapNote(row);
  }

  async get(noteId: string): Promise<InternalNote | undefined> {
    const rows = await db.select().from(supportInternalNote).where(eq(supportInternalNote.id, noteId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapNote(rows[0]);
  }

  async list(filter?: InternalNoteFilter): Promise<InternalNote[]> {
    const conditions = [];

    if (filter?.ticketId) conditions.push(eq(supportInternalNote.ticketId, filter.ticketId));
    if (filter?.createdBy) conditions.push(eq(supportInternalNote.createdBy, filter.createdBy));

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const rows = await db.select().from(supportInternalNote).where(and(...conditions)).orderBy(desc(supportInternalNote.createdAt)).limit(limit).offset(offset);

    return rows.map(this.mapNote);
  }

  async update(noteId: string, input: UpdateInternalNoteInput): Promise<InternalNote | undefined> {
    const now = new Date();
    const [row] = await db.update(supportInternalNote).set({ content: input.content, updatedAt: now }).where(eq(supportInternalNote.id, noteId)).returning();
    if (!row) return undefined;
    return this.mapNote(row);
  }

  async delete(noteId: string): Promise<void> {
    await db.delete(supportInternalNote).where(eq(supportInternalNote.id, noteId));
  }

  private mapNote(row: typeof supportInternalNote.$inferSelect): InternalNote {
    return {
      id: row.id,
      ticketId: row.ticketId,
      content: row.content,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
