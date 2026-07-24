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
  return translations[key] ?? fallback ?? key;
}

export function getTranslations(locale: string): TranslationDict {
  const cacheKey = `translations_${locale}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  if (locale === "id") {
    CACHE[cacheKey] = FLATTENED_ID;
    return FLATTENED_ID;
  }

  CACHE[cacheKey] = FLATTENED_EN;
  return FLATTENED_EN;
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
