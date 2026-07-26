export type SupportedLocale = "en" | "id";
export type SupportedCurrency = "USD" | "IDR";
export type SupportedTimezone = string;

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
}

export interface CurrencyInfo {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  locale: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}

export interface CountryInfo {
  code: string;
  name: string;
  nativeName: string;
  locale: SupportedLocale;
  currency: SupportedCurrency;
  timezone: string;
  phoneCode: string;
}

export interface UserPreferences {
  preferredLanguage: SupportedLocale;
  preferredCurrency: SupportedCurrency;
  preferredCountry: string | null;
  preferredTimezone: string | null;
  autoDetectLocale: boolean;
}

export interface ResolvedLocale {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  country: string | null;
  timezone: string | null;
  source: "user" | "cookie" | "cloudflare" | "vercel" | "accept-language" | "geoip" | "fallback";
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },
  id: {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    direction: "ltr",
  },
};

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  IDR: {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    locale: "id-ID",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

export const DEFAULT_LOCALE: SupportedLocale = "en";
export const DEFAULT_CURRENCY: SupportedCurrency = "USD";
export const DEFAULT_COUNTRY = "US";
export const DEFAULT_TIMEZONE = "UTC";

export type LocaleCode = string;
export type CurrencyCode = string;
export type TimezoneCode = string;

export interface LocalizationProfile {
  id: string;
  code: string;
  name: string;
  locale: LocaleCode;
  currency: CurrencyCode;
  country: string | null;
  timezone: TimezoneCode;
  isDefault: boolean;
  isEnabled: boolean;
  pricingProfile: string;
  paymentProfile: string;
  supportedCurrencies: string[];
  supportedLanguages: string[];
}

export interface RegionInfo {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
  profileCode: string;
  enabled: boolean;
  priority: number;
}

export interface CurrencyProfile {
  id: string;
  code: string;
  name: string;
  symbol: string;
  locale: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
  exchangeRateToUsd: number;
  isEnabled: boolean;
}

export interface PricingProfileInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  currency: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
}

export interface PricingRuleInfo {
  id: string;
  profileId: string;
  planId: string;
  displayPrice: string;
  amount: string;
  currency: string;
  billingCycle: string;
  isVisible: boolean;
}

export interface PaymentProfileInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  config: Record<string, unknown>;
}

export interface PaymentMethodInfo {
  id: string;
  profileId: string;
  provider: string;
  name: string;
  isEnabled: boolean;
  priority: number;
  config: Record<string, unknown>;
}

export interface BusinessLocaleResolution {
  profile: LocalizationProfile;
  region: RegionInfo | null;
  currency: CurrencyProfile | null;
  pricingProfile: PricingProfileInfo | null;
  paymentProfile: PaymentProfileInfo | null;
  availableCurrencies: CurrencyProfile[];
  availablePaymentMethods: PaymentMethodInfo[];
}

export interface AdminLocalizationSettings {
  defaultProfileCode: string;
  autoDetectEnabled: boolean;
  supportedLocales: string[];
  supportedCurrencies: string[];
  defaultCountry: string;
}
