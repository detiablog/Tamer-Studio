# Translation Sync Report

**Sprint:** CMS-01 B5 — Localization Platform
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Synchronization Tool

**File:** `scripts/sync-translations.ts`

Syncs translation keys across all supported locales (`en`, `id`).

---

## 2. Capabilities

- **Create keys** — adds missing keys to all locales with empty string
- **Rename keys** — preserves translation values when key structure changes
- **Delete keys** — removes orphan keys from all locales
- **Move keys** — preserves identical structure across namespaces
- **Detect missing keys** — lists keys present in `en` but missing in other locales
- **Detect orphan keys** — lists keys present in other locales but missing in `en`
- **Detect duplicate keys** — lists duplicate keys within a locale
- **Fail validation** — stops CI/automation if sync fails

---

## 3. Usage

```bash
npx ts-node scripts/sync-translations.ts
```

---

## 4. Structure Preservation

- Maintains nested JSON structure
- Preserves existing translations when adding new keys
- Does not overwrite existing translations

---

## 5. Validation

- Validates ICU syntax
- Validates placeholders
- Validates namespace consistency
- Fails if any validation error is found

---

## 6. Conclusion

Translation synchronization is implemented as a mandatory tool. It ensures all supported locales maintain identical key structure and validates translations before committing changes.