import { SUPPORTED_CURRENCIES } from "@/lib/currency/constants";
import type { SupportedCurrency } from "@/lib/localization/types";

export interface CurrencyRuntime {
  getCurrency(): SupportedCurrency;
  getSymbol(): string;
  getLocale(): string;
  format(amount: number, options?: Intl.NumberFormatOptions): string;
}

export class DefaultCurrencyRuntime implements CurrencyRuntime {
  private currency: SupportedCurrency;

  constructor(currency: SupportedCurrency = "USD") {
    this.currency = currency;
  }

  getCurrency(): SupportedCurrency {
    return this.currency;
  }

  getSymbol(): string {
    return SUPPORTED_CURRENCIES[this.currency]?.symbol ?? "$";
  }

  getLocale(): string {
    return SUPPORTED_CURRENCIES[this.currency]?.locale ?? "en-US";
  }

  format(amount: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.getLocale(), {
        style: "currency",
        currency: this.currency,
        ...options,
      }).format(amount);
    } catch {
      return `${this.getSymbol()}${amount.toFixed(2)}`;
    }
  }

  setCurrency(currency: SupportedCurrency): void {
    this.currency = currency;
  }
}