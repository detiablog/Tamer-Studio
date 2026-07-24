import type { SupportedLocale, SupportedCurrency, UserPreferences, ResolvedLocale } from "./types";
import { getTranslation, getTranslations } from "./translations";
import type { TranslationKey } from "./keys";
import { DEFAULT_LOCALE, DEFAULT_CURRENCY, DEFAULT_COUNTRY, DEFAULT_TIMEZONE } from "./types";

export class LocalizationService {
  private locale: SupportedLocale;
  private currency: string;
  private country: string | null;
  private timezone: string | null;
  private autoDetect: boolean;

  constructor(locale: SupportedLocale = DEFAULT_LOCALE) {
    this.locale = locale;
    this.currency = DEFAULT_CURRENCY;
    this.country = DEFAULT_COUNTRY;
    this.timezone = DEFAULT_TIMEZONE;
    this.autoDetect = true;
  }

  t(key: string, fallback?: string): string {
    return getTranslation(this.locale, key as TranslationKey, fallback);
  }

  getTranslations() {
    return getTranslations(this.locale);
  }

  getLocale(): SupportedLocale {
    return this.locale;
  }

  setLocale(locale: SupportedLocale) {
    this.locale = locale;
  }

  getCurrency(): string {
    return this.currency;
  }

  setCurrency(currency: string) {
    this.currency = currency;
  }

  getCountry(): string | null {
    return this.country;
  }

  setCountry(country: string | null) {
    this.country = country;
  }

  getTimezone(): string | null {
    return this.timezone;
  }

  setTimezone(timezone: string | null) {
    this.timezone = timezone;
  }

  getAutoDetect(): boolean {
    return this.autoDetect;
  }

  setAutoDetect(value: boolean) {
    this.autoDetect = value;
  }

  loadPreferences(prefs: Partial<UserPreferences> | null) {
    if (!prefs) return;
    if (prefs.preferredLanguage) this.locale = prefs.preferredLanguage;
    if (prefs.preferredCurrency) this.currency = prefs.preferredCurrency;
    if (prefs.preferredCountry !== undefined) this.country = prefs.preferredCountry;
    if (prefs.preferredTimezone !== undefined) this.timezone = prefs.preferredTimezone;
    if (prefs.autoDetectLocale !== undefined) this.autoDetect = prefs.autoDetectLocale;
  }

  toPreferences(): UserPreferences {
    return {
      preferredLanguage: this.locale,
      preferredCurrency: this.currency as SupportedCurrency,
      preferredCountry: this.country,
      preferredTimezone: this.timezone,
      autoDetectLocale: this.autoDetect,
    };
  }

  resolve(resolved: ResolvedLocale) {
    if (resolved.locale) this.locale = resolved.locale;
    if (resolved.currency) this.currency = resolved.currency;
    if (resolved.country) this.country = resolved.country;
    if (resolved.timezone) this.timezone = resolved.timezone;
  }
}

let instance: LocalizationService | null = null;

export function getLocalizationService(): LocalizationService {
  if (!instance) {
    instance = new LocalizationService();
  }
  return instance;
}

export function resetLocalizationService() {
  instance = null;
}
