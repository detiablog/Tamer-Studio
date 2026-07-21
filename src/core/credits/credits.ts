import type { CreditEngine } from "@/lib/ai/types/billing";
export class DefaultCreditEngine implements CreditEngine {
  private rates: Map<string, number> = new Map([
    ["USD", 100],
    ["EUR", 110],
    ["GBP", 125],
  ]);

  convertCostToCredits(cost: number, currency: string): number {
    const rate = this.rates.get(currency) ?? 100;
    return Math.ceil(cost * rate);
  }

  getConversionRate(currency: string): number {
    return this.rates.get(currency) ?? 100;
  }
}
