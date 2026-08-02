# Hardcoded Value Audit — Tamer Studio

> Generated: 2026-08-02 | Scope: Full codebase scan

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| **Critical** | 24 | Immediate fix — security risk or production failure |
| **Warning** | 80+ | Should be configurable before production deployment |
| **Acceptable** | 70+ | No action needed (templates, test fixtures, public APIs) |

---

## CRITICAL — Immediate Fix Required

### 1. Hardcoded Credentials in .env (Committed to Disk)

The `.env` file contains real credentials on the developer's machine:

| File | Line | Variable | Risk |
|------|------|----------|------|
| `.env` | 1 | `DATABASE_URL=postgres://postgres:1234@localhost:5432/tamer_studio` | DB password `1234` exposed |
| `.env` | 4 | `AUTH_SECRET=326097fa87b8b74c4042e2f585abfee1...` | Auth secret exposed |
| `.env` | 6 | `BETTER_AUTH_SECRET=326097fa87b8b74c4042e2f585abfee1...` | Auth secret exposed |
| `.env` | 9 | `ADMIN_EMAIL=aoneshoper@gmail.com` | Personal email exposed |
| `.env` | 10 | `ADMIN_PASSWORD=Aoneshoper@2026Admin` | Admin password exposed |
| `.env` | 12 | `ADMIN_MASTER_KEY="admin-master-key"` | Admin key exposed |
| `.env` | 15 | `ADMIN_MASTER_KEY_HASH=1ee9eab425b821e28b6171bbda2bfdcfd...` | Key hash exposed |

**Fix:** Rotate all secrets immediately. Ensure `.env` is in `.gitignore` and never committed. Use `.env.example` as the template only.

### 2. Hardcoded Credentials in .env.local

| File | Line | Variable | Risk |
|------|------|----------|------|
| `.env.local` | 14 | `DATABASE_URL="postgresql://postgres:1234@localhost:5432/tamer_studio"` | DB password exposed |
| `.env.local` | 26 | `ADMIN_EMAIL="aoneshoper@gmail.com"` | Personal email exposed |
| `.env.local` | 27 | `ADMIN_PASSWORD="Aoneshoper@2026Admin"` | Admin password exposed |
| `.env.local` | 30 | `ADMIN_MASTER_KEY="admin-master-key"` | Admin key exposed |

**Fix:** Same as above. `.env.local` should not contain real credentials in any version.

### 3. Hardcoded Passwords in Source Code (scripts/create-admin.ts)

| File | Line | Content |
|------|------|---------|
| `scripts/create-admin.ts` | 9 | `await hashPassword("SecureAdminPassword123!")` |
| `scripts/create-admin.ts` | 12 | `console.log("Email: admin@tamer.studio")` |
| `scripts/create-admin.ts` | 13 | `console.log("Password: SecureAdminPassword123!")` |
| `scripts/create-admin.ts` | 14 | `console.log("Master Key: admin-master-key-development")` |

**Fix:** Read credentials from environment variables, not hardcoded strings.

### 4. Hardcoded DB Password in Docker Compose

| File | Line | Content |
|------|------|---------|
| `docker-compose.local.yml` | 10 | `POSTGRES_PASSWORD: tamer_password` |

**Fix:** Use `${POSTGRES_PASSWORD}` env var with a `.env` file for local dev.

### 5. Hardcoded localhost in Auth Request Construction (user.repository.ts)

| File | Line | Content |
|------|------|---------|
| `src/core/users/user.repository.ts` | 25 | `const url = new URL("/api/auth/sign-up/email", "http://localhost:3000")` |
| `src/core/users/user.repository.ts` | 211 | `const url = new URL("/api/auth/sign-up/email", "http://localhost:3000")` |

**Why critical:** These construct auth request URLs with a hardcoded `http://localhost:3000` base. In production, user creation will fail because the URL points to localhost instead of the actual server. This does NOT use `process.env` at all.

**Fix:** Use `config.app.url` or `process.env.NEXT_PUBLIC_APP_URL`.

