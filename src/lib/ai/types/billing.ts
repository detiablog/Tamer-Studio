import type { UsageRecord, UsageSummary } from "./monitoring";

export type { UsageRecord, UsageSummary } from "./monitoring";

export type CreditAmount = number;
export type CreditId = string;
export type WalletId = string;
export type TransactionId = string;
export type ReservationId = string;

export type BillingEventType =
  | "wallet.created"
  | "transaction.debited"
  | "transaction.credited"
  | "transaction.refunded"
  | "reservation.created"
  | "reservation.confirmed"
  | "reservation.released"
  | "reservation.expired"
  | "quota.exceeded"
  | "quota.warning"
  | "cost.estimated"
  | "cost.calculated"
  | "policy.evaluated"
  | "billing.error";

export type CreditTransactionType =
  | "purchase"
  | "usage_debit"
  | "refund"
  | "reserve"
  | "release"
  | "adjustment"
  | "expiration";

export interface CreditTransaction {
  id: TransactionId;
  walletId: WalletId;
  workspaceId: string;
  type: CreditTransactionType;
  amount: CreditAmount;
  balanceBefore: CreditAmount;
  balanceAfter: CreditAmount;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Wallet {
  id: WalletId;
  workspaceId: string;
  availableCredits: CreditAmount;
  reservedCredits: CreditAmount;
  pendingCredits: CreditAmount;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditReservation {
  id: ReservationId;
  walletId: WalletId;
  workspaceId: string;
  executionId: string;
  amount: CreditAmount;
  status: "active" | "released" | "converted" | "expired";
  createdAt: string;
  releasedAt?: string;
  convertedTransactionId?: TransactionId;
}

export interface ProviderPricing {
  providerId: string;
  capabilityId: string;
  modelId: string;
  inputPricePerUnit: number;
  outputPricePerUnit: number;
  unit: "token" | "image" | "video_second" | "audio_second" | "request";
  currency: string;
  effectiveFrom: string;
}

export interface CostRecord {
  executionId: string;
  providerId: string;
  capabilityId: string;
  inputUnits: number;
  outputUnits: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
  pricingUsed: ProviderPricing;
}

export interface CostSummary {
  totalCost: number;
  currency: string;
  byProvider: Record<string, number>;
  byCapability: Record<string, number>;
  byPeriod: {
    daily: Array<{ date: string; cost: number }>;
    monthly: Array<{ month: string; cost: number }>;
  };
}

export interface CostEstimateBreakdown {
  providerId: string;
  capabilityId: string;
  estimatedUnits: number;
  estimatedCost: number;
}

export interface CostEstimate {
  executionId: string;
  estimatedCredits: CreditAmount;
  estimatedCost: number;
  currency: string;
  confidence: "low" | "medium" | "high";
  breakdown: CostEstimateBreakdown[];
}

export interface PlanFeature {
  key: string;
  name: string;
  enabled: boolean;
}

export interface PlanLimits {
  maxRequestsPerMinute: number;
  maxConcurrentExecutions: number;
  maxModelsPerExecution: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyCredits: CreditAmount;
  reservedCreditsLimit: CreditAmount;
  features: PlanFeature[];
  limits: PlanLimits;
  pricePerCredit?: number;
  currency: string;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planId: string;
  status: "active" | "canceled" | "past_due" | "incomplete";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
  quantity?: number;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  subscriptionId?: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  lineItems: InvoiceLineItem[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QuotaUsage {
  workspaceId: string;
  planId: string;
  periodStart: string;
  periodEnd: string;
  creditsUsed: CreditAmount;
  requestsUsed: number;
  executionMinutesUsed: number;
}

export interface QuotaCheckRequest {
  workspaceId: string;
  capabilityId: string;
  estimatedCredits: CreditAmount;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  remainingCredits: CreditAmount;
  remainingRequests: number;
}

export interface BillingEvent {
  id: string;
  type: BillingEventType;
  workspaceId: string;
  executionId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export type BillingEventHandler = (event: BillingEvent) => void | Promise<void>;

export interface BillingRule {
  type: "quota" | "cost_ceiling" | "auto_topup" | "refund_policy";
  condition: Record<string, unknown>;
  action: Record<string, unknown>;
}

export interface BillingPolicy {
  id: string;
  name: string;
  description: string;
  rules: BillingRule[];
  priority: number;
  enabled: boolean;
}

export interface BillingContext {
  workspaceId: string;
  action: string;
  data: Record<string, unknown>;
}

export interface BillingDecision {
  allowed: boolean;
  reason?: string;
  modifications?: Record<string, unknown>;
}

export interface CostTrend {
  date: string;
  cost: number;
  credits: CreditAmount;
  requestCount: number;
}

export interface CostAnomaly {
  date: string;
  expectedCost: number;
  actualCost: number;
  deviation: number;
  severity: "low" | "medium" | "high";
}

export interface CostAnalyticsReport {
  workspaceId: string;
  generatedAt: string;
  period: string;
  trends: CostTrend[];
  anomalies: CostAnomaly[];
  providerDistribution: Record<string, number>;
  totalCreditsUsed: CreditAmount;
  totalCost: number;
  currency: string;
}

export interface WalletManager {
  getWallet(workspaceId: string): Promise<Wallet>;
  createWallet(workspaceId: string): Promise<Wallet>;
  debit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Exclude<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction>;
  credit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Extract<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction>;
  refund(
    walletId: WalletId,
    workspaceId: string,
    transactionId: TransactionId,
    reason: string,
  ): Promise<CreditTransaction>;
  getTransactionHistory(workspaceId: string): Promise<CreditTransaction[]>;
}

export interface CostEngine {
  calculateCost(executionId: string, usage: UsageRecord): Promise<CostRecord>;
  getCostSummary(workspaceId: string, period: string): Promise<CostSummary>;
  registerPricing(pricing: ProviderPricing): void;
  getPricing(providerId: string, capabilityId: string): ProviderPricing | undefined;
}

export interface CreditEngine {
  convertCostToCredits(cost: number, currency: string): CreditAmount;
  getConversionRate(currency: string): number;
}

export interface EstimationEngine {
  estimate(executionId: string, inputs: EstimationInput): Promise<CostEstimate>;
  estimateBreakdown(providerId: string, capabilityId: string, units: number): Promise<CostEstimateBreakdown>;
}

export interface EstimationInput {
  executionId: string;
  providerId: string;
  capabilityId: string;
  modelId: string;
  estimatedTokens?: number;
  estimatedImages?: number;
  estimatedVideoSeconds?: number;
  estimatedAudioSeconds?: number;
  estimatedRequests?: number;
}

export interface ReservationSystem {
  reserve(
    walletId: string,
    workspaceId: string,
    executionId: string,
    amount: CreditAmount,
  ): Promise<CreditReservation>;
  confirm(reservationId: ReservationId, actualCredits: CreditAmount): Promise<CreditReservation>;
  release(reservationId: ReservationId): Promise<CreditReservation>;
  getActiveReservations(workspaceId: string): Promise<CreditReservation[]>;
  getByExecution(executionId: string): Promise<CreditReservation | undefined>;
}

export interface BillingEventBus {
  emit(event: BillingEvent): Promise<void>;
  subscribe(type: BillingEventType, handler: BillingEventHandler): () => void;
}

export interface PlanRepository {
  getPlan(planId: string): Promise<Plan | undefined>;
  listPlans(): Promise<Plan[]>;
  createPlan(plan: Plan): Promise<Plan>;
}

export interface QuotaEnforcer {
  checkQuota(request: QuotaCheckRequest): Promise<QuotaCheckResult>;
  recordUsage(workspaceId: string, usage: QuotaUsage): Promise<void>;
  getQuotaUsage(workspaceId: string): Promise<QuotaUsage | undefined>;
}

export interface BillingPolicyEngine {
  evaluate(policies: BillingPolicy[], context: BillingContext): Promise<BillingDecision>;
  registerPolicy(policy: BillingPolicy): void;
  evaluateRule(rule: BillingRule, context: BillingContext): Promise<BillingDecision>;
}

export interface CostAnalytics {
  generateReport(workspaceId: string, period: string): Promise<CostAnalyticsReport>;
  detectAnomalies(workspaceId: string, threshold: number): Promise<CostAnomaly[]>;
  getProviderDistribution(workspaceId: string): Promise<Record<string, number>>;
}

export interface UsageCollector {
  record(executionId: string, usage: UsageRecord): Promise<void>;
  getByExecution(executionId: string): Promise<UsageRecord | undefined>;
  getByCapability(capabilityId: string): Promise<UsageRecord[]>;
  getSummary(): Promise<UsageSummary>;
}

export interface BillingEngine {
  getWallet(workspaceId: string): Promise<Wallet>;
  createWallet(workspaceId: string): Promise<Wallet>;
  debit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Exclude<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction>;
  credit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Extract<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction>;
  refund(
    walletId: WalletId,
    workspaceId: string,
    transactionId: TransactionId,
    reason: string,
  ): Promise<CreditTransaction>;
  getTransactionHistory(workspaceId: string): Promise<CreditTransaction[]>;
  reserveCredits(walletId: string, workspaceId: string, executionId: string, amount: CreditAmount): Promise<CreditReservation>;
  confirmReservation(reservationId: ReservationId, actualCredits: CreditAmount): Promise<CreditReservation>;
  releaseReservation(reservationId: ReservationId): Promise<CreditReservation>;
  getReservation(executionId: string): Promise<CreditReservation | undefined>;
  recordUsage(executionId: string, usage: UsageRecord): Promise<void>;
  calculateCost(executionId: string, usage: UsageRecord): Promise<CostRecord>;
  estimateCost(inputs: EstimationInput): Promise<CostEstimate>;
  checkQuota(request: QuotaCheckRequest): Promise<QuotaCheckResult>;
  recordQuotaUsage(workspaceId: string, usage: QuotaUsage): Promise<void>;
  getPlan(planId: string): Promise<Plan | undefined>;
  listPlans(): Promise<Plan[]>;
  getSubscription(workspaceId: string): Promise<Subscription | undefined>;
  createSubscription(workspaceId: string, planId: string): Promise<Subscription>;
  createInvoice(workspaceId: string, lineItems: InvoiceLineItem[]): Promise<Invoice>;
  getInvoice(invoiceId: string): Promise<Invoice | undefined>;
  listInvoices(workspaceId: string): Promise<Invoice[]>;
  evaluatePolicies(policies: BillingPolicy[], context: BillingContext): Promise<BillingDecision>;
  generateCostReport(workspaceId: string, period: string): Promise<CostAnalyticsReport>;
  detectCostAnomalies(workspaceId: string, threshold: number): Promise<CostAnomaly[]>;
  emit(event: BillingEvent): Promise<void>;
}
