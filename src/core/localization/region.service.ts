import { DefaultLocalizationRepository } from "./localization.repository";
import type { LocalizationRepository } from "./localization.repository";
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

export class RegionService {
  private repository: LocalizationRepository;

  constructor(repository?: LocalizationRepository) {
    this.repository = repository ?? new DefaultLocalizationRepository();
  }

  async getProfileByCountry(countryCode: string): Promise<LocalizationProfile | null> {
    const regions = await this.repository.getRegions();
    const regionRow = regions.find((r) => r.code === countryCode && r.enabled);
    if (!regionRow) return null;

    const profiles = await this.repository.getProfiles();
    const profile = profiles.find((p) => p.code === regionRow.profileCode && p.isEnabled);
    if (!profile) return null;

    return {
      ...profile,
      supportedCurrencies: profile.supportedCurrencies ?? [],
      supportedLanguages: profile.supportedLanguages ?? [],
    };
  }

  async getDefaultProfile(): Promise<LocalizationProfile | null> {
    const profiles = await this.repository.getProfiles();
    const profile = profiles.find((p) => p.isDefault && p.isEnabled);
    if (!profile) return null;

    return {
      ...profile,
      supportedCurrencies: profile.supportedCurrencies ?? [],
      supportedLanguages: profile.supportedLanguages ?? [],
    };
  }

  async getRegions(): Promise<RegionInfo[]> {
    return this.repository.getRegions();
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
    const regions = await this.repository.getRegions();
    const regionRows = regions.filter((r) => r.profileCode === profile.code);

    const regionInfo = regionRows.find((r) => r.code === countryCode) ?? regionRows[0] ?? null;

    const currencies = await this.repository.getCurrencyProfiles();
    const currencyRow = currencies.find((c) => c.code === profile.currency && c.isEnabled);

    const paymentProfiles = await this.repository.getPaymentProfiles();
    const paymentRow = paymentProfiles.find((p) => p.code === profile.paymentProfile && p.isEnabled);

    const paymentMethods = paymentRow
      ? await this.repository.getPaymentMethods(paymentRow.id)
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
      availableCurrencies: currencies.map((c) => ({
        ...c,
        exchangeRateToUsd: Number(c.exchangeRateToUsd ?? "1"),
      })) as CurrencyProfile[],
      availablePaymentMethods: paymentMethods as PaymentMethodInfo[],
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