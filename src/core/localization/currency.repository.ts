import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { currencyProfile } from "@/lib/db/schema/localization";
import type { CurrencyProfile } from "@/lib/localization/types";

export class CurrencyRepository {
  async getProfileByCode(code: string): Promise<CurrencyProfile | null> {
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

  async updateExchangeRate(code: string, rate: number): Promise<boolean> {
    const [row] = await db
      .update(currencyProfile)
      .set({ exchangeRateToUsd: String(rate), updatedAt: new Date() })
      .where(eq(currencyProfile.code, code))
      .returning();

    return !!row;
  }
}

export const currencyRepository = new CurrencyRepository();
