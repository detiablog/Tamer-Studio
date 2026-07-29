# Register Localization Audit

**Date:** 2026-07-29  
**Sprint:** AUTH-01  
**Status:** 2 ISSUES FOUND  

---

## Localization Keys Used

| Element | Key | Expected Path |
|---------|-----|---------------|
| Name label | t('auth.register.name') | ✓ |
| Email label | t('auth.register.email') | ✓ |
| Password label | t('auth.register.password') | ✓ |
| Submit button | t('auth.register.submit') | ✓ |
| Terms text | t('auth.termsOfService') | ⚠ WRONG PATH |
| Privacy text | t('auth.privacyPolicy') | ⚠ WRONG PATH |
| Error: empty name | t('auth.register.errors.nameRequired') | ✓ |
| Error: empty email | t('auth.register.errors.emailRequired') | ✓ |
| Error: empty password | t('auth.register.errors.passwordRequired') | ✓ |

## Issues

### Issue 1: Wrong Key Paths (MEDIUM)

Terms and Privacy links use wrong locale paths:

```typescript
// Current (register-form.tsx)
t('auth.termsOfService')
t('auth.privacyPolicy')

// Should be
t('auth.register.termsOfService')
t('auth.register.privacyPolicy')
```

**Impact:** Terms/Privacy text may fall back to English or show missing key.

### Issue 2: Untranslated Indonesian Strings (LOW)

Indonesian (id) locale has untranslated auth sections — English strings shown.

### Issue 3: Missing Zod Error Messages (INFO)

Zod schema lacks `required_error` messages for localization:

```typescript
// register.schema.ts
z.string().min(3)           // no required_error
z.string().email()          // no required_error
z.string().min(12)          // no required_error
```

## Files Audited

| File | Status |
|------|--------|
| src/features/auth/components/register-form.tsx | reviewed |
| src/features/auth/schemas/register.schema.ts | reviewed |
| src/locales/id.json (auth section) | reviewed |
| src/locales/en.json (auth section) | reviewed |
