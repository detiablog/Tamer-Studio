import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { currencyProfile } from "@/lib/db/schema/localization";
import type { CurrencyProfile } from "@/lib/localization/types";

export class CurrencyService {
  async getProfile(code: string): Promise<CurrencyProfile | null> {
    const [row] = await db
      .select()
      .from(currencyProfile)
      .where(and(eq(currencyProfile.code, code), eq(currencyProfile.isEnabled, true)))
      .limit(1);

    if (!row) return null;
    return {
      ...row,
      exchangeRateToUsd: Number(row.exchangeRateToUsd ?? "1"),
    } as CurrencyProfile;
  }

  async getEnabledProfiles(): Promise<CurrencyProfile[]> {
    const rows = await db
      .select()
      .from(currencyProfile)
      .where(eq(currencyProfile.isEnabled, true))
      .orderBy(currencyProfile.code);

    return rows.map((c) => ({
      ...c,
      exchangeRateToUsd: Number(c.exchangeRateToUsd ?? "1"),
    })) as CurrencyProfile[];
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

      const [row] = await db
        .update(currencyProfile)
        .set({ exchangeRateToUsd: String(numericRate), updatedAt: new Date() })
        .where(eq(currencyProfile.code, code))
        .returning();

      results.push({
        code,
        updated: !!row,
      });
    }

    return results;
  }
}

export const currencyService = new CurrencyService();
