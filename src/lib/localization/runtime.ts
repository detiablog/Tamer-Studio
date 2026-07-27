import type { SupportedLocale, SupportedCurrency, TimezoneCode, ResolvedLocale, UserPreferences } from "./types";
import { DEFAULT_LOCALE, DEFAULT_CURRENCY, DEFAULT_COUNTRY, DEFAULT_TIMEZONE } from "./types";
import { getTranslation, getTranslations, hasTranslation, invalidateCache } from "./translations";
import type { TranslationKey } from "./keys";
import { getLocalizationService } from "./index";
import { resolveLocale, detectFromAcceptLanguage, detectFromCountry, detectFallback } from "./detection";
import { getCountryInfo } from "./constants";

export interface RuntimeOptions {
  locale?: SupportedLocale;
  currency?: SupportedCurrency;
  country?: string | null;
  timezone?: TimezoneCode | null;
  autoDetect?: boolean;
  acceptLanguage?: string | null;
  countryCode?: string | null;
}

export class LocalizationRuntime {
  private locale: SupportedLocale;
  private currency: SupportedCurrency;
  private country: string | null;
  private timezone: TimezoneCode | null;
  private autoDetect: boolean;
  private acceptLanguage: string | null;
  private countryCode: string | null;
  private initialized: boolean = false;

  constructor(options: RuntimeOptions = {}) {
    this.locale = options.locale ?? DEFAULT_LOCALE;
    this.currency = options.currency ?? DEFAULT_CURRENCY;
    this.country = options.country ?? DEFAULT_COUNTRY;
    this.timezone = options.timezone ?? DEFAULT_TIMEZONE;
    this.autoDetect = options.autoDetect ?? true;
    this.acceptLanguage = options.acceptLanguage ?? null;
    this.countryCode = options.countryCode ?? null;
  }

  initialize(options: RuntimeOptions = {}): ResolvedLocale {
    if (options.acceptLanguage !== undefined) this.acceptLanguage = options.acceptLanguage;
    if (options.countryCode !== undefined) this.countryCode = options.countryCode;
    if (options.autoDetect !== undefined) this.autoDetect = options.autoDetect;

    let resolved: ResolvedLocale;

    if (this.autoDetect) {
      resolved = resolveLocale({
        userLocale: options.locale,
        cookieLocale: this.locale !== DEFAULT_LOCALE ? this.locale : undefined,
        acceptLanguage: this.acceptLanguage,
        countryCode: this.countryCode,
      });
    } else {
      const info = this.country ? getCountryInfo(this.country) : getCountryInfo(DEFAULT_COUNTRY);
      resolved = {
        locale: this.locale,
        currency: this.currency,
        country: this.country,
        timezone: this.timezone,
        source: "user",
      };
      if (!resolved.currency && info.currency) resolved.currency = info.currency as SupportedCurrency;
      if (!resolved.country && info.code) resolved.country = info.code;
      if (!resolved.timezone && info.timezone) resolved.timezone = info.timezone as TimezoneCode;
    }

    this.locale = resolved.locale;
    this.currency = resolved.currency;
    this.country = resolved.country;
    this.timezone = resolved.timezone;
    this.initialized = true;

    return resolved;
  }

  getLocale(): SupportedLocale {
    return this.locale;
  }

  getCurrency(): SupportedCurrency {
    return this.currency;
  }

  getCountry(): string | null {
    return this.country;
  }

  getTimezone(): TimezoneCode | null {
    return this.timezone;
  }

  getAutoDetect(): boolean {
    return this.autoDetect;
  }

  setAutoDetect(value: boolean) {
    this.autoDetect = value;
  }

  setAcceptLanguage(header: string | null) {
    this.acceptLanguage = header;
  }

  setCountryCode(code: string | null) {
    this.countryCode = code;
  }

  t(key: string, fallback?: string): string {
    return getTranslation(this.locale, key as TranslationKey, fallback);
  }

  has(key: string): boolean {
    return hasTranslation(this.locale, key);
  }

  getAllTranslations(): Record<string, string> {
    return getTranslations(this.locale);
  }

  invalidateCache(): void {
    invalidateCache();
  }

  toPreferences(): UserPreferences {
    return {
      preferredLanguage: this.locale,
      preferredCurrency: this.currency,
      preferredCountry: this.country,
      preferredTimezone: this.timezone,
      autoDetectLocale: this.autoDetect,
    };
  }

  loadPreferences(prefs: Partial<UserPreferences> | null): void {
    if (!prefs) return;
    if (prefs.preferredLanguage) this.locale = prefs.preferredLanguage;
    if (prefs.preferredCurrency) this.currency = prefs.preferredCurrency;
    if (prefs.preferredCountry !== undefined) this.country = prefs.preferredCountry;
    if (prefs.preferredTimezone !== undefined) this.timezone = prefs.preferredTimezone;
    if (prefs.autoDetectLocale !== undefined) this.autoDetect = prefs.autoDetectLocale;
  }

  getPluralRules(): Intl.PluralRules {
    return new Intl.PluralRules(this.locale);
  }

  getLocaleCode(): string {
    return this.locale === "id" ? "id-ID" : "en-US";
  }
}

let runtimeInstance: LocalizationRuntime | null = null;

export function getLocalizationRuntime(options?: RuntimeOptions): LocalizationRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new LocalizationRuntime(options);
    runtimeInstance.initialize(options);
  }
  return runtimeInstance;
}

export function resetLocalizationRuntime() {
  runtimeInstance = null;
}
