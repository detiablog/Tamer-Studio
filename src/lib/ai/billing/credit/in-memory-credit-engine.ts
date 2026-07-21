import type { CreditEngine } from "./credit-engine";
import type { CreditAmount } from "../../types/billing";

export class InMemoryCreditEngine implements CreditEngine {
  private rates: Map<string, number> = new Map([
    ["USD", 100],
    ["EUR", 110],
    ["GBP", 125],
  ]);

  convertCostToCredits(cost: number, currency: string): CreditAmount {
    const rate = this.rates.get(currency) ?? 100;
    return Math.ceil(cost * rate);
  }

  getConversionRate(currency: string): number {
    return this.rates.get(currency) ?? 100;
  }
}
