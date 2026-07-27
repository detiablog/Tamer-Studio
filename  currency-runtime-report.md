# Currency Runtime Report

**Sprint:** CMS-01 B5 — Localization Platform
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Supported Currencies

| Currency | Symbol | Locale | Min Digits | Max Digits |
|----------|--------|--------|------------|------------|
| USD | $ | en-US | 2 | 2 |
| IDR | Rp | id-ID | 0 | 0 |

---

## 2. Detection

Priority:
1. User Preference
2. Country
3. Locale

---

## 3. Implementation

**File:** `src/core/localization/currency-runtime.ts`

```typescript
class DefaultCurrencyRuntime implements CurrencyRuntime {
  getCurrency() — returns current currency
  getSymbol() — returns currency symbol
  getLocale() — returns locale for currency
  format(amount, options?) — formats amount with currency
  setCurrency(currency) — updates currency
}
```

---

## 4. Formatting

Uses `Intl.NumberFormat` for locale-aware currency formatting.

---

## 5. Conclusion

Currency Runtime automatically determines currency from user preference, country, or locale. It supports USD and IDR with proper formatting via `Intl.NumberFormat`.