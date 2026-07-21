import type { CreditAmount } from "../../types/billing";

export interface CreditEngine {
  convertCostToCredits(cost: number, currency: string): CreditAmount;
  getConversionRate(currency: string): number;
}
