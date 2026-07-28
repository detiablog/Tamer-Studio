import { currencyRepository } from "@/core/localization/currency.repository";
import type { CurrencyProfile } from "@/lib/localization/types";

export class CurrencyService {
  async getProfile(code: string): Promise<CurrencyProfile | null> {
    return currencyRepository.getProfileByCode(code);
  }

  async getEnabledProfiles(): Promise<CurrencyProfile[]> {
    return currencyRepository.getEnabledProfiles();
  }

  convert(amount: number, fromCurrency: string, toCurrency: string, profiles: CurrencyProfile[]): number {
    if (fromCurrency === toCurrency) return amount;

    const fromProfile = profiles.find((c) => c.code === fromCurrency);
    const toProfile = profiles.find((c) => c.code === toCurrency);

    if (!fromProfile || !toProfile) return amount;

    const amountInUsd = amount / fromProfile.exchangeRateToUsd;
    return amountInUsd * toProfile.exchangeRateToUsd;
  }

  async updateExchangeRates(rates: Record<string, number>): Promise<{ code: string; updated: boolean }[]> {
    const results: { code: string; updated: boolean }[] = [];

    for (const [code, rate] of Object.entries(rates)) {
      const numericRate = Number(rate);
      if (isNaN(numericRate) || numericRate <= 0) continue;

      const updated = await currencyRepository.updateExchangeRate(code, numericRate);
      results.push({ code, updated });
    }

    return results;
  }
}

export const currencyService = new CurrencyService();
