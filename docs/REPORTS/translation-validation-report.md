# Translation Validation Report

**Sprint:** CMS-01 B5 — Localization Platform
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Validation Rules

| Rule | Status | Implementation |
|------|--------|----------------|
| Missing keys | Implemented | Compares source keys against each locale |
| Duplicate keys | Implemented | Detects duplicate keys within a locale |
| Unused keys | Implemented | Detects keys in locale not in source |
| Broken ICU syntax | Implemented | Regex validation for plural/select |
| Invalid placeholders | Implemented | Validates `{{placeholder}}` format |
| Namespace consistency | Implemented | Validates against known namespaces |

---

## 2. Implementation

**File:** `src/lib/localization/validation.ts`

```typescript
validateTranslationKeys(sourceKeys, targetTranslations): ValidationResult
validateConfigTranslationKeys(config): { valid, sanitized, warnings }
isValidTranslationKey(key): boolean
sanitizeConfigValues(config): { sanitized, warnings }
```

---

## 3. Validation Flow

```
Sync tool runs
  ↓
Load en.json (source of truth)
  ↓
Load id.json (target)
  ↓
Validate target against source
  ↓
Generate ValidationResult
  ↓
Fail if any critical errors
```

---

## 4. Known Namespaces

`common`, `auth`, `marketing`, `dashboard`, `workspace`, `settings`, `billing`, `profile`, `admin`, `misc`, `error`, `sectionDrawer`, `landing`

---

## 5. Conclusion

Translation validation is comprehensive and automatic. It validates missing keys, duplicate keys, unused keys, broken ICU syntax, invalid placeholders, and namespace consistency. Validation fails if any critical errors are found.