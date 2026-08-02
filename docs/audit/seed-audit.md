# Seed Audit — INSTALL-AUDIT-01

> Generated: 2026-08-03
> Source: `src/` and `scripts/` (Single Source of Truth)

---

## Executive Summary

Tamer Studio has **4 seed implementations**:

1. **Main Database Seed** (`src/scripts/seed.ts`) — Comprehensive dev seed
2. **Commerce Seed** (`src/core/commerce/seed.ts`) — Idempotent commerce data
3. **Landing Sections Seed** (`scripts/seed-landing-sections.ts`) — Landing page content
4. **Admin Bootstrap Script** (`scripts/create-admin.ts`) — Admin user creation

Each serves a different purpose. The commerce seed and admin script are the most relevant for installation reuse.

---

## 1. Main Database Seed

**File:** `src/scripts/seed.ts` (891 lines)
**Invocation:** `pnpm db:seed`

### Purpose
Development-only comprehensive seed that populates the entire database with test data.

### Data Seeded
| Category | Items | Count |
|----------|-------|-------|
| Users | admin, regular, demo | 3 |
| User Profiles | One per user | 3 |
| Roles | Admin (level 100), User (level 10) | 2 |
| Permissions | admin:access, user:create, workspace:create | 3 |
| Role-Permission Links | Admin gets all 3, User gets workspace:create | 4 |
| Workspaces | Default Workspace (personal) | 1 |
| Workspace Members | Admin as member with Admin role | 1 |
| API Keys | Development Key | 1 |
| Feature Flags | dark_mode, new_dashboard, ai_suggestions | 3 |
| AI Providers | OpenAI, Anthropic | 2 |
| AI Models | gpt-4, gpt-4-turbo, claude-3-opus, claude-3-haiku | 4 |
| Jobs | video.generate, image.generate, audio.generate | 3 |
| Queues | default queue | 1 |
| Workflows | Content Generation Pipeline | 1 |
| Workflow Executions | 1 completed execution | 1 |
| Billing | Pro plan billing | 1 |
| Subscriptions | Active Pro subscription | 1 |
| Invoices | Paid invoice | 1 |
| Wallets | 1000 credits | 1 |
| Credit Transactions | Initial purchase | 1 |
| Coupons | LAUNCH2026, WELCOME50 | 2 |
| Vouchers | GIFT100 | 1 |
| Orders | Paid order | 1 |
| Checkout Sessions | Completed session | 1 |
| Payment Intents | Succeeded payment | 1 |
| Refunds | Pending refund | 1 |
| Tax Rules | US Sales Tax | 1 |
| Support Tickets | Billing question | 1 |
| Support Comments | 1 comment on ticket | 1 |
| Knowledge Categories | Billing | 1 |
| Knowledge Articles | How to update payment method | 1 |
| SLA Policies | Standard Response Time | 1 |
| Notification Templates | Welcome Email | 1 |
| Notification Preferences | Email billing notifications | 1 |
| Notifications | Invoice Paid | 1 |
| Event Queue | notification.send event | 1 |
| Assets | Marketing image | 1 |
| Asset Collections | Marketing Assets | 1 |
| Asset Tags | marketing | 1 |
| Asset Versions | 1.0.0 | 1 |
| Production Metrics | 1 completed production | 1 |
| User Activity Metrics | create_project action | 1 |
| Workspace Metrics | Daily metrics | 1 |
| Audit Logs | user.login event | 1 |

### Execution Behavior
- **Destructive**: Clears ALL existing data before seeding
- **Non-idempotent**: Running twice creates duplicates (after clear)
- **No error recovery**: Fails entire seed on any error

### Can Installer Reuse It?
| Verdict | Reason |
|---------|--------|
| **NO** | Destructive (clears all data). Development-only purpose. Mixed concerns (users + test data). |

### What CAN Be Extracted for Installer
| Extractable | Current Location | Purpose |
|-------------|-----------------|---------|
| Role seeding | Lines 184-204 | Admin + User roles |
| Permission seeding | Lines 206-252 | Core permissions + role mappings |
| Default workspace | Lines 254-278 | Default workspace + admin membership |

### Improvement Opportunities
- Separate "installation seed" (roles, permissions, defaults) from "development seed" (test data)
- Make seed idempotent (check existence before insert)
- Add transaction wrapping for atomicity

---

## 2. Commerce Seed

