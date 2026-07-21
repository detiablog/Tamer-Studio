export type FeedbackType = "feature_request" | "bug_report" | "customer_satisfaction" | "ticket_rating" | "product_feedback";

export interface SupportFeedback {
  id: string;
  userId: string;
  ticketId?: string;
  type: FeedbackType;
  rating?: number;
  comment?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateFeedbackInput {
  userId: string;
  ticketId?: string;
  type: FeedbackType;
  rating?: number;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackFilter {
  userId?: string;
  ticketId?: string;
  type?: FeedbackType;
  limit?: number;
  offset?: number;
}
