import type { SupportedLocale, SupportedCurrency, SupportedTimezone } from "@/lib/localization/types";

export interface LocalizationRuntimeConfig {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  timezone: SupportedTimezone;
  country: string | null;
  autoDetect: boolean;
}

export interface FormattedValue {
  value: string;
  locale: SupportedLocale;
  currency?: SupportedCurrency;
  timezone?: SupportedTimezone;
}

export class LocalizationRuntime {
  private config: LocalizationRuntimeConfig;

  constructor(config: LocalizationRuntimeConfig) {
    this.config = config;
  }

  getLocale(): SupportedLocale {
    return this.config.locale;
  }

  getCurrency(): SupportedCurrency {
    return this.config.currency;
  }

  getTimezone(): SupportedTimezone {
    return this.config.timezone;
  }

  getCountry(): string | null {
    return this.config.country;
  }

  updateLocale(locale: SupportedLocale): void {
    this.config.locale = locale;
  }

  updateCurrency(currency: SupportedCurrency): void {
    this.config.currency = currency;
  }

  updateTimezone(timezone: SupportedTimezone): void {
    this.config.timezone = timezone;
  }

  updateCountry(country: string | null): void {
    this.config.country = country;
  }

  getConfig(): LocalizationRuntimeConfig {
    return { ...this.config };
  }
}