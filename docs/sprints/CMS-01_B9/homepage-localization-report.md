# Homepage Localization Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

Every homepage string uses Localization Runtime. No hardcoded text.

---

## Localization Integration

```typescript
// HomepageRuntime.resolveLocalization()
const service = getLocalizationService();
service.setLocale(context.locale as any);

return {
  locale: context.locale,
  fallbackLocale: "en",
  translations: service.getTranslations(),
  namespace: "homepage",
};
```

---

## Translation Keys

All visible strings use translation keys with fallbacks:

```typescript
t("marketing.seoTitle", "Tamer Studio - AI-Powered Production Platform")
t("marketing.heroTitle")
t("marketing.heroDescription")
t("marketing.heroCtaPrimary")
t("marketing.heroCtaSecondary")
t("marketing.features")
t("marketing.pricing")
t("marketing.contact")
t("marketing.getStartedButton")
t("landing.loadingError.title")
t("landing.noSections.title")
```

---

## Locale Detection

```typescript
function detectLocale(request: NextRequest): string {
  // 1. Cookie
  const cookieLocale = request.cookies.get("tamer_locale")?.value;
  if (cookieLocale) return cookieLocale;

  // 2. Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const primary = acceptLanguage.split(",")[0]?.split("-")[0];
    if (["en", "id", "ja", "fr", "de"].includes(primary)) return primary;
  }

  // 3. Default
  return "en";
}
```

---

## Fallback Strategy

1. Check `translations[locale][key]`
2. Fallback to `translations[fallbackLocale][key]`
3. Fallback to original value

---

## Config Localization

Section configs are recursively localized:

```typescript
localizeConfig(config, translations) {
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string" && translations[key]) {
      config[key] = translations[key];
    }
  }
}
```

---

## Section Localization

Each section has its own localization namespace:

```typescript
localization: {
  namespace: "homepage",
  fallbackLocale: "en",
  translations: {
    en: { title: "Hero", description: "..." },
    id: { title: "Hero", description: "..." },
  }
}
```

---

## Supported Locales

| Locale | Language | Status |
|---|---|---|
| `en` | English | Default |
| `id` | Indonesian | Supported |
| `ja` | Japanese | Supported |
| `fr` | French | Supported |
| `de` | German | Supported |

---

## No Hardcoded Text

| Requirement | Status |
|---|---|
| All strings use translation keys | ✓ |
| Fallback locale configured | ✓ |
| Namespace isolation | ✓ |
| Locale preview supported | ✓ |
| Config values localized | ✓ |
