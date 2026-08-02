# UI-01 Localization

## Overview

This document details the localization system in Tamer Studio, covering the translation key system, English and Bahasa Indonesia coverage, date/time/number formatting, and missing translations audit.

---

## 1. Translation Key System

### Architecture

**Files:**
- `src/lib/localization/keys.ts` - Type-safe translation keys
- `src/lib/localization/translations.ts` - Translation definitions
- `src/lib/localization/runtime.ts` - Runtime translation engine
- `src/lib/localization/types.ts` - Type definitions
- `src/lib/localization/constants.ts` - Locale constants
- `src/lib/localization/detection.ts` - Browser locale detection
- `src/lib/localization/validation.ts` - Translation validation

### Key Structure

Translation keys follow a dot-notation namespace pattern:

```
namespace.section.key

Examples:
common.save
auth.signInTitle
dashboard.title
marketing.heroTitle
admin.users
```

### Namespaces

| Namespace | Purpose | Key Count |
|-----------|---------|-----------|
| `common` | Shared UI labels | 100+ |
| `auth` | Authentication | 30+ |
| `marketing` | Landing page | 200+ |
| `dashboard` | Dashboard | 20+ |
| `workspace` | Workspace management | 10+ |
| `settings` | Settings page | 25+ |
| `billing` | Billing section | 15+ |
| `profile` | User profile | 20+ |
| `admin` | Admin panel | 300+ |
| `error` | Error messages | 10+ |
| `misc` | Miscellaneous | 10+ |

### Type Safety

```typescript
export type TranslationKey =
  | "common.save"
  | "common.cancel"
  | "auth.signInTitle"
  // ... 800+ keys
  | "error.network"
  | "error.server";

export function getAllTranslationKeys(): string[] {
  return Object.keys(FLATTENED_EN);
}
```

---

## 2. Supported Locales

### Locale Configuration

**File:** `src/lib/localization/types.ts`

```typescript
export type SupportedLocale = "en" | "id";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "id"];
```

### Language Switcher

**File:** `src/components/ui/LanguageSwitcher.tsx`

| Code | Label | Flag |
|------|-------|------|
| `en` | English | US flag |
| `id` | Bahasa Indonesia | ID flag |

### Default Locale

- Primary: `en` (English)
- Fallback: `en` (English)
- Detection: Browser Accept-Language header

---

## 3. English Coverage

### Complete Key Categories

**Common (100+ keys):**
- Actions: save, cancel, delete, edit, create, update, close
- Navigation: back, next, previous, submit, reset
- States: loading, error, success, empty, noData
- Auth: signIn, signUp, signOut, forgotPassword
- Content: name, email, password, description, date

**Auth (30+ keys):**
- Pages: signInTitle, signUpTitle, forgotPasswordTitle
- Labels: emailLabel, passwordLabel, nameLabel
- Messages: invalidCredentials, emailAlreadyInUse
- Actions: signInButton, signUpButton, resetPasswordButton

**Dashboard (20+ keys):**
- Sections: title, description, workspace, projects
- Actions: createWorkspace, uploadMedia, newJob
- States: loading, failedToLoad

**Admin (300+ keys):**
- Navigation: dashboard, users, organizations, billing
- CRUD: create, update, delete, search, filter
- Status: active, inactive, pending, completed, failed
- Messages: success, error, warning, info

---

## 4. Bahasa Indonesia Coverage

### Translation Completeness

| Namespace | EN Keys | ID Keys | Coverage |
|-----------|---------|---------|----------|
| common | 100+ | 100+ | 100% |
| auth | 30+ | 30+ | 100% |
| marketing | 200+ | 200+ | 100% |
| dashboard | 20+ | 20+ | 100% |
| workspace | 10+ | 10+ | 100% |
| settings | 25+ | 25+ | 100% |
| billing | 15+ | 15+ | 100% |
| profile | 20+ | 20+ | 100% |
| admin | 300+ | 300+ | 100% |
| error | 10+ | 10+ | 100% |
| misc | 10+ | 10+ | 100% |

### Sample Translations

| Key | English | Bahasa Indonesia |
|-----|---------|------------------|
| common.save | Save | Simpan |
| common.cancel | Cancel | Batal |
| common.delete | Delete | Hapus |
| auth.signInTitle | Sign In | Masuk |
| dashboard.title | Dashboard | Dasbor |
| settings.title | Settings | Pengaturan |
| error.notFound | Not Found | Tidak Ditemukan |

