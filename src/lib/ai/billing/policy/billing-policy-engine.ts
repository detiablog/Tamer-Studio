import type { BillingPolicy, BillingContext, BillingDecision, BillingRule } from "../../types/billing";

export interface BillingPolicyEngine {
  evaluate(policies: BillingPolicy[], context: BillingContext): Promise<BillingDecision>;
  registerPolicy(policy: BillingPolicy): void;
  evaluateRule(rule: BillingRule, context: BillingContext): Promise<BillingDecision>;
}

export class DefaultBillingPolicyEngine implements BillingPolicyEngine {
  private policies: BillingPolicy[] = [];

  async evaluate(policies: BillingPolicy[], context: BillingContext): Promise<BillingDecision> {
    const sorted = [...policies].sort((a, b) => b.priority - a.priority);
    const modifications: Record<string, unknown> = {};

    for (const policy of sorted) {
      if (!policy.enabled) continue;

      for (const rule of policy.rules) {
        const decision = await this.evaluateRule(rule, context);
        if (!decision.allowed) {
          return decision;
        }
        if (decision.modifications) {
          Object.assign(modifications, decision.modifications);
        }
      }
    }

    return { allowed: true, modifications };
  }

  registerPolicy(policy: BillingPolicy): void {
    this.policies.push(policy);
  }

  async evaluateRule(rule: BillingRule, _context: BillingContext): Promise<BillingDecision> {
    switch (rule.type) {
      case "quota":
        return this.evaluateQuotaRule(rule, _context);
      case "cost_ceiling":
        return this.evaluateCostCeilingRule(rule, _context);
      case "refund_policy":
        return this.evaluateRefundPolicyRule(rule, _context);
      default:
        return { allowed: true };
    }
  }

  private async evaluateQuotaRule(rule: BillingRule, context: BillingContext): Promise<BillingDecision> {
    const condition = rule.condition as { maxCredits?: number };
    const requestedCredits = (context.data.estimatedCredits as number) ?? 0;

    if (condition.maxCredits !== undefined && requestedCredits > condition.maxCredits) {
      return {
        allowed: false,
        reason: `Requested credits ${requestedCredits} exceeds quota ${condition.maxCredits}`,
      };
    }

    return { allowed: true };
  }

  private async evaluateCostCeilingRule(rule: BillingRule, context: BillingContext): Promise<BillingDecision> {
    const condition = rule.condition as { maxCost?: number };
    const estimatedCost = (context.data.estimatedCost as number) ?? 0;

    if (condition.maxCost !== undefined && estimatedCost > condition.maxCost) {
      return {
        allowed: false,
        reason: `Estimated cost ${estimatedCost} exceeds ceiling ${condition.maxCost}`,
      };
    }

    return { allowed: true };
  }

  private async evaluateRefundPolicyRule(rule: BillingRule, _context: BillingContext): Promise<BillingDecision> {
    const condition = rule.condition as { refundablePeriodDays?: number };
    const action = rule.action as { autoApprove?: boolean };

    if (action.autoApprove && condition.refundablePeriodDays) {
      return {
        allowed: true,
        modifications: { autoApprove: true, refundablePeriodDays: condition.refundablePeriodDays },
      };
    }

    return { allowed: true };
  }
}