---

## WARNING — Should Be Configurable

### 6. http://localhost:3000 Fallbacks in Runtime Code

All of these use `process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"` — they work if the env var is set, but the fallback is dangerous in production:

| File | Line | Usage |
|------|------|-------|
| `src/core/config/config.ts` | 37 | App URL config default |
| `src/core/auth/client.ts` | 4 | Auth base URL |
| `src/core/websocket/server.ts` | 23 | Socket.IO CORS origin |
| `src/core/websocket/server.ts` | 13 | Redis URL fallback |
| `src/core/middleware/origin.middleware.ts` | 9 | CORS allowed origin |
| `src/core/commerce/payment/payment.service.ts` | 124 | Payment email links |
| `src/core/commerce/commerce-runtime.ts` | 175 | Stripe checkout URLs |
| `src/core/payment/payment.service.ts` | 47 | Stripe success/cancel URLs |
| `src/lib/email/templates.ts` | 28 | Email template SITE_URL |
| `src/hooks/useWebSocket.ts` | 18 | Client-side Socket.IO |
| `src/modules/email/email.service.ts` | 18, 37 | Verification/reset URLs |
| `src/app/api/billing/route.ts` | 169-170 | Invoice/dashboard URLs |
| `src/app/api/auth/register/route.ts` | 115 | Email verification URL |

**Fix:** Make `NEXT_PUBLIC_APP_URL` a required variable or use `config.app.url` as the single source.

### 7. Hardcoded https://tamer.studio (24+ instances)

SEO, homepage, and landing page code has `https://tamer.studio` hardcoded:

| File | Line | Usage |
|------|------|-------|
| `src/core/seo/seo-runtime.ts` | 29, 33 | baseUrl, defaultImage |
| `src/core/seo/seo-validation-runtime.ts` | 19 | baseUrl fallback |
| `src/core/seo/sitemap-runtime.ts` | 8 | baseUrl fallback |
| `src/core/seo/schema-runtime.ts` | 9, 160 | baseUrl, support email |
| `src/core/seo/robots-runtime.ts` | 39 | Sitemap URL |
| `src/core/seo/opengraph-runtime.ts` | 10 | defaultImage |
| `src/core/seo/metadata-runtime.ts` | 19 | metadataBase |
| `src/core/seo/hreflang-runtime.ts` | 10 | baseUrl |
| `src/core/seo/canonical-runtime.ts` | 8 | baseUrl |
| `src/core/seo/ai-search-runtime.ts` | 8 | baseUrl |
| `src/core/homepage/homepage-runtime.ts` | 178-189 | image, url, canonical, hreflang |
| `src/app/api/landing/seo/route.ts` | 35, 69-89 | image, url, hreflang |

**Fix:** Use `config.app.url` or `NEXT_PUBLIC_APP_URL` as the single source.

### 8. Hardcoded https://tamerstudio.com (Inconsistent Domain)

Marketing pages use a **different domain** (`tamerstudio.com`) from the rest of the codebase (`tamer.studio`):

| File | Line | Content |
|------|------|---------|
| `src/app/(marketing)/support/page.tsx` | 12 | `url: "https://tamerstudio.com/support"` |
| `src/app/(marketing)/roadmap/page.tsx` | 12 | `url: "https://tamerstudio.com/roadmap"` |
| `src/app/(marketing)/contact/page.tsx` | 12 | `url: "https://tamerstudio.com/contact"` |
| `src/app/(marketing)/careers/page.tsx` | 12 | `url: "https://tamerstudio.com/careers"` |
| `src/app/(marketing)/blog/page.tsx` | 12 | `url: "https://tamerstudio.com/blog"` |
| `src/app/(marketing)/about/page.tsx` | 12 | `url: "https://tamerstudio.com/about"` |
| `src/app/(marketing)/faq/page.tsx` | 12 | `url: "https://tamerstudio.com/faq"` |
| `src/app/(marketing)/credits/page.tsx` | 12 | `url: "https://tamerstudio.com/credits"` |
| `src/app/(marketing)/docs/page.tsx` | 12 | `url: "https://tamerstudio.com/docs"` |
| `src/app/(marketing)/features/page.tsx` | 12 | `url: "https://tamerstudio.com/features"` |

