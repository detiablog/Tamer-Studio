import type { BillingEngine, Wallet, CreditTransaction, CreditTransactionType, CreditReservation, CreditAmount, WalletId, TransactionId, ReservationId, UsageRecord, CostRecord, CostEstimate, EstimationInput, Plan, Subscription, Invoice, InvoiceLineItem, QuotaCheckRequest, QuotaCheckResult, QuotaUsage, BillingEvent, BillingPolicy, BillingContext, BillingDecision, CostAnalyticsReport, CostAnomaly } from "@/lib/ai/types/billing";
import { WalletService } from "../wallet";
import { UsageService } from "../usage";
import { DefaultCostEngine } from "../cost";
import { DefaultSubscriptionRepository, PlanService } from "../subscription";
import { DefaultInvoiceRepository } from "../invoice";
import { logger } from "@/core/logger";

export class DefaultBillingEngine implements BillingEngine {
  private walletService = new WalletService();
  private usageService = new UsageService();
  private costEngine = new DefaultCostEngine();
  private subscriptionRepository = new DefaultSubscriptionRepository();
  private planService = new PlanService();
  private invoiceRepository = new DefaultInvoiceRepository();

  async getWallet(workspaceId: string): Promise<Wallet> {
    return this.walletService.getWallet(workspaceId);
  }

  async createWallet(workspaceId: string): Promise<Wallet> {
    return this.walletService.createWallet(workspaceId);
  }

  async debit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Exclude<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    return this.walletService.debit(walletId, workspaceId, amount, type, description, metadata);
  }

  async credit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Extract<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    return this.walletService.credit(walletId, workspaceId, amount, type, description, metadata);
  }

  async refund(walletId: WalletId, workspaceId: string, transactionId: TransactionId, reason: string): Promise<CreditTransaction> {
    return this.walletService.refund(walletId, workspaceId, transactionId, reason);
  }

  async getTransactionHistory(workspaceId: string): Promise<CreditTransaction[]> {
    return this.walletService.getTransactionHistory(workspaceId);
  }

  async reserveCredits(walletId: string, workspaceId: string, executionId: string, amount: CreditAmount): Promise<CreditReservation> {
    const wallet = await this.walletService.getWallet(workspaceId);
    if (wallet.availableCredits < amount) {
      throw new Error(`Insufficient credits to reserve: need ${amount}, have ${wallet.availableCredits}`);
    }

    await this.walletService.debit(walletId, workspaceId, amount, "reserve", `Reservation for execution ${executionId}`, { executionId });

    return {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      walletId,
      workspaceId,
      executionId,
      amount,
      status: "active",
      createdAt: new Date().toISOString(),
    };
  }

  async confirmReservation(reservationId: ReservationId, actualCredits: CreditAmount): Promise<CreditReservation> {
    return {
      id: reservationId,
      walletId: "",
      workspaceId: "",
      executionId: "",
      amount: actualCredits,
      status: "converted",
      createdAt: new Date().toISOString(),
      convertedTransactionId: reservationId,
    };
  }

  async releaseReservation(reservationId: ReservationId): Promise<CreditReservation> {
    return {
      id: reservationId,
      walletId: "",
      workspaceId: "",
      executionId: "",
      amount: 0,
      status: "released",
      createdAt: new Date().toISOString(),
      releasedAt: new Date().toISOString(),
    };
  }

  async getReservation(_executionId: string): Promise<CreditReservation | undefined> {
    return undefined;
  }

  async recordUsage(executionId: string, usage: UsageRecord): Promise<void> {
    await this.usageService.record(executionId, usage);
  }

  async calculateCost(executionId: string, usage: UsageRecord): Promise<CostRecord> {
    const result = await this.costEngine.calculateCost(executionId, usage);
    return result.costRecord;
  }

  async estimateCost(inputs: EstimationInput): Promise<CostEstimate> {
    return this.costEngine.estimate(inputs.executionId, inputs);
  }

  async checkQuota(request: QuotaCheckRequest): Promise<QuotaCheckResult> {
    try {
      const wallet = await this.walletService.getWallet(request.workspaceId);
      return {
        allowed: wallet.availableCredits >= request.estimatedCredits,
        remainingCredits: wallet.availableCredits,
        remainingRequests: 9999,
      };
    } catch {
      return { allowed: false, remainingCredits: 0, remainingRequests: 0 };
    }
  }

  async recordQuotaUsage(workspaceId: string, usage: QuotaUsage): Promise<void> {
    logger.info("Quota usage recorded", { workspaceId, usage });
  }

  async getPlan(planId: string): Promise<Plan | undefined> {
    return this.planService.getPlan(planId);
  }

  async listPlans(): Promise<Plan[]> {
    return this.planService.listPlans();
  }

  async getSubscription(workspaceId: string): Promise<Subscription | undefined> {
    return this.subscriptionRepository.getSubscription(workspaceId);
  }

  async createSubscription(workspaceId: string, planId: string): Promise<Subscription> {
    return this.subscriptionRepository.createSubscription(workspaceId, planId);
  }

  async createInvoice(workspaceId: string, lineItems: InvoiceLineItem[]): Promise<Invoice> {
    return this.invoiceRepository.createInvoice(workspaceId, lineItems);
  }

  async getInvoice(invoiceId: string): Promise<Invoice | undefined> {
    return this.invoiceRepository.getInvoice(invoiceId);
  }

  async listInvoices(workspaceId: string): Promise<Invoice[]> {
    return this.invoiceRepository.listInvoices(workspaceId);
  }

  async evaluatePolicies(policies: BillingPolicy[], context: BillingContext): Promise<BillingDecision> {
    const sorted = [...policies].sort((a, b) => b.priority - a.priority);
    const modifications: Record<string, unknown> = {};
    for (const policy of sorted) {
      if (!policy.enabled) continue;
      for (const rule of policy.rules) {
        if (rule.type === "quota") {
          const condition = rule.condition as { maxCredits?: number };
          const requestedCredits = (context.data.estimatedCredits as number) ?? 0;
          if (condition.maxCredits !== undefined && requestedCredits > condition.maxCredits) {
            return { allowed: false, reason: `Requested credits ${requestedCredits} exceeds quota ${condition.maxCredits}` };
          }
        }
        if (rule.type === "cost_ceiling") {
          const condition = rule.condition as { maxCost?: number };
          const estimatedCost = (context.data.estimatedCost as number) ?? 0;
          if (condition.maxCost !== undefined && estimatedCost > condition.maxCost) {
            return { allowed: false, reason: `Estimated cost ${estimatedCost} exceeds ceiling ${condition.maxCost}` };
          }
        }
      }
    }
    return { allowed: true, modifications };
  }

  async generateCostReport(workspaceId: string, period: string): Promise<CostAnalyticsReport> {
    return {
      workspaceId,
      generatedAt: new Date().toISOString(),
      period,
      trends: [],
      anomalies: [],
      providerDistribution: {},
      totalCreditsUsed: 0,
      totalCost: 0,
      currency: "USD",
    };
  }

  async detectCostAnomalies(_workspaceId: string, _threshold: number): Promise<CostAnomaly[]> {
    return [];
  }

  async emit(event: BillingEvent): Promise<void> {
    logger.audit(`Billing event: ${event.type}`, { workspaceId: event.workspaceId, executionId: event.executionId, data: event.data });
  }
}
