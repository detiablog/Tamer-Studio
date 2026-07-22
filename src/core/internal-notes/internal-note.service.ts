import type { InternalNote, CreateInternalNoteInput, UpdateInternalNoteInput, InternalNoteFilter } from "./types";
import { InternalNoteRepository } from "./internal-note.repository";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

export class InternalNoteService {
  private repository = new InternalNoteRepository();

  constructor(private eventPublisher?: EventPublisher) {}

  async create(input: CreateInternalNoteInput): Promise<InternalNote> {
    const note = await this.repository.create(input);

    logAction("ticket.internal_note.created", undefined, undefined, { noteId: note.id, ticketId: input.ticketId, createdBy: input.createdBy });
    logger.info("Internal note created", { noteId: note.id, ticketId: input.ticketId });

    if (this.eventPublisher) {
      await this.eventPublisher.publishDomainEvent("support.internal_note.created", { noteId: note.id, ticketId: input.ticketId }, "support", { resourceId: input.ticketId, resourceType: "ticket" });
    }

    return note;
  }

  async get(noteId: string): Promise<InternalNote | undefined> {
    return this.repository.get(noteId);
  }

  async list(filter?: InternalNoteFilter): Promise<InternalNote[]> {
    return this.repository.list(filter);
  }

  async update(noteId: string, input: UpdateInternalNoteInput): Promise<InternalNote | undefined> {
    return this.repository.update(noteId, input);
  }

  async delete(noteId: string): Promise<void> {
    await this.repository.delete(noteId);
    logAction("ticket.internal_note.deleted", undefined, undefined, { noteId });
    logger.info("Internal note deleted", { noteId });
  }
}