**Fix:** Choose one domain and extract to config. All URLs should come from the same source.

### 9. Hardcoded Social Handles

| File | Line | Content |
|------|------|---------|
| `src/core/seo/seo-runtime.ts` | 34-35 | `twitterSite: "@tamerstudio"`, `twitterCreator: "@tamerstudio"` |
| `src/core/seo/twitter-runtime.ts` | 9-10 | `site \|\| "@tamerstudio"`, `creator \|\| "@tamerstudio"` |
| `src/core/homepage/homepage-runtime.ts` | 185 | `twitterSite: "@tamerstudio"` |
| `src/app/api/landing/seo/route.ts` | 79 | `site: "@tamerstudio"` |

**Fix:** Extract to config or env var `TWITTER_HANDLE`.

### 10. Hardcoded Email Addresses (8+ files)

| File | Line | Email |
|------|------|-------|
| `src/lib/email/templates.ts` | 29 | `support@tamer.studio` |
| `src/modules/email/email.template.ts` | 24, 28, 55, 59, 112 | `support@tamer.studio` |
| `src/core/seo/schema-runtime.ts` | 160 | `support@tamer.studio` |
| `src/app/layout.tsx` | 32 | `support@tamer.studio` |
| `src/components/landing/Footer.tsx` | 71 | `support@tamer.studio` |
| `src/app/(marketing)/support/SupportContent.tsx` | 20 | `support@tamer.studio` |
| `src/app/(marketing)/contact/ContactContent.tsx` | 18 | `support@tamer.studio` |
| `src/app/admin/(protected)/email/templates/pageClient.tsx` | 85 | `support@tamer.studio` |
| `src/core/admin/settings/settings.service.ts` | 14 | `support@tamerstudio.com` (different!) |
| `src/app/api/admin/email/smtp/send-test/route.ts` | 85 | `noreply@tamer.studio` |
| `src/core/config/config.ts` | 59 | `noreply@tamerstudio.com` (different!) |

**Inconsistency:** Three different email addresses used as defaults (`support@tamer.studio`, `support@tamerstudio.com`, `noreply@tamerstudio.com`).

**Fix:** Extract `SUPPORT_EMAIL` and `DEFAULT_FROM_EMAIL` to config.

### 11. Hardcoded Social Links

| File | Line | Content |
|------|------|---------|
| `src/components/landing/Footer.tsx` | 39 | `https://discord.gg/tamerstudio` |
| `src/components/landing/Footer.tsx` | 40 | `https://github.com/tamerstudio` |
| `scripts/seed-landing-sections.ts` | 464-465 | Same Discord/GitHub URLs |

**Fix:** Extract to config.

### 12. Hardcoded Admin Fallbacks

| File | Line | Content |
|------|------|---------|
| `src/components/admin/AdminAvatarDropdown.tsx` | 49, 72 | `email: "admin@tamer.studio"` |
| `src/app/api/dev/create-admin/route.ts` | 13 | `getUserByEmail("admin@tamer.studio")` |
| `src/app/api/user/2fa/setup/route.ts` | 40 | `userRecord?.email \|\| "user@tamer.studio"` |

**Fix:** Use actual user data, not hardcoded fallbacks.

### 13. Hardcoded CSP Domains

| File | Line | Content |
|------|------|---------|
| `src/core/security/headers.ts` | 11 | `https://cdn.jsdelivr.net` |
| `src/core/security/headers.ts` | 13 | `https://*.r2.cloudflarestorage.com` |
| `src/core/security/headers.ts` | 14 | `https://fonts.googleapis.com`, `https://fonts.gstatic.com` |

**Fix:** Extract CSP allowed domains to config.

### 14. Hardcoded Stripe API Version

