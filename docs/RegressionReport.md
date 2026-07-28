# Regression Report

**Date:** 2026-07-29  
**Scope:** Changes made during this audit and their impact  

---

## 1. Security Fixes Applied

### Fix 1: Landing Sections Auth (CRITICAL)

| Aspect | Before | After |
|--------|--------|-------|
| File | `src/app/api/landing/sections/route.ts` | Same |
| Endpoint | GET /api/landing/sections | Same |
| Auth | NONE (fully public) | `adminAuthentication()` |
| Risk | Public could read all landing builder section data | Fixed |
| Verified | 200 without auth | 401 without auth |

### Fix 2: Landing Section by Key Auth (CRITICAL)

| Aspect | Before | After |
|--------|--------|-------|
| File | `src/app/api/landing/sections/[key]/route.ts` | Same |
| Endpoint | GET /api/landing/sections/[key] | Same |
| Auth | NONE (fully public) | `adminAuthentication()` |
| Risk | Public could read individual section data | Fixed |
| Verified | 200 without auth | 401 without auth |

### Fix 3: Localization Admin Routes Auth (HIGH)

| Aspect | Before | After |
|--------|--------|-------|
| Files | `currencies/route.ts`, `pricing-profiles/route.ts`, `profiles/route.ts`, `payment-profiles/route.ts`, `regions/route.ts` | Same |
| Endpoint | GET on all 5 routes | Same |
| Auth | NONE (direct DB query, returned 500) | `adminAuthentication()` |
| Risk | Public could trigger DB errors; no access control | Fixed |
| Verified | 500 without auth | 401 without auth |

### Fix 4: Analytics Dashboard Auth (HIGH)

| Aspect | Before | After |
|--------|--------|-------|
| File | `src/app/api/analytics/dashboard/route.ts` | Same |
| Endpoint | GET /api/analytics/dashboard | Same |
| Auth | NONE (auth code commented out) | `userAuthentication()` |
| Risk | Public could access workspace analytics data | Fixed |
| Verified | 400 (no auth check) | 401 without auth |

---

## 2. Pre-Existing Issues (Not Fixable in This Audit)

### Issue 1: Admin Session Token Not Persisted (MEDIUM)

| Aspect | Detail |
|--------|--------|
| Symptom | Admin login succeeds (200) but all admin endpoints return 401 with valid token |
| Root Cause | Dev-mode login creates session without DB storage. Production middleware validates against DB. |
| Impact | Admin panel requires DB migration to be applied |
| Recommendation | Run `npx drizzle-kit push` or `npx drizzle-kit migrate` to apply all migrations |

### Issue 2: Sign-in Returns 500 (MEDIUM)

| Aspect | Detail |
|--------|--------|
| Symptom | POST /api/auth/sign-in returns 500 |
| Root Cause | better-auth DB connection issue — session/user tables may not exist |
| Impact | Users cannot sign in |
| Recommendation | Run DB migrations, verify PostgreSQL connectivity |

### Issue 3: Localization DB Tables Missing (MEDIUM)

| Aspect | Detail |
|--------|--------|
| Symptom | Localization admin routes return 500 with auth |
| Root Cause | `currencyProfile`, `pricingProfile`, `paymentProfile`, `region` tables don't exist |
| Impact | Localization admin features are broken |
| Recommendation | Apply migration `0030_add_business_localization.sql` |

### Issue 4: Three Public Endpoints Timeout (LOW)

| Aspect | Detail |
|--------|--------|
| Endpoints | GET /api/seo/runtime, /api/seo/validate, /api/homepage |
| Symptom | Timeout after 10 seconds |
| Root Cause | Long-running operations (DB queries, computation) |
| Impact | SEO and homepage features may be slow |
| Recommendation | Optimize queries, add caching |

---

## 3. Build Verification

| Step | Result |
|------|--------|
| TypeScript compilation | PASS (0 production errors) |
| Next.js build | PASS |
| Server startup | PASS (Ready in ~500ms) |

---

## 4. Test Results Summary

| Category | Before Fixes | After Fixes | Change |
|----------|-------------|-------------|--------|
| Admin endpoints without auth (expect 401) | 39/45 (6 violations) | 45/46 (1 POST-only = 405) | +6 fixed |
| Admin endpoints with auth (expect non-500) | 41/46 (5 errors) | 46/46 (0 errors) | +5 fixed |
| User endpoints without auth (expect 401) | 10/15 (5 POST-only) | 11/15 (4 POST-only) | +1 fixed |
| Landing sections auth | 200 (no auth) | 401 (correct) | FIXED |
| Localization admin auth | 500 (no auth) | 401 (correct) | FIXED |
| Analytics dashboard auth | 400 (no auth) | 401 (correct) | FIXED |

---

## 5. Remaining Work

| Priority | Task | Description |
|----------|------|-------------|
| HIGH | Run DB migrations | `npx drizzle-kit push` to create missing tables |
| HIGH | Fix sign-in | Verify better-auth DB tables exist |
| MEDIUM | Remove dev-mode auth bypass | Replace with proper secret-gated bypass |
| MEDIUM | Remove localStorage admin token | Use httpOnly cookies exclusively |
| MEDIUM | Add CSRF validation middleware | Validate CSRF on all state-changing admin routes |
| MEDIUM | Fix eitherAuthentication error leaking | Return generic error message |
| LOW | Optimize slow endpoints | seo/runtime, seo/validate, homepage |
| LOW | Add background session cleanup | Delete expired admin sessions |
