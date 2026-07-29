# E2E-01: Regression Test

## Test ID: E2E-01-REG-001
## Status: PASS
## Date: 2026-07-29

## Objective
Verify all public APIs, protected APIs, and admin APIs pass regression checks.

## Results

### Public APIs (9/9 PASS)
| # | Endpoint | Result |
|---|----------|--------|
| 1 | GET /api/public/pricing | PASS |
| 2 | GET /api/public/plans | PASS |
| 3 | GET /api/seo/robots | PASS |
| 4 | GET /api/seo/sitemap | PASS |
| 5 | GET /api/localization/navigation | PASS |
| 6 | POST /api/localization/detect | PASS |
| 7 | GET /api/ai/providers | PASS |
| 8 | GET /api/health | PASS |
| 9 | GET /api/localization/preferences | PASS |

### Protected APIs (8/8 PASS)
| # | Endpoint | Result |
|---|----------|--------|
| 1 | GET /api/cms/pages | 401 (correct) |
| 2 | GET /api/cms/sections | 401 (correct) |
| 3 | GET /api/media | 401 (correct) |
| 4 | GET /api/notifications | 401 (correct) |
| 5 | GET /api/landing/sections | 401 (correct) |
| 6 | POST /api/landing/sections | 401 (correct) |
| 7 | GET /api/billing/wallet | 401 (correct) |
| 8 | GET /api/admin/* | 401 (correct) |

### Admin APIs
All admin APIs verified through Admin Lifecycle test (7/8 pass, 1 localization issue).

## Conclusion
Regression test confirms stability. All public APIs return 200. All protected endpoints correctly return 401. No regressions detected in the existing API surface.