**File:** `src/core/commerce/seed.ts` (205 lines)
**Invocation:** Called via `ensureSeeded()` from commerce API routes

### Purpose
Idempotent seeding of commerce plans, billing options, and pricing.

### Data Seeded
| Type | Items |
|------|-------|
| Plans | Lite ($9.99/mo), Creator ($29.99/mo), Pro ($79.99/mo) |
| Billing Options | Monthly, Yearly (20% savings), One-Time |
| Pricing | 6 combinations (Lite×2, Creator×2, Pro×2) |

### Execution Behavior
- **Idempotent**: Checks existence before inserting
- **Promise-deduplicated**: Concurrent calls share same promise
- **Non-destructive**: Only adds missing data

### Can Installer Reuse It?
| Verdict | Reason |
|---------|--------|
| **YES** | Already idempotent. Uses repository pattern. Can be called during installation. |

---

## 3. Landing Sections Seed

**File:** `scripts/seed-landing-sections.ts` (522 lines)
**Invocation:** `tsx scripts/seed-landing-sections.ts`

### Purpose
Seeds 14 landing page sections with comprehensive content.

### Data Seeded
| Section | Order | Content |
|---------|-------|---------|
| Hero | 0 | Headline, CTA buttons, provider logos |
| Social Proof | 1 | Stats (10K+ projects, 500+ teams, etc.) |
| Features | 2 | 9 feature cards with icons |
| AI Platform | 3 | 7 AI platform features |
| Screenshots | 4 | 6 screenshot placeholders |
| Realtime Stats | 5 | 8 stat items |
| Pricing | 6 | Pricing tiers |
| Credit Packs | 7 | Credit purchase options |
| Calculator | 8 | Cost calculator |
| Credit Usage | 9 | Credit usage display |
| Testimonials | 10 | User testimonials |
| FAQ | 11 | Frequently asked questions |
| CTA | 12 | Call to action |
| Footer | 13 | Footer links |

### Execution Behavior
- Uses `ON CONFLICT` for idempotency (upsert pattern)
- Direct database inserts (not through repository layer)
- Requires `landing` schema tables to exist

### Can Installer Reuse It?
| Verdict | Reason |
|---------|--------|
| **YES** | Idempotent (upsert). Can be called after migration. Provides default landing content. |

### Improvement Opportunities
- Should use repository layer instead of direct DB access
- Could be moved to `src/core/landing/seed.ts` for consistency

---

## 4. Admin Bootstrap Script

**File:** `scripts/create-admin.ts` (48 lines)
**Invocation:** `ADMIN_EMAIL=x ADMIN_PASSWORD=y pnpm tsx scripts/create-admin.ts`

### Purpose
Creates the initial admin user for the admin panel.

### Data Seeded
| Field | Value |
|-------|-------|
| ID | `admin_{UUID}` |
| Email | From `ADMIN_EMAIL` env var |
| Password Hash | Scrypt hash of `ADMIN_PASSWORD` |
| Name | "Admin" |
| Role | "admin" |
| isActive | true |

### Execution Behavior
- Requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars
- Password must be ≥ 12 characters
- Creates record in `admin` table (separate from `user` table)
- Warns to remove env vars after use

### Can Installer Reuse It?
| Verdict | Reason |
|---------|--------|
| **YES** | Clean, focused script. Can be integrated into installation wizard. |

### Improvement Opportunities
- Should accept name as parameter (not hardcoded "Admin")
- Should create workspace membership for admin
- Should set `emailVerified: true` for admin
- Should log audit event

---

## Seed Execution Order (Current)

```
1. pnpm db:migrate          → Database schema ready
2. pnpm db:seed             → Dev data (destructive)
3. pnpm tsx scripts/seed-landing-sections.ts → Landing content
4. ADMIN_EMAIL=X ADMIN_PASSWORD=Y pnpm tsx scripts/create-admin.ts → Admin user
5. [Runtime] ensureSeeded() → Commerce plans (idempotent)
```

---

## Recommendations

| Seed | Action | Installer Reuse |
|------|--------|----------------|
| Main DB Seed | **IMPROVE** — Extract installation-relevant parts | Extract roles, permissions, defaults |
| Commerce Seed | **KEEP** — Already idempotent | Direct reuse |
| Landing Seed | **KEEP** — Idempotent upsert | Direct reuse |
| Admin Script | **IMPROVE** — Add workspace, audit, naming | Integrate into installer |
