import type { PlanRepository, WalletManager } from "../../types/billing";

export interface QuotaEnforcer {
  checkQuota(request: QuotaCheckRequest): Promise<QuotaCheckResult>;
  recordUsage(workspaceId: string, usage: QuotaUsage): Promise<void>;
  getQuotaUsage(workspaceId: string): Promise<QuotaUsage | undefined>;
}

export interface QuotaCheckRequest {
  workspaceId: string;
  capabilityId: string;
  estimatedCredits: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  remainingCredits: number;
  remainingRequests: number;
}

export interface QuotaUsage {
  workspaceId: string;
  planId: string;
  periodStart: string;
  periodEnd: string;
  creditsUsed: number;
  requestsUsed: number;
  executionMinutesUsed: number;
}

export class DefaultQuotaEnforcer implements QuotaEnforcer {
  constructor(
    private planRepository: PlanRepository,
    private walletManager: WalletManager,
  ) {}

  async checkQuota(request: QuotaCheckRequest): Promise<QuotaCheckResult> {
    const wallet = await this.walletManager.getWallet(request.workspaceId);

    if (wallet.availableCredits < request.estimatedCredits) {
      return {
        allowed: false,
        reason: "Insufficient credits",
        remainingCredits: wallet.availableCredits,
        remainingRequests: 0,
      };
    }

    return {
      allowed: true,
      remainingCredits: wallet.availableCredits - request.estimatedCredits,
      remainingRequests: 9999,
    };
  }

  async recordUsage(workspaceId: string, usage: QuotaUsage): Promise<void> {
    const existing = await this.getQuotaUsage(workspaceId);
    if (existing) {
      usage.creditsUsed += existing.creditsUsed;
      usage.requestsUsed += existing.requestsUsed;
      usage.executionMinutesUsed += existing.executionMinutesUsed;
    }
  }

  async getQuotaUsage(workspaceId: string): Promise<QuotaUsage | undefined> {
    const plan = await this.planRepository.listPlans();
    const activePlan = plan[0];

    if (!activePlan) return undefined;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    return {
      workspaceId,
      planId: activePlan.id,
      periodStart,
      periodEnd,
      creditsUsed: 0,
      requestsUsed: 0,
      executionMinutesUsed: 0,
    };
  }
}
