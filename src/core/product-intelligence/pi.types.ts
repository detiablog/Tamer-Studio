export type PiKpiCategory = "revenue" | "users" | "retention" | "ai" | "credits" | "features" | "subscriptions" | "forecasting" | "platform";
export type PiKpiStatus = "on_track" | "at_risk" | "breached" | "unknown";
export type PiKpiTrend = "improving" | "stable" | "declining" | "unknown";
export type PiFunnelStage = "visitor" | "registration" | "email_verification" | "trial" | "paid_subscription" | "credit_purchase" | "first_ai_generation" | "first_project" | "publishing" | "returning_user";
export type PiForecastCategory = "revenue" | "subscriptions" | "ai_cost" | "credits" | "storage" | "infrastructure" | "users" | "provider_cost";
export type PiDecisionCategory = "pricing" | "feature" | "ai_optimization" | "marketing" | "subscription" | "credits" | "retention" | "growth";
export type PiDecisionImpact = "high" | "medium" | "low";
export type PiDecisionPriority = "critical" | "high" | "medium" | "low";
export type PiDecisionStatus = "pending" | "approved" | "rejected" | "implemented";
export type PiReportType = "daily_executive" | "weekly_business" | "monthly_review" | "quarterly_growth" | "revenue" | "retention" | "ai_cost" | "feature_adoption" | "forecast";
export type PiSegmentType = "free" | "trial" | "lite" | "creator" | "pro" | "advanced" | "ultra" | "power_user" | "inactive" | "high_value" | "high_ai_usage" | "enterprise_ready";
export type PiExportFormat = "csv" | "excel" | "pdf" | "json";
export type PiCohortType = "registration" | "subscription" | "feature";

export interface PiExecutiveDashboard {
  revenue: {
    dailyRevenue: number;
    monthlyRevenue: number;
    mrr: number;
    arr: number;
    revenueGrowth: number;
    revenuePerUser: number;
    averageOrderValue: number;
    totalRevenueAllTime: number;
  };
  users: {
    dau: number;
    wau: number;
    mau: number;
    totalUsers: number;
    registrationsToday: number;
    registrationsThisMonth: number;
    activeUsers: number;
    inactiveUsers: number;
    returningUsers: number;
  };
  retention: {
    retentionD1: number;
    retentionD7: number;
    retentionD30: number;
    retentionD90: number;
  };
  churn: {
    churnRate: number;
    churnedThisMonth: number;
    cancellations: number;
    pauseCount: number;
  };
  arpu: number;
  ltv: number;
  cac: number;
  aiCostPerGeneration: number;
  grossMargin: number;
  platformHealthScore: number;
  growthRate: number;
  generatedAt: string;
}

export interface PiUserIntelligence {
  registrations: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byCountry: Array<{ country: string; count: number }>;
    byDevice: Array<{ device: string; count: number }>;
    byLanguage: Array<{ language: string; count: number }>;
  };
  activeUsers: {
    dau: number;
    wau: number;
    mau: number;
    avgSessionDuration: number;
    avgSessionsPerUser: number;
  };
  inactiveUsers: {
    total: number;
    lastActiveDays: number;
    percentOfTotal: number;
  };
  returningUsers: {
    total: number;
    rate: number;
  };
  featureUsage: Array<{ feature: string; users: number; count: number }>;
  generatedAt: string;
}

export interface PiRevenueIntelligence {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  averageOrderValue: number;
  revenueByCountry: Array<{ country: string; revenue: number; count: number }>;
  revenueByPlan: Array<{ plan: string; revenue: number; count: number }>;
  revenueByPaymentMethod: Array<{ method: string; revenue: number; count: number }>;
  refunds: {
    total: number;
    count: number;
    rate: number;
  };
  failedPayments: {
    total: number;
    count: number;
  };
  revenueTrend: Array<{ date: string; revenue: number }>;
  generatedAt: string;
}

export interface PiSubscriptionIntelligence {
  total: number;
  active: number;
  trialing: number;
  cancelled: number;
  paused: number;
  trialConversionRate: number;
  upgradeRate: number;
  downgradeRate: number;
  cancellationRate: number;
  renewalRate: number;
  planDistribution: Array<{ plan: string; count: number; percent: number }>;
  averageSubscriptionLength: number;
  mrr: number;
  arr: number;
  generatedAt: string;
}

export interface PiCreditIntelligence {
  totalPurchased: number;
  totalUsed: number;
  totalExpired: number;
  totalRefunded: number;
  currentBalance: number;
  creditsByPlan: Array<{ plan: string; purchased: number; used: number }>;
  creditsByAiModel: Array<{ model: string; used: number; cost: number }>;
  creditsByFeature: Array<{ feature: string; used: number }>;
  averageUtilization: number;
  generatedAt: string;
}

export interface PiAiIntelligence {
  totalRequests: number;
  successRate: number;
  failureRate: number;
  averageCostPerRequest: number;
  totalCost: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  providerBreakdown: Array<{
    provider: string;
    requests: number;
    successRate: number;
    avgCost: number;
    avgLatency: number;
  }>;
  modelBreakdown: Array<{
    model: string;
    requests: number;
    successRate: number;
    avgCost: number;
    avgLatency: number;
  }>;
  qualityScores: {
    averageQuality: number;
    averageSpeed: number;
    averageReliability: number;
  };
  creditsUsed: number;
  generatedAt: string;
}

