import type { SupportAttachment, CreateAttachmentInput, AttachmentFilter } from "./types";
import { AttachmentRepository } from "./attachment.repository";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

export class AttachmentService {
  private repository = new AttachmentRepository();

  constructor(private eventPublisher?: EventPublisher) {}

  async create(input: CreateAttachmentInput): Promise<SupportAttachment> {
    const attachment = await this.repository.create(input);
    logAction("ticket.attachment.added", undefined, undefined, { attachmentId: attachment.id, ticketId: input.ticketId });
    logger.info("Attachment created", { attachmentId: attachment.id, ticketId: input.ticketId });

    if (this.eventPublisher) {
      await this.eventPublisher.publishDomainEvent("support.attachment.added", { attachmentId: attachment.id, ticketId: input.ticketId, fileType: input.fileType }, "support", { resourceId: input.ticketId, resourceType: "ticket" });
    }

    return attachment;
  }

  async get(attachmentId: string): Promise<SupportAttachment | undefined> {
    return this.repository.get(attachmentId);
  }

  async list(filter?: AttachmentFilter): Promise<SupportAttachment[]> {
    return this.repository.list(filter);
  }

  async delete(attachmentId: string): Promise<void> {
    await this.repository.delete(attachmentId);
    logAction("ticket.attachment.deleted", undefined, undefined, { attachmentId });
    logger.info("Attachment deleted", { attachmentId });
  }
}
