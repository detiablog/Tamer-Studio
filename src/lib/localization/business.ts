import { getLocalizationService } from "./index";
import { regionService } from "@/core/localization/region.service";

export async function resolveBusinessLocale(
  countryCode: string | null,
  userPrefs: { preferredLanguage?: string; preferredCurrency?: string; autoDetect?: boolean } | null,
  source = "fallback"
): Promise<{ locale: string; currency: string; country: string | null; timezone: string | null; source: string }> {
  if (userPrefs?.preferredLanguage && userPrefs.autoDetect !== false) {
    return {
      locale: userPrefs.preferredLanguage,
      currency: userPrefs.preferredCurrency || "USD",
      country: countryCode,
      timezone: null,
      source,
    };
  }

  const resolution = countryCode
    ? await regionService.resolveFromCountry(countryCode)
    : await regionService.getDefaultProfile();

  if (!resolution) {
    return {
      locale: "en",
      currency: "USD",
      country: countryCode,
      timezone: null,
      source,
    };
  }

  const profile = resolution as { profile: { locale: string; currency: string; timezone: string } };
  return {
    locale: profile.profile.locale,
    currency: profile.profile.currency,
    country: (resolution as { region?: { code: string } | null }).region?.code ?? countryCode ?? null,
    timezone: profile.profile.timezone,
    source,
  };
}

export function applyResolvedLocale(
  resolved: { locale: string; currency: string; country?: string; timezone?: string }
): void {
  const service = getLocalizationService();
  service.setLocale(resolved.locale as any);
  service.setCurrency(resolved.currency);
  if (resolved.country) service.setCountry(resolved.country);
  if (resolved.timezone) service.setTimezone(resolved.timezone);
}