export interface PiFeatureAdoption {
  features: Array<{
    name: string;
    category: string;
    totalUsers: number;
    totalEvents: number;
    adoptionRate: number;
    dailyUsage: Array<{ date: string; count: number }>;
  }>;
  overallAdoptionRate: number;
  mostUsedFeature: string;
  leastUsedFeature: string;
  generatedAt: string;
}

export interface PiFunnelData {
  id: string;
  name: string;
  steps: Array<{
    stage: PiFunnelStage;
    name: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  totalVisitors: number;
  overallConversion: number;
  period: string;
  generatedAt: string;
}

export interface PiRetentionData {
  cohortType: PiCohortType;
  cohorts: Array<{
    period: string;
    cohortSize: number;
    retention: {
      day1: number;
      day7: number;
      day30: number;
      day90: number;
    };
  }>;
  averageRetention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  generatedAt: string;
}

export interface PiChurnData {
  totalChurned: number;
  churnRate: number;
  churnByPlan: Array<{ plan: string; churned: number; rate: number }>;
  churnReasons: Array<{ reason: string; count: number; percent: number }>;
  churnTrend: Array<{ date: string; churned: number; rate: number }>;
  averageLifetimeBeforeChurn: number;
  winbackRate: number;
  generatedAt: string;
}

export interface PiPublishingIntelligence {
  totalPublications: number;
  publicationsThisMonth: number;
  publicationsThisWeek: number;
  publishSuccessRate: number;
  publicationsByPlatform: Array<{ platform: string; count: number; successRate: number }>;
  publicationsByType: Array<{ type: string; count: number }>;
  averageTimeToPublish: number;
  generatedAt: string;
}

export interface PiProjectIntelligence {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectDuration: number;
  projectsByType: Array<{ type: string; count: number }>;
  averageProductionsPerProject: number;
  averageCostPerProject: number;
  workspaceActivity: Array<{ workspaceId: string; projects: number; productions: number; cost: number }>;
  generatedAt: string;
}

export interface PiForecastResult {
  id: string;
  name: string;
  category: PiForecastCategory;
  metric: string;
  forecasts: Array<{
    period: string;
    predictedValue: number;
    confidenceLower: number;
    confidenceUpper: number;
    confidenceLevel: number;
  }>;
  methodology: string;
  generatedAt: string;
}

export interface PiDecisionRecommendation {
  id: string;
  category: PiDecisionCategory;
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  rationale: string;
  impact: PiDecisionImpact;
  priority: PiDecisionPriority;
  status: PiDecisionStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PiKpiTarget {
  id: string;
  name: string;
  category: PiKpiCategory;
  targetValue: number;
  currentValue: number;
  previousValue: number | null;
  unit: string;
  status: PiKpiStatus;
  trend: PiKpiTrend;
  changePercent: number | null;
  generatedAt: string;
}

export interface PiReport {
  id: string;
  type: PiReportType;
  title: string;
  content: Record<string, unknown>;
  summary: string | null;
  period: string | null;
  status: string;
  generatedAt: string;
}

export interface PiSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updatedAt: string;
}

export interface PiFunnelParams {
  startDate?: string;
  endDate?: string;
}

export interface PiRetentionParams {
  cohortType?: PiCohortType;
  startDate?: string;
  endDate?: string;
}

export interface PiReportParams {
  type?: PiReportType;
  period?: string;
  page?: number;
  limit?: number;
}

export interface PiKpiParams {
  category?: PiKpiCategory;
  status?: PiKpiStatus;
}

export const PI_KPI_TARGETS = {
  mrr: { name: "Monthly Recurring Revenue", category: "revenue" as PiKpiCategory, targetValue: 50000, unit: "USD" },
  arr: { name: "Annual Recurring Revenue", category: "revenue" as PiKpiCategory, targetValue: 600000, unit: "USD" },
  dau: { name: "Daily Active Users", category: "users" as PiKpiCategory, targetValue: 1000, unit: "users" },
  mau: { name: "Monthly Active Users", category: "users" as PiKpiCategory, targetValue: 10000, unit: "users" },
  retention_d30: { name: "30-Day Retention", category: "retention" as PiKpiCategory, targetValue: 40, unit: "percent" },
  churn_rate: { name: "Churn Rate", category: "retention" as PiKpiCategory, targetValue: 5, unit: "percent" },
  arpu: { name: "Average Revenue Per User", category: "revenue" as PiKpiCategory, targetValue: 29.99, unit: "USD" },
  ai_success_rate: { name: "AI Success Rate", category: "ai" as PiKpiCategory, targetValue: 99, unit: "percent" },
  ai_cost_per_generation: { name: "AI Cost Per Generation", category: "ai" as PiKpiCategory, targetValue: 0.05, unit: "USD" },
  credit_utilization: { name: "Credit Utilization", category: "credits" as PiKpiCategory, targetValue: 70, unit: "percent" },
  trial_conversion: { name: "Trial Conversion Rate", category: "subscriptions" as PiKpiCategory, targetValue: 15, unit: "percent" },
  feature_adoption_rate: { name: "Feature Adoption Rate", category: "features" as PiKpiCategory, targetValue: 60, unit: "percent" },
} as const;

export type PiKpiTargetKey = keyof typeof PI_KPI_TARGETS;
