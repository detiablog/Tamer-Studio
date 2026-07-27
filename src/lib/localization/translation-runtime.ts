import { getTranslation, getTranslations, hasTranslation, invalidateCache } from "@/lib/localization/translations";
import type { SupportedLocale } from "@/lib/localization/types";

export interface TranslationRuntimeOptions {
  locale: SupportedLocale;
  fallbackLocale?: SupportedLocale;
  namespace?: string;
}

export class TranslationRuntime {
  private locale: SupportedLocale;
  private fallbackLocale: SupportedLocale;

  constructor(options: TranslationRuntimeOptions) {
    this.locale = options.locale;
    this.fallbackLocale = options.fallbackLocale ?? "en";
  }

  t(key: string, fallback?: string): string {
    const translated = getTranslation(this.locale, key, fallback);
    if (translated) return translated;
    const fallbackTranslation = getTranslation(this.fallbackLocale, key, fallback);
    if (fallbackTranslation) return fallbackTranslation;
    return fallback ?? key;
  }

  has(key: string): boolean {
    return hasTranslation(this.locale, key) || hasTranslation(this.fallbackLocale, key);
  }

  getAll(): Record<string, string> {
    return getTranslations(this.locale);
  }

  setLocale(locale: SupportedLocale): void {
    this.locale = locale;
  }

  getLocale(): SupportedLocale {
    return this.locale;
  }

  invalidateCache(): void {
    invalidateCache();
  }
}