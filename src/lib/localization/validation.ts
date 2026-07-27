import { getAllTranslationKeys } from "./keys";

export interface ValidationResult {
  valid: boolean;
  missingKeys: string[];
  duplicateKeys: string[];
  unusedKeys: string[];
  brokenICU: string[];
  invalidPlaceholders: string[];
  namespaceIssues: string[];
}

const KNOWN_NAMESPACES = ["common", "auth", "marketing", "dashboard", "workspace", "settings", "billing", "profile", "admin", "misc", "error", "sectionDrawer", "landing"];

const ICU_PLURAL_REGEX = /\{\s*\w+,\s*plural,\s*[^}]+\}/;
const ICU_SELECT_REGEX = /\{\s*\w+,\s*select,\s*[^}]+\}/;

function extractNamespaces(keys: string[]): Set<string> {
  const namespaces = new Set<string>();
  for (const key of keys) {
    const parts = key.split(".");
    if (parts.length >= 2) namespaces.add(parts[0]);
  }
  return namespaces;
}

export function validateTranslationKeys(
  sourceKeys: string[],
  targetTranslations: Record<string, string>
): ValidationResult {
  const missingKeys: string[] = [];
  const duplicateKeys: string[] = [];
  const unusedKeys: string[] = [];
  const brokenICU: string[] = [];
  const invalidPlaceholders: string[] = [];
  const namespaceIssues: string[] = [];

  const seenKeys = new Set<string>();
  const targetKeys = Object.keys(targetTranslations);

  for (const key of targetKeys) {
    if (seenKeys.has(key)) {
      duplicateKeys.push(key);
    }
    seenKeys.add(key);
  }

  for (const key of sourceKeys) {
    if (!targetTranslations[key]) {
      missingKeys.push(key);
    }
  }

  for (const key of targetKeys) {
    if (!sourceKeys.includes(key)) {
      unusedKeys.push(key);
    }
  }

  for (const [key, value] of Object.entries(targetTranslations)) {
    if (typeof value !== "string") continue;

    const icuMatches = value.match(/\{([^}]+)\}/g) ?? [];
    for (const match of icuMatches) {
      const inner = match.slice(1, -1);
      if (!ICU_PLURAL_REGEX.test(`{${inner}}`) && !ICU_SELECT_REGEX.test(`{${inner}}`)) {
        brokenICU.push(key);
        break;
      }
    }

    const placeholderMatches = value.match(/\{\{\s*(\w+)\s*\}\}/g) ?? [];
    for (const match of placeholderMatches) {
      const placeholderName = match.slice(2, -2).trim();
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(placeholderName)) {
        invalidPlaceholders.push(key);
        break;
      }
    }
  }

  const sourceNamespaces = extractNamespaces(sourceKeys);
  const targetNamespaces = extractNamespaces(targetKeys);

  for (const ns of targetNamespaces) {
    if (!KNOWN_NAMESPACES.includes(ns)) {
      namespaceIssues.push(`Unknown namespace "${ns}"`);
    }
  }

  return {
    valid: missingKeys.length === 0 && duplicateKeys.length === 0 && brokenICU.length === 0 && invalidPlaceholders.length === 0 && namespaceIssues.length === 0,
    missingKeys,
    duplicateKeys,
    unusedKeys,
    brokenICU,
    invalidPlaceholders,
    namespaceIssues,
  };
}

export function validateConfigTranslationKeys(
  config: Record<string, unknown>
): { valid: boolean; sanitized: Record<string, unknown>; warnings: string[] } {
  const result: Record<string, unknown> = {};
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(config)) {
    const fullPath = key;

    if (typeof value === "string") {
      if (isValidTranslationKey(value)) {
        result[key] = value;
      } else if (value.includes(".") && !value.startsWith("http") && !value.startsWith("#") && !value.startsWith("/") && !value.startsWith("www.")) {
        warnings.push(`Config value "${fullPath}" looks like a translation key but uses unknown namespace: "${value}"`);
        result[key] = value;
      } else {
        result[key] = value;
      }
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nested = validateConfigTranslationKeys(value as Record<string, unknown>);
      result[key] = nested.sanitized;
      warnings.push(...nested.warnings);
    } else if (Array.isArray(value)) {
      const sanitizedArray: unknown[] = [];
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === "string") {
          if (isValidTranslationKey(item)) {
            sanitizedArray.push(item);
          } else {
            sanitizedArray.push(item);
          }
        } else if (typeof item === "object" && item !== null) {
          const nested = validateConfigTranslationKeys(item as Record<string, unknown>);
          sanitizedArray.push(nested.sanitized);
          warnings.push(...nested.warnings);
        } else {
          sanitizedArray.push(item);
        }
      }
      result[key] = sanitizedArray;
    } else {
      result[key] = value;
    }
  }

  const invalidKeys = warnings.filter((w) => w.includes("unknown namespace"));

  return {
    valid: invalidKeys.length === 0,
    sanitized: result,
    warnings,
  };
}

export function isValidTranslationKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  const parts = key.split(".");
  if (parts.length < 2) return false;
  if (!KNOWN_NAMESPACES.includes(parts[0])) return false;
  return true;
}

export function sanitizeConfigValues(
  config: Record<string, unknown>,
  path = ""
): { sanitized: Record<string, unknown>; warnings: string[] } {
  return validateConfigTranslationKeys(config);
}
