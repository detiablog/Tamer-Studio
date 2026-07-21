export type SupportCategory = "billing" | "technical" | "account" | "feature_request" | "bug_report" | "general";
export type SupportPriority = "low" | "medium" | "high" | "urgent";
export type SupportQueue = "customer_service" | "technical_support" | "billing_support" | "internal_support";

export interface SupportStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  waitingCustomer: number;
  waitingInternal: number;
  resolved: number;
  closed: number;
  reopened: number;
  archived: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface SupportQueueItem {
  ticketId: string;
  userId: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  createdAt: Date;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description?: string;
}

export interface PriorityInfo {
  id: string;
  name: string;
  level: number;
}

export const SUPPORT_CATEGORIES: CategoryInfo[] = [
  { id: "billing", name: "Billing" },
  { id: "technical", name: "Technical Support" },
  { id: "account", name: "Account" },
  { id: "feature_request", name: "Feature Request" },
  { id: "bug_report", name: "Bug Report" },
  { id: "general", name: "General" },
];

export const SUPPORT_PRIORITIES: PriorityInfo[] = [
  { id: "low", name: "Low", level: 1 },
  { id: "medium", name: "Medium", level: 2 },
  { id: "high", name: "High", level: 3 },
  { id: "urgent", name: "Urgent", level: 4 },
];

export const SUPPORT_QUEUES: SupportQueue[] = [
  "customer_service",
  "technical_support",
  "billing_support",
  "internal_support",
];
