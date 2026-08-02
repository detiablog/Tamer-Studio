# Locale Detection Report

**Sprint:** CMS-01 B5 — Localization Platform
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Detection Priority

1. User Preference (cookie `tamer_locale`)
2. Cookie
3. Accept-Language header
4. Default Locale (`en`)

---

## 2. Implementation

**File:** `src/core/localization/locale-detection.ts`

- `detectLocale(request)` — detects locale from request headers/cookies
- `persistLocale(locale)` — persists selected language in cookie
- `getPreferredLocaleFromHeader(header)` — parses Accept-Language

---

## 3. Cookie Strategy

- Cookie name: `tamer_locale`
- Max age: 1 year
- HttpOnly: true
- SameSite: lax
- Path: /

---

## 4. Browser Language Support

- Parses `Accept-Language` header
- Supports 2-letter and full locale codes
- Falls back to `en` if no match

---

## 5. Persistence

- Selected locale persisted in cookie
- Sticky across sessions
- Can be overridden by user preference

---

## 6. Conclusion

Locale detection is centralized and follows the priority chain: User Preference → Cookie → Accept-Language → Default Locale. No duplicated detection logic exists.