export type HypercareIncidentSeverity = "critical" | "high" | "medium" | "low" | "informational";
export type HypercareIncidentPriority = "critical" | "high" | "medium" | "low";
export type HypercareIncidentStatus = "open" | "assigned" | "in_progress" | "testing" | "resolved" | "closed" | "rejected" | "duplicate" | "regression";
export type HypercareHotfixStatus = "pending" | "validating" | "testing" | "deployed" | "verified" | "rolled_back" | "failed";
export type HypercareHealthStatus = "healthy" | "warning" | "critical" | "unknown" | "offline";
export type HypercareKpiStatus = "on_track" | "at_risk" | "breached" | "unknown";
export type HypercareKpiTrend = "improving" | "stable" | "declining" | "unknown";
export type HypercareFeedbackType = "bug_report" | "suggestion" | "ai_quality" | "performance" | "support_request" | "billing_issue";
export type HypercareFeedbackStatus = "open" | "in_progress" | "resolved" | "closed";
export type HypercareReportType = "daily" | "weekly" | "incident_summary" | "performance" | "executive";
export type HypercareReportStatus = "draft" | "published" | "archived";

export interface HypercareIncidentInput {
  title: string;
  description?: string;
  severity: HypercareIncidentSeverity;
  priority: HypercareIncidentPriority;
  affectedModule?: string;
  affectedUsers?: number;
  ownerId?: string;
  affectedServices?: string[];
  timeline?: Array<{ timestamp: string; action: string; note: string; admin: string }>;
}

export interface HypercareIncidentUpdate {
  status?: HypercareIncidentStatus;
  severity?: HypercareIncidentSeverity;
  priority?: HypercareIncidentPriority;
  ownerId?: string;
  rootCause?: string;
  technicalCause?: string;
  businessImpact?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  verification?: string;
  lessonsLearned?: string;
  timeline?: Array<{ timestamp: string; action: string; note: string; admin: string }>;
  affectedUsers?: number;
  metadata?: Record<string, unknown>;
}

export interface HypercareHotfixInput {
  incidentId?: string;
  branchName: string;
  commitHash?: string;
  title: string;
  description?: string;
  targetVersion?: string;
}

export interface HypercareHotfixUpdate {
  status?: HypercareHotfixStatus;
  commitHash?: string;
  deployedAt?: Date;
  rolledBackAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  regressionTestsPassed?: boolean;
  validationResults?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface HypercareFeedbackInput {
  userId?: string;
  category: string;
  type: HypercareFeedbackType;
  subject: string;
  content?: string;
  rating?: number;
  module?: string;
  priority?: HypercareIncidentPriority;
  metadata?: Record<string, unknown>;
}

export interface HypercareFeedbackUpdate {
  status?: HypercareFeedbackStatus;
  priority?: HypercareIncidentPriority;
  linkedIncidentId?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  response?: string;
  metadata?: Record<string, unknown>;
}

export interface HypercareOverview {
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  resolvedToday: number;
  avgResolutionTimeHours: number;
  totalHotfixes: number;
  deployedHotfixes: number;
  totalFeedback: number;
  openFeedback: number;
  healthScore: number;
  platformAvailability: number;
  aiSuccessRate: number;
  paymentSuccessRate: number;
  emailDeliveryRate: number;
  queueSuccessRate: number;
  apiSuccessRate: number;
  crashRate: number;
  recentIncidents: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
  }>;
  healthChecks: Array<{
    serviceName: string;
    status: string;
    latencyMs: number | null;
  }>;
}

export interface HypercareKpiTarget {
  name: string;
  targetValue: number;
  unit: string;
  category: string;
}

export const HYPERCARE_KPI_TARGETS: HypercareKpiTarget[] = [
  { name: "platform_availability", targetValue: 99.9, unit: "%", category: "infrastructure" },
  { name: "crash_rate", targetValue: 0.1, unit: "%", category: "stability" },
  { name: "ai_success_rate", targetValue: 99, unit: "%", category: "ai_runtime" },
  { name: "payment_success_rate", targetValue: 99.9, unit: "%", category: "billing" },
  { name: "email_delivery_rate", targetValue: 98, unit: "%", category: "email" },
  { name: "queue_success_rate", targetValue: 99, unit: "%", category: "queue" },
  { name: "api_success_rate", targetValue: 99.9, unit: "%", category: "api" },
];
