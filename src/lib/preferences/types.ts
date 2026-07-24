export type PreferenceSource = "user" | "cookie" | "cloudflare" | "vercel" | "accept-language" | "geoip" | "fallback";

export interface UserPreferenceInput {
  preferredLanguage: string;
  preferredCurrency: string;
  preferredCountry: string | null;
  preferredTimezone: string | null;
  autoDetectLocale: boolean;
}

export interface ResolvedPreference {
  locale: string;
  currency: string;
  country: string | null;
  timezone: string | null;
  source: PreferenceSource;
}
