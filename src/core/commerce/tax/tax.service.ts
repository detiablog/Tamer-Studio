import type { TaxRule, TaxCalculation } from "../types";
import { DefaultTaxRepository } from "./tax.repository";

export interface TaxService {
  registerTaxRule(rule: Omit<TaxRule, "id" | "createdAt" | "updatedAt">): Promise<TaxRule>;
  getTaxRules(region: string): Promise<TaxRule[]>;
  calculateTax(subtotal: number, currency: string, region: string): Promise<TaxCalculation>;
}

export class DefaultTaxService implements TaxService {
  private repository = new DefaultTaxRepository();

  async registerTaxRule(rule: Omit<TaxRule, "id" | "createdAt" | "updatedAt">): Promise<TaxRule> {
    return this.repository.createTaxRule(rule);
  }

  async getTaxRules(region: string): Promise<TaxRule[]> {
    return this.repository.getTaxRules(region);
  }

  async calculateTax(subtotal: number, currency: string, region: string): Promise<TaxCalculation> {
    const rules = await this.repository.getTaxRules(region);
    const applicableRules = rules.filter((rule) => {
      if (rule.currency !== currency) return false;
      if (rule.minAmount !== undefined && subtotal < rule.minAmount) return false;
      if (rule.maxAmount !== undefined && subtotal > rule.maxAmount) return false;
      return true;
    });

    applicableRules.sort((a, b) => a.priority - b.priority);

    let totalTax = 0;
    const appliedRules: TaxCalculation["appliedRules"] = [];

    for (const rule of applicableRules) {
      const taxableAmount = rule.type === "percentage" ? subtotal : 1;
      const taxAmount = rule.type === "percentage" ? (taxableAmount * rule.rate) / 100 : rule.rate;
      totalTax += taxAmount;
      appliedRules.push({
        ruleId: rule.id,
        name: rule.name,
        amount: Math.round(taxAmount * 100) / 100,
      });
    }

    totalTax = Math.round(totalTax * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: totalTax,
      total: Math.round((subtotal + totalTax) * 100) / 100,
      currency,
      appliedRules,
    };
  }
}
