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
