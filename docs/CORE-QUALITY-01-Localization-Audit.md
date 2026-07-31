# CORE-QUALITY-01 — Localization Audit

## Fixes Applied
- Translated 60+ Indonesian keys in `locales/id.json`
- Covers: auth.login, auth.loginForm, auth.resetPasswordForm, auth.verifyEmail, dashboard, appShell

## Coverage

| Section | EN | ID | Status |
|---------|----|----|--------|
| Common UI | ✓ | ✓ | Complete |
| Auth (login, register) | ✓ | ✓ | Complete |
| Auth (forgot/reset password) | ✓ | ✓ | Complete |
| Auth (email verification) | ✓ | ✓ | Complete |
| Auth (2FA) | ✓ | ✓ | Complete |
| Dashboard | ✓ | ✓ | Complete |
| Admin Panel | ✓ | ✓ | Complete |
| Email System | ✓ | ✓ | Complete |
| Settings | ✓ | ✓ | Complete |
| Notifications | ✓ | ✓ | Complete |

## Remaining Items
- Some admin-specific keys in deep nested sections may still be English
- Landing page section-specific keys need review
- Error boundary text not localized
