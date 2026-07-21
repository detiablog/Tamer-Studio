import type { SupportFeedback, CreateFeedbackInput, FeedbackFilter, FeedbackType } from "./types";
import { FeedbackRepository } from "./feedback.repository";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

export class FeedbackService {
  private repository = new FeedbackRepository();

  constructor(private eventPublisher?: EventPublisher) {}

  async create(input: CreateFeedbackInput): Promise<SupportFeedback> {
    const feedback = await this.repository.create(input);

    logAction("feedback.created", undefined, undefined, { feedbackId: feedback.id, userId: feedback.userId, type: feedback.type });
    logger.info("Feedback created", { feedbackId: feedback.id, type: feedback.type });

    if (this.eventPublisher) {
      await this.eventPublisher.publishDomainEvent("feedback.created", { feedbackId: feedback.id, userId: feedback.userId, type: feedback.type, rating: feedback.rating }, "support", { resourceId: feedback.id, resourceType: "feedback" });
    }

    return feedback;
  }

  async get(feedbackId: string): Promise<SupportFeedback | undefined> {
    return this.repository.getById(feedbackId);
  }

  async list(filter?: FeedbackFilter): Promise<SupportFeedback[]> {
    return this.repository.list(filter);
  }

  async getStats(filter?: { userId?: string; ticketId?: string }): Promise<{
    total: number;
    byType: Record<FeedbackType, number>;
    averageRating: number | null;
  }> {
    return this.repository.getStats(filter);
  }
}
