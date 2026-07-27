import type { SupportedLocale, SupportedCurrency, TimezoneCode } from "./types";
import { DEFAULT_LOCALE, DEFAULT_CURRENCY, DEFAULT_COUNTRY, DEFAULT_TIMEZONE } from "./types";
import { getCountryInfo, getLocaleFromCountry } from "./constants";

export interface LocaleDetectionResult {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  country: string | null;
  timezone: TimezoneCode | null;
  source: "user" | "cookie" | "accept-language" | "geoip" | "fallback";
}

const ACCEPT_LANGUAGE_PRIORITY: Array<{ locale: SupportedLocale; weight: number }> = [
  { locale: "en", weight: 1.0 },
  { locale: "id", weight: 0.9 },
];

function parseAcceptLanguage(header: string | null): SupportedLocale | null {
  if (!header) return null;
  const parts = header.split(",").map((s) => s.trim().split(";")[0].trim().toLowerCase());
  const scored = parts.map((lang) => {
    const match = lang.match(/^([a-z]{2})(?:-[a-z0-9]+)?$/);
    if (!match) return null;
    const code = match[1] as SupportedLocale;
    const found = ACCEPT_LANGUAGE_PRIORITY.find((p) => p.locale === code);
    if (!found) return null;
    return found;
  });
  const valid = scored.filter(Boolean) as Array<{ locale: SupportedLocale; weight: number }>;
  if (valid.length === 0) return null;
  valid.sort((a, b) => b.weight - a.weight);
  return valid[0].locale;
}

export function detectFromAcceptLanguage(header: string | null): LocaleDetectionResult {
  const locale = parseAcceptLanguage(header) ?? DEFAULT_LOCALE;
  const info = getCountryInfo(DEFAULT_COUNTRY);
  return {
    locale,
    currency: info.currency,
    country: DEFAULT_COUNTRY,
    timezone: info.timezone as TimezoneCode | null,
    source: "accept-language",
  };
}

export function detectFromCountry(countryCode: string | null): LocaleDetectionResult {
  if (!countryCode) return detectFallback();
  const info = getCountryInfo(countryCode);
  return {
    locale: info.locale as SupportedLocale,
    currency: info.currency as SupportedCurrency,
    country: countryCode,
    timezone: info.timezone as TimezoneCode | null,
    source: "geoip",
  };
}

export function detectFallback(): LocaleDetectionResult {
  return {
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    country: DEFAULT_COUNTRY,
    timezone: DEFAULT_TIMEZONE,
    source: "fallback",
  };
}

export function resolveLocale(
  options: {
    userLocale?: SupportedLocale | null;
    cookieLocale?: SupportedLocale | null;
    acceptLanguage?: string | null;
    countryCode?: string | null;
  } = {}
): LocaleDetectionResult {
  const {
    userLocale,
    cookieLocale,
    acceptLanguage,
    countryCode,
  } = options;

  if (userLocale) {
    const info = countryCode ? getCountryInfo(countryCode) : getCountryInfo(DEFAULT_COUNTRY);
    return {
      locale: userLocale,
      currency: info.currency as SupportedCurrency,
      country: countryCode ?? DEFAULT_COUNTRY,
      timezone: info.timezone as TimezoneCode | null,
      source: "user",
    };
  }

  if (cookieLocale) {
    const info = countryCode ? getCountryInfo(countryCode) : getCountryInfo(DEFAULT_COUNTRY);
    return {
      locale: cookieLocale,
      currency: info.currency as SupportedCurrency,
      country: countryCode ?? DEFAULT_COUNTRY,
      timezone: info.timezone as TimezoneCode | null,
      source: "cookie",
    };
  }

  if (acceptLanguage) {
    const locale = parseAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
    const info = countryCode ? getCountryInfo(countryCode) : getCountryInfo(DEFAULT_COUNTRY);
    return {
      locale,
      currency: info.currency as SupportedCurrency,
      country: countryCode ?? DEFAULT_COUNTRY,
      timezone: info.timezone as TimezoneCode | null,
      source: "accept-language",
    };
  }

  if (countryCode) {
    return detectFromCountry(countryCode);
  }

  return detectFallback();
}
