# Localization Runtime Report

**Sprint:** CMS-01 B5 — Localization Platform
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Runtime Components

| Component | File | Responsibility |
|-----------|------|----------------|
| LocalizationRuntime | `src/core/localization/localization-runtime.ts` | Resolves language, locale, currency, timezone |
| TranslationRuntime | `src/lib/localization/translation-runtime.ts` | Resolves translations with fallback |
| FormattingRuntime | `src/core/localization/formatting-runtime.ts` | Date, time, number, currency, relative time |
| CurrencyRuntime | `src/core/localization/currency-runtime.ts` | Currency symbol, locale, formatting |
| TranslationCache | `src/core/localization/translation-cache.ts` | Dictionary + namespace cache |

---

## 2. Resolution Chain

```
Browser
  ↓
Locale Detection
  ↓
Localization Runtime
  ↓
Translation Service
  ↓
CMS
  ↓
Application
  ↓
UI
```

---

## 3. Runtime Responsibilities

- Resolve language
- Resolve locale
- Resolve currency
- Resolve timezone
- Formatting (date, time, number, currency, relative time)
- Plural rules (via existing translation runtime)

---

## 4. Integration Points

- API routes consume via `RequestContext`
- UI components consume via `TranslationRuntime`
- Admin panel consumes via admin API

---

## 5. Conclusion

Localization Runtime provides centralized resolution of language, locale, currency, timezone, and formatting. No module implements its own localization system.