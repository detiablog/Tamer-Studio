export type SupportedLocale = "en" | "id" | "ja" | "fr" | "de";
export type SupportedCurrency = "USD" | "IDR" | "JPY" | "EUR" | "GBP";
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
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
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
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    locale: "ja-JP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    locale: "en-GB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

export const DEFAULT_LOCALE: SupportedLocale = "en";
export const DEFAULT_CURRENCY: SupportedCurrency = "USD";
export const DEFAULT_COUNTRY = "US";
export const DEFAULT_TIMEZONE = "UTC";
