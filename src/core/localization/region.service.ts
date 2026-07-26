import type {
  LocalizationProfile,
  RegionInfo,
  CurrencyProfile,
  PricingProfileInfo,
  PricingRuleInfo,
  PaymentProfileInfo,
  PaymentMethodInfo,
  BusinessLocaleResolution,
  AdminLocalizationSettings,
} from "@/lib/localization/types";

import { db } from "@/lib/db";
import {
  localizationProfile,
  region,
  paymentProfile,
  paymentMethod,
  currencyProfile,
} from "@/lib/db/schema/localization";
import { eq, and, desc } from "drizzle-orm";

export class RegionService {
  async getProfileByCountry(countryCode: string): Promise<LocalizationProfile | null> {
    const [regionRow] = await db
      .select()
      .from(region)
      .where(and(eq(region.code, countryCode), eq(region.enabled, true)))
      .limit(1);

    if (!regionRow) return null;

    const [profile] = await db
      .select()
      .from(localizationProfile)
      .where(and(eq(localizationProfile.code, regionRow.profileCode), eq(localizationProfile.isEnabled, true)))
      .limit(1);

    if (!profile) return null;

    return {
      ...profile,
      supportedCurrencies: profile.supportedCurrencies ?? [],
      supportedLanguages: profile.supportedLanguages ?? [],
    } as LocalizationProfile;
  }

  async getDefaultProfile(): Promise<LocalizationProfile | null> {
    const [profile] = await db
      .select()
      .from(localizationProfile)
      .where(and(eq(localizationProfile.isDefault, true), eq(localizationProfile.isEnabled, true)))
      .limit(1);

    if (!profile) return null;

    return {
      ...profile,
      supportedCurrencies: profile.supportedCurrencies ?? [],
      supportedLanguages: profile.supportedLanguages ?? [],
    } as LocalizationProfile;
  }

  async getRegions(): Promise<RegionInfo[]> {
    const rows = await db
      .select()
      .from(region)
      .where(eq(region.enabled, true))
      .orderBy(desc(region.priority), region.code);

    return rows.map((r) => ({
      ...r,
    })) as RegionInfo[];
  }

  async resolveFromCountry(countryCode: string): Promise<BusinessLocaleResolution | null> {
    const profile = await this.getProfileByCountry(countryCode);
    if (!profile) return null;

    return this.buildResolution(profile, countryCode);
  }

  private async buildResolution(
    profile: LocalizationProfile,
    countryCode: string
  ): Promise<BusinessLocaleResolution> {
    const regionRows = await db
      .select()
      .from(region)
      .where(eq(region.profileCode, profile.code));

    const regionInfo = regionRows.find((r) => r.code === countryCode) ?? regionRows[0] ?? null;

    const [currencyRow] = await db
      .select()
      .from(currencyProfile)
      .where(and(eq(currencyProfile.code, profile.currency), eq(currencyProfile.isEnabled, true)))
      .limit(1);

    const [paymentRow] = await db
      .select()
      .from(paymentProfile)
      .where(and(eq(paymentProfile.code, profile.paymentProfile), eq(paymentProfile.isEnabled, true)))
      .limit(1);

    const availableCurrencies = await db
      .select()
      .from(currencyProfile)
      .where(eq(currencyProfile.isEnabled, true));

    const availablePaymentMethods = paymentRow
      ? await db
          .select()
          .from(paymentMethod)
          .where(and(eq(paymentMethod.profileId, paymentRow.id), eq(paymentMethod.isEnabled, true)))
          .orderBy(paymentMethod.priority)
      : [];

    return {
      profile,
      region: regionInfo
        ? {
            ...regionInfo,
          }
        : null,
      currency: currencyRow
        ? {
            ...currencyRow,
            exchangeRateToUsd: Number(currencyRow.exchangeRateToUsd ?? "1"),
          }
        : null,
      pricingProfile: null,
      paymentProfile: paymentRow
        ? {
            ...paymentRow,
            config: paymentRow.config ?? {},
          }
        : null,
      availableCurrencies: availableCurrencies.map((c) => ({
        ...c,
        exchangeRateToUsd: Number(c.exchangeRateToUsd ?? "1"),
      })) as CurrencyProfile[],
      availablePaymentMethods: availablePaymentMethods as PaymentMethodInfo[],
    };
  }

  async adminGetSettings(): Promise<AdminLocalizationSettings> {
    const defaultProfile = await this.getDefaultProfile();
    return {
      defaultProfileCode: defaultProfile?.code ?? "default",
      autoDetectEnabled: true,
      supportedLocales: ["en", "id"],
      supportedCurrencies: ["USD", "IDR"],
      defaultCountry: defaultProfile?.code ?? "default",
    };
  }
}

export const regionService = new RegionService();
