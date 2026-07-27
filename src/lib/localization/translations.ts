import enTranslations from "../../../locales/en.json";
import idTranslations from "../../../locales/id.json";

type TranslationDict = Record<string, string>;

const CACHE: Record<string, TranslationDict> = {};

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): TranslationDict {
  const result: TranslationDict = {};
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (typeof value === "string") {
      result[newKey] = value;
    }
  }
  return result;
}

const FLATTENED_EN = flattenObject(enTranslations as Record<string, unknown>);
const FLATTENED_ID = flattenObject(idTranslations as Record<string, unknown>);

CACHE["translations_en"] = FLATTENED_EN;
CACHE["translations_id"] = FLATTENED_ID;

export function getTranslation(
  locale: string,
  key: string,
  fallback?: string
): string {
  const translations = getTranslations(locale);
  const translated = translations[key];
  if (translated) return translated;

  if (locale === "en") {
    if (fallback) return fallback;
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Missing translation key "${key}" for locale "en" and no fallback provided`);
    }
    return fallback ?? "";
  }

  const enTranslation = FLATTENED_EN[key];
  if (enTranslation) return enTranslation;
  if (fallback) return fallback;

  if (process.env.NODE_ENV === "development") {
    console.warn(`[i18n] Missing translation key "${key}" for locale "${locale}" and fallback "en" and no fallback provided`);
  }
  return fallback ?? "";
}

export function getTranslations(locale: string): TranslationDict {
  const cacheKey = `translations_${locale}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  const map: Record<string, TranslationDict> = {
    en: FLATTENED_EN,
    id: FLATTENED_ID,
  };

  CACHE[cacheKey] = map[locale] || FLATTENED_EN;
  return CACHE[cacheKey];
}

export function hasTranslation(locale: string, key: string): boolean {
  const translations = getTranslations(locale);
  return key in translations;
}

export function invalidateCache() {
  for (const key of Object.keys(CACHE)) {
    delete CACHE[key];
  }
}

export { FLATTENED_EN, FLATTENED_ID };