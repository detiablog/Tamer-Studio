import { cookies } from "next/headers";
import type { ResolvedPreference, UserPreferenceInput } from "./types";
import { detectFromAcceptLanguage, detectFromCloudflare, detectFromVercel } from "../geolocation/geo";
import { getCountryInfo } from "../localization/constants";
import { DEFAULT_LOCALE, DEFAULT_CURRENCY, DEFAULT_TIMEZONE, DEFAULT_COUNTRY } from "../localization/types";

const COOKIE_NAMES = {
  locale: "tamer_locale",
  currency: "tamer_currency",
  country: "tamer_country",
  timezone: "tamer_timezone",
} as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

async function setCookie(name: string, value: string, maxAge: number) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getCookiePreference(): Promise<Partial<UserPreferenceInput>> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(COOKIE_NAMES.locale)?.value;
  const currency = cookieStore.get(COOKIE_NAMES.currency)?.value;
  const country = cookieStore.get(COOKIE_NAMES.country)?.value || null;
  const timezone = cookieStore.get(COOKIE_NAMES.timezone)?.value || null;

  if (!locale && !currency) return {};

  return {
    preferredLanguage: locale || DEFAULT_LOCALE,
    preferredCurrency: currency || DEFAULT_CURRENCY,
    preferredCountry: country,
    preferredTimezone: timezone,
    autoDetectLocale: false,
  };
}

export async function setCookiePreferences(prefs: {
  locale?: string;
  currency?: string;
  country?: string | null;
  timezone?: string | null;
}) {
  if (prefs.locale) await setCookie(COOKIE_NAMES.locale, prefs.locale, COOKIE_MAX_AGE);
  if (prefs.currency) await setCookie(COOKIE_NAMES.currency, prefs.currency, COOKIE_MAX_AGE);
  if (prefs.country !== undefined) {
    if (prefs.country) await setCookie(COOKIE_NAMES.country, prefs.country, COOKIE_MAX_AGE);
  }
  if (prefs.timezone !== undefined) {
    if (prefs.timezone) await setCookie(COOKIE_NAMES.timezone, prefs.timezone, COOKIE_MAX_AGE);
  }
}

export async function detectLocale(request: Request): Promise<ResolvedPreference> {
  const headers = request.headers;
  const acceptLanguage = headers.get("accept-language");

  const userPref = await getCookiePreference();
  if (userPref.preferredLanguage && !userPref.autoDetectLocale) {
    return {
      locale: userPref.preferredLanguage,
      currency: userPref.preferredCurrency || DEFAULT_CURRENCY,
      country: userPref.preferredCountry || DEFAULT_COUNTRY,
      timezone: userPref.preferredTimezone || DEFAULT_TIMEZONE,
      source: "cookie",
    };
  }

  const cfResult = await detectFromCloudflare(headers);
  if (cfResult.country) {
    const info = getCountryInfo(cfResult.country);
    const prefs: ResolvedPreference = {
      locale: info.locale,
      currency: info.currency,
      country: info.code,
      timezone: info.timezone,
      source: "cloudflare",
    };
    setCookiePreferences(prefs);
    return prefs;
  }

  const vercelResult = await detectFromVercel(headers);
  if (vercelResult.country) {
    const info = getCountryInfo(vercelResult.country);
    const prefs: ResolvedPreference = {
      locale: info.locale,
      currency: info.currency,
      country: info.code,
      timezone: info.timezone,
      source: "vercel",
    };
    setCookiePreferences(prefs);
    return prefs;
  }

  const langResult = await detectFromAcceptLanguage(acceptLanguage);
  if (langResult.country) {
    const info = getCountryInfo(langResult.country);
    const prefs: ResolvedPreference = {
      locale: info.locale,
      currency: info.currency,
      country: info.code,
      timezone: info.timezone,
      source: "accept-language",
    };
    setCookiePreferences(prefs);
    return prefs;
  }

  return {
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    country: DEFAULT_COUNTRY,
    timezone: DEFAULT_TIMEZONE,
    source: "fallback",
  };
}

export async function resolveUserPreferences(
  userPref: UserPreferenceInput | null | undefined
): Promise<ResolvedPreference> {
  if (userPref && userPref.preferredLanguage) {
    return {
      locale: userPref.preferredLanguage,
      currency: userPref.preferredCurrency || DEFAULT_CURRENCY,
      country: userPref.preferredCountry || DEFAULT_COUNTRY,
      timezone: userPref.preferredTimezone || DEFAULT_TIMEZONE,
      source: "user",
    };
  }

  const cookiePref = await getCookiePreference();
  if (cookiePref.preferredLanguage) {
    return {
      locale: cookiePref.preferredLanguage,
      currency: cookiePref.preferredCurrency || DEFAULT_CURRENCY,
      country: cookiePref.preferredCountry || "US",
      timezone: cookiePref.preferredTimezone || DEFAULT_TIMEZONE,
      source: "cookie",
    };
  }

  return {
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    country: DEFAULT_COUNTRY,
    timezone: DEFAULT_TIMEZONE,
    source: "fallback",
  };
}