---

## 5. Date/Time Formatting

### Hooks

**File:** `src/hooks/useLocaleFormatting.ts`

```typescript
// Date formatting
function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// Time formatting
function formatTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Relative time
function formatRelativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  return rtf.format(days, "day");
}
```

### Locale-Specific Formats

| Format | English (en) | Bahasa Indonesia (id) |
|--------|-------------|----------------------|
| Date | January 1, 2024 | 1 Januari 2024 |
| Time | 2:30 PM | 14.30 |
| Relative | 2 days ago | 2 hari yang lalu |
| Number | 1,234.56 | 1.234,56 |
| Currency | $1,234.56 | Rp 1.234.56 |

---

## 6. Number Formatting

### Number Formatting

```typescript
function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}
```

### Currency Formatting

```typescript
function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
```

### Locale-Specific Number Formats

| Number | English (en) | Bahasa Indonesia (id) |
|--------|-------------|----------------------|
| 1234567.89 | 1,234,567.89 | 1.234.567,89 |
| 0.5 | 0.5 | 0,5 |
| 100% | 100% | 100% |

---

## 7. Translation Runtime

### Context Provider

**File:** `src/providers/localization.tsx`

```typescript
function useLocalizationContext() {
  return {
    locale: SupportedLocale,
    setLocale: (locale: SupportedLocale) => void,
    t: (key: string, fallback?: string) => string,
  };
}
```

### Usage Pattern

```tsx
const { t, locale, setLocale } = useLocalizationContext();

// Basic translation
<h1>{t("dashboard.title")}</h1>

// With fallback
<p>{t("notFound.description", "Page not found")}</p>

// Dynamic key
<span>{t(`sidebar.${group}`)}</span>

// Change locale
<Button onClick={() => setLocale("id")}>Bahasa Indonesia</Button>
```

### Fallback Strategy

1. Check current locale translation
2. Fall back to English translation
3. Return key if no translation found

---

## 8. Missing Translations Audit

### New Component Keys (UI Polish Sprint)

| Key | EN | ID | Status |
|-----|----|----|--------|
| commandPalette.placeholder | Search commands... | Cari perintah... | Added |
| commandPalette.noResults | No results found | Tidak ada hasil | Added |
| commandPalette.navigate | Navigate | Navigasi | Added |
| commandPalette.select | Select | Pilih | Added |
| commandPalette.close | Close | Tutup | Added |
| commandPalette.ariaLabel | Command palette | Palet perintah | Added |
| topbar.openMenu | Open menu | Buka menu | Added |
| topbar.searchPlaceholder | Search... | Cari... | Added |
| topbar.notifications | Notifications | Notifikasi | Added |
| topbar.toggleTheme | Toggle theme | Ganti tema | Added |
| notFound.title | Page not found | Halaman tidak ditemukan | Added |
| notFound.description | Page not found description | Deskripsi tidak ditemukan | Added |
| notFound.goHome | Go home | Ke beranda | Added |
| sidebar.expand | Expand sidebar | Perluas sidebar | Added |
| sidebar.collapse | Collapse sidebar | Ciutkan sidebar | Added |

### Audit Results

| Category | Total Keys | Translated | Coverage |
|----------|-----------|------------|----------|
| Common | 100+ | 100+ | 100% |
| Auth | 30+ | 30+ | 100% |
| Marketing | 200+ | 200+ | 100% |
| Dashboard | 20+ | 20+ | 100% |
| Admin | 300+ | 300+ | 100% |
| UI-01 New | 15 | 15 | 100% |

---

## 9. Localization Tools

### Sync Script

```bash
pnpm sync:locales
```

Validates all translation keys are present in both locales.

### Validation

**File:** `src/lib/localization/validation.ts`

- Checks for missing keys
- Detects unused keys
- Validates key format
- Reports translation coverage

---

## 10. Future Improvements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| RTL support | Medium | Arabic, Hebrew layout |
| Pluralization | Medium | ICU message format |
| Interpolation | Medium | Variable substitution |
| Namespace splitting | Low | Lazy load translations |
| Translation memory | Low | Shared translations |
| Context-aware | Low | Different translations per context |
