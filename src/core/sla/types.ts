export type SLAPriority = "low" | "medium" | "high" | "urgent";
export type SLAType = "response" | "resolution";

export interface SLAPolicy {
  id: string;
  name: string;
  priority: SLAPriority;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  escalationRules?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAViolation {
  id: string;
  ticketId: string;
  policyId: string;
  type: SLAType;
  violatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface CreateSLAPolicyInput {
  name: string;
  priority: SLAPriority;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  escalationRules?: Record<string, unknown>;
}

export interface SLACheckResult {
  policy: SLAPolicy | undefined;
  responseBreached: boolean;
  resolutionBreached: boolean;
  responseRemainingMinutes: number | null;
  resolutionRemainingMinutes: number | null;
}
