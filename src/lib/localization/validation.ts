import { getAllTranslationKeys } from "./keys";

const KNOWN_NAMESPACES = ["common", "auth", "marketing", "dashboard", "workspace", "settings", "billing", "profile", "admin", "misc", "error", "sectionDrawer", "landing"];

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
  const result: Record<string, unknown> = {};
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(config)) {
    const fullPath = path ? `${path}.${key}` : key;

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
      const nested = sanitizeConfigValues(value as Record<string, unknown>, fullPath);
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
          const nested = sanitizeConfigValues(item as Record<string, unknown>, `${fullPath}[${i}]`);
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

  return { sanitized: result, warnings };
}

export function validateConfigTranslationKeys(
  config: Record<string, unknown>
): { valid: boolean; sanitized: Record<string, unknown>; warnings: string[] } {
  const { sanitized, warnings } = sanitizeConfigValues(config);

  const invalidKeys = warnings.filter((w) => w.includes("unknown namespace"));

  return {
    valid: invalidKeys.length === 0,
    sanitized,
    warnings,
  };
}
