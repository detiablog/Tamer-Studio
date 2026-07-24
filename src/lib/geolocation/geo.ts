import type { GeoResult } from "./types";

export async function detectFromCloudflare(headers: Headers): Promise<GeoResult> {
  const cfIpCountry = headers.get("cf-ipcountry");
  if (cfIpCountry && cfIpCountry !== "XX") {
    return { country: cfIpCountry, source: "cloudflare" };
  }
  return { country: null, source: "fallback" };
}

export async function detectFromVercel(headers: Headers): Promise<GeoResult> {
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry !== "XX") {
    return { country: vercelCountry, source: "vercel" };
  }
  return { country: null, source: "fallback" };
}

export async function detectFromAcceptLanguage(
  acceptLanguage: string | null
): Promise<GeoResult> {
  if (!acceptLanguage) return { country: null, source: "fallback" };

  const lang = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (!lang) return { country: null, source: "fallback" };

  const primary = lang.split("-")[0];
  const countryMap: Record<string, string> = {
    id: "ID",
    en: "US",
    ms: "MY",
    th: "TH",
    vi: "VN",
    tl: "PH",
    jv: "ID",
    su: "ID",
    pt: "BR",
    es: "ES",
    fr: "FR",
    de: "DE",
    it: "IT",
    ja: "JP",
    ko: "KR",
    zh: "CN",
    hi: "IN",
    ar: "SA",
    tr: "TR",
    ru: "RU",
    nl: "NL",
    sv: "SE",
    no: "NO",
    da: "DK",
    fi: "FI",
    pl: "PL",
    he: "IL",
    af: "ZA",
    ur: "PK",
    bn: "BD",
  };

  const country = countryMap[primary] || countryMap[lang] || null;
  return { country, source: country ? "accept-language" : "fallback" };
}

export function detectFromXForwardedFor(xForwardedFor: string | null): string | null {
  if (!xForwardedFor) return null;
  const ip = xForwardedFor.split(",")[0]?.trim();
  if (!ip) return null;
  return ip;
}
