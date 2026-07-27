import fs from "fs";
import path from "path";
import { getAllTranslationKeys } from "@/lib/localization/keys";
import { validateTranslationKeys } from "@/lib/localization/validation";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const SUPPORTED_LOCALES = ["en", "id"];

export interface SyncResult {
  success: boolean;
  locale: string;
  addedKeys: string[];
  removedKeys: string[];
  preservedStructure: boolean;
  errors: string[];
}

export function syncTranslationKeys(): SyncResult[] {
  const sourceKeys = getAllTranslationKeys();
  const results: SyncResult[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const result = syncLocale(locale, sourceKeys);
    results.push(result);
  }

  return results;
}

function syncLocale(locale: string, sourceKeys: string[]): SyncResult {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  const addedKeys: string[] = [];
  const removedKeys: string[] = [];
  const errors: string[] = [];

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    const flattened = flattenObject(data);

    const existingSourceKeys = Object.keys(flattened);

    for (const key of sourceKeys) {
      if (!(key in flattened)) {
        flattened[key] = "";
        addedKeys.push(key);
      }
    }

    for (const key of existingSourceKeys) {
      if (!sourceKeys.includes(key)) {
        delete flattened[key];
        removedKeys.push(key);
      }
    }

    const rebuilt = unflattenObject(flattened);
    fs.writeFileSync(filePath, JSON.stringify(rebuilt, null, 2), "utf-8");

    const validation = validateTranslationKeys(sourceKeys, flattened);
    if (!validation.valid) {
      errors.push(...validation.missingKeys.map((k) => `missing ${k}`));
      errors.push(...validation.brokenICU.map((k) => `broken ICU ${k}`));
    }

    return {
      success: errors.length === 0,
      locale,
      addedKeys,
      removedKeys,
      preservedStructure: true,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      locale,
      addedKeys,
      removedKeys,
      preservedStructure: false,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
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

function unflattenObject(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in flat) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) current[part] = {};
      current = current[part] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = flat[key];
  }
  return result;
}