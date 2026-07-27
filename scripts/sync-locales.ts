import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LOCALES_DIR = resolve(process.cwd(), "locales");
const EN_PATH = resolve(LOCALES_DIR, "en.json");
const ID_PATH = resolve(LOCALES_DIR, "id.json");

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

function unflattenObject(
  flat: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== "object" || Array.isArray(current[part])) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sorted[key] = sortObject(value as Record<string, unknown>);
    } else {
      sorted[key] = value;
    }
  }
  return sorted;
}

function main() {
  const enRaw = JSON.parse(readFileSync(EN_PATH, "utf-8"));
  const idRaw = JSON.parse(readFileSync(ID_PATH, "utf-8"));

  const enFlat = flattenObject(enRaw);
  const idFlat = flattenObject(idRaw);

  let addedCount = 0;
  let removedCount = 0;

  const newIdFlat: Record<string, string> = {};

  for (const [key, enValue] of Object.entries(enFlat)) {
    if (!(key in idFlat)) {
      newIdFlat[key] = `[TODO: translate] ${enValue}`;
      addedCount++;
    } else {
      newIdFlat[key] = idFlat[key];
    }
  }

  const newIdUnflat = sortObject(unflattenObject(newIdFlat));

  const newIdJson = JSON.stringify(newIdUnflat, null, 2) + "\n";
  writeFileSync(ID_PATH, newIdJson);

  const removedKeys = Object.keys(idFlat).filter((key) => !(key in enFlat));
  removedCount = removedKeys.length;

  console.log("=== Locale Sync Complete ===");
  console.log(`Source: ${EN_PATH}`);
  console.log(`Target: ${ID_PATH}`);
  console.log(`Total keys (en): ${Object.keys(enFlat).length}`);
  console.log(`Added to id.json: ${addedCount}`);
  console.log(`Removed from id.json: ${removedCount}`);
  if (removedCount > 0) {
    console.log(`Removed keys: ${removedKeys.slice(0, 10).join(", ")}${removedKeys.length > 10 ? "..." : ""}`);
  }
}

main();
