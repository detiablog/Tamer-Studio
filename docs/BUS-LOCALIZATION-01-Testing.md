# BUS-LOCALIZATION-01 — Testing Checklist

**Sprint:** BUS-LOCALIZATION-01
**Date:** 2026-07-31

## Locale Switching
- [ ] Switch to English — all UI text renders correctly
- [ ] Switch to Indonesian — all UI text renders correctly
- [ ] Refresh page — locale preference persists

## Error Pages
- [ ] Navigate to a non-existent route — "Page not found" message displays in current locale
- [ ] Trigger a server error — error message displays in current locale
- [ ] Trigger rate limiting — rate limit message displays in current locale

## Dashboard
- [ ] Dashboard loads with localized labels (projects, media, production, etc.)
- [ ] Quick actions section displays localized button labels
- [ ] Stats cards display localized text

## Navigation & Common UI
- [ ] Sidebar labels render in current locale
- [ ] Topbar search placeholder renders in current locale
- [ ] "Go Home" button renders correctly on error pages
- [ ] Desktop/Tablet/Mobile responsive labels render correctly
- [ ] Global search placeholder renders in current locale

## Auth / Login / Register
- [ ] Login form labels and buttons display in current locale
- [ ] Register form labels and buttons display in current locale
- [ ] Forgot password form displays in current locale
- [ ] Password validation messages display in current locale (min chars, uppercase, lowercase, number, special)
- [ ] Password mismatch message displays in current locale
- [ ] Invalid email message displays in current locale
- [ ] Terms required message displays in current locale
- [ ] Sign out success message displays in current locale
- [ ] Sign out failure message displays in current locale

## Notifications
- [ ] Notifications page title displays in current locale
- [ ] "Unread" filter label displays in current locale
- [ ] "Mark all as read" button aria-label displays in current locale
- [ ] Empty notifications state displays in current locale

## Production
- [ ] Production page loads with localized labels
- [ ] "Failed to retry" message displays in current locale
- [ ] Job status labels display in current locale

## Email Settings (Admin)
- [ ] Email provider list displays in current locale
- [ ] "HTML Preview" and "Text Preview" labels display in current locale
- [ ] Email template editor loads with localized labels
- [ ] SMTP settings page displays in current locale

## Billing
- [ ] Billing page loads with localized labels
- [ ] Plan names and prices display correctly
- [ ] Invoice list displays in current locale

## Formatting (useLocaleFormatting hook)
- [ ] Currency formatting renders correctly for en (USD) and id (IDR)
- [ ] Number formatting renders correctly (decimal separators)
- [ ] Percent formatting renders correctly
- [ ] Date formatting renders correctly for both locales
- [ ] Time formatting renders correctly for both locales
- [ ] DateTime formatting renders correctly for both locales

## Admin Panel
- [ ] Admin login form displays in current locale
- [ ] Admin dashboard labels display in current locale
- [ ] Admin sidebar labels display in current locale
- [ ] User management table headers display in current locale
- [ ] Audit logs page displays in current locale

## Cross-cutting
- [ ] No console errors related to missing translation keys
- [ ] No hardcoded English strings visible when locale is set to Indonesian
- [ ] RTL/LTR layout renders correctly (not applicable for en/id, but verify no layout breaks)
