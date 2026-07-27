import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { SupportedLocale, ResolvedLocale, SupportedCurrency } from "@/lib/localization/types";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/localization/types";

const LOCALE_COOKIE = "tamer_locale";
const ACCEPT_LANGUAGE_HEADER = "accept-language";

export async function detectLocale(request: NextRequest): Promise<ResolvedLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      currency: getDefaultCurrency(cookieLocale),
      country: null,
      timezone: null,
      source: "cookie",
    };
  }

  const acceptLanguage = request.headers.get(ACCEPT_LANGUAGE_HEADER);
  if (acceptLanguage) {
    const parsed = parseAcceptLanguage(acceptLanguage);
    const matched = parsed.find((locale) => isValidLocale(locale));
    if (matched) {
      return {
        locale: matched,
        currency: getDefaultCurrency(matched),
        country: null,
        timezone: null,
        source: "accept-language",
      };
    }
  }

  return {
    locale: DEFAULT_LOCALE,
    currency: getDefaultCurrency(DEFAULT_LOCALE),
    country: null,
    timezone: null,
    source: "fallback",
  };
}

export async function persistLocale(locale: SupportedLocale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export function getPreferredLocaleFromHeader(acceptLanguage: string | null): SupportedLocale | null {
  if (!acceptLanguage) return null;
  const parsed = parseAcceptLanguage(acceptLanguage);
  const matched = parsed.find((locale) => isValidLocale(locale));
  return matched ?? null;
}

function parseAcceptLanguage(header: string): SupportedLocale[] {
  return header
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase())
    .filter((locale): locale is SupportedLocale => isValidLocale(locale));
}

function isValidLocale(locale: string): locale is SupportedLocale {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_LOCALES, locale);
}

function getDefaultCurrency(locale: SupportedLocale): SupportedCurrency {
  switch (locale) {
    case "id":
      return "IDR";
    default:
      return "USD";
  }
}