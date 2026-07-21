export interface PlatformStats {
  users: UserStats;
  workspaces: WorkspaceStats;
  aiUsage: AIUsageStats;
  credits: CreditStats;
  revenue: RevenueStats;
  providers: ProviderStats;
  jobs: JobStats;
  system: SystemStats;
  alerts: AlertStats;
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  verified: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
}

export interface WorkspaceStats {
  total: number;
  active: number;
  suspended: number;
  teamCount: number;
  personalCount: number;
}

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalEstimatedCost: number;
  currency: string;
  activeProviders: number;
  failedRequests: number;
}

export interface CreditStats {
  totalCreditsIssued: number;
  totalCreditsConsumed: number;
  totalCreditsRemaining: number;
  lowBalanceWarnings: number;
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  currency: string;
}

export interface ProviderStats {
  totalProviders: number;
  activeProviders: number;
  unhealthyProviders: number;
  disabledProviders: number;
}

export interface JobStats {
  totalJobs: number;
  queuedJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export interface SystemStats {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  nodeVersion: string;
  env: string;
}

export interface AlertStats {
  critical: number;
  warning: number;
  info: number;
  recent: Alert[];
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  source: string;
  createdAt: Date;
}