| File | Line | Content |
|------|------|---------|
| `src/core/payment/stripe-gateway.ts` | 20 | `apiVersion: "2025-05-28.basil"` cast as `LatestApiVersion` |

**Fix:** Pin version explicitly and validate compatibility.

### 15. Hardcoded Nginx Proxy Targets

| File | Line | Content |
|------|------|---------|
| `config/nginx/nginx.conf` | 47, 53, 59 | `proxy_pass http://app:3000` |
| `config/nginx/nginx.scaling.conf` | 3 | `server app:3000` |

**Fix:** Use env vars or Docker service names (already using `app:3000` which is Docker internal, acceptable).

### 16. Hardcoded Docker Healthcheck URLs

| File | Line | Content |
|------|------|---------|
| `Dockerfile` | 30 | `ENV PORT=3000` |
| `Dockerfile` | 34 | `http://localhost:3000/health` |
| `docker-compose.yml` | 11, 20 | `${APP_PORT:-3000}:3000`, `http://localhost:3000/health` |

**Fix:** Use `http://localhost:${PORT}/health` in Dockerfile, and the actual hostname in docker-compose.

---

## ACCEPTABLE — No Action Required

### 17. .env.example / production.env.example Template Values

These are template files with placeholder values — expected and correct:
- All `localhost` URLs in `.env.example` and `production.env.example`
- All placeholder API keys
- All placeholder database URLs

### 18. Test Files

All `localhost`, `127.0.0.1`, hardcoded URLs in test files are acceptable — they are test fixtures:
- `src/test/setup.ts`
- `src/test/unit/config/config.test.ts`
- `src/test/security/login-security.test.ts`
- `src/test/integration/auth/auth.test.ts`
- `src/test/security-tests.ts`
- `src/test/unit/notifications/*.test.ts`

### 19. Known Public API Endpoints

Standard provider API URLs are acceptable to hardcode:
- `https://api.openai.com/v1` (seed data)
- `https://api.anthropic.com` (seed data)
- `https://api.sendgrid.com/v3/user/profile`
- `https://api.resend.com/emails`
- `https://api.mailgun.net/v3/${domain}/stats`
- `https://api.postmarkapp.com/domains`
- `https://api.brevo.com/v3/account`
- `https://api.sparkpost.com/api/v1/account`

### 20. Schema.org and Sitemap Namespaces

Standard XML/JSON-LD namespace URLs:
- `https://schema.org` (Schema.org context)
- `http://www.sitemaps.org/schemas/sitemap/0.9` (Sitemap namespace)
- `http://www.google.com/schemas/sitemap-image/1.1`

### 21. iPaymu Provider URLs

| File | Line | Content |
|------|------|---------|
| `src/core/payment/providers/ipaymu.provider.ts` | 21 | `"https://sandbox.ipaymu.com"` / `"https://my.ipaymu.com"` |

These are the official iPaymu API endpoints — acceptable to hardcode.

### 22. Dev Script Defaults

Scripts like `verify-deployment.sh`, `health-check.sh`, and `create-admin.ts` use `localhost:3000` as defaults — acceptable for development tooling.

---

## Recommendations Summary

### Immediate Actions (Before Production)
1. **Rotate all secrets** — DB password, auth secrets, admin keys
2. **Fix `user.repository.ts` lines 25, 211** — Replace hardcoded `http://localhost:3000` with env var
3. **Unify domain** — Choose `tamer.studio` or `tamerstudio.com`, extract to single config
4. **Extract all hardcoded emails** to config constants
5. **Extract social links** to config

### Short-term (Before Deployment)
6. Remove all `|| "http://localhost:3000"` fallbacks from production code
7. Make `NEXT_PUBLIC_APP_URL` required in env validation
8. Unify email address defaults (`support@tamer.studio` vs `support@tamerstudio.com`)

### Medium-term
9. Implement CSP domain configuration via env vars
10. Add Sentry integration (currently defined but not implemented)
11. Unify feature flag system
