export interface ModerationAction {
  id: string;
  type: "user_suspend" | "user_unsuspend" | "workspace_suspend" | "workspace_unsuspend" | "content_review" | "abuse_report" | "audit_review";
  targetId: string;
  targetType: "user" | "workspace" | "content" | "report";
  reason: string;
  details: Record<string, unknown>;
  performedBy: string;
  performedAt: Date;
  status: "pending" | "completed" | "rejected";
}

export interface AbuseReport {
  id: string;
  reporterId?: string;
  reporterEmail?: string;
  targetType: "user" | "workspace" | "content";
  targetId: string;
  category: string;
  description: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentReview {
  id: string;
  contentType: string;
  contentId: string;
  authorId: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditReview {
  id: string;
  action: string;
  actorId: string;
  actorType: "user" | "admin" | "system";
  resourceType?: string;
  resourceId?: string;
  flagged: boolean;
  flagReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
}
