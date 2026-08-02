# Tamer Studio — Architecture Audit Report (Sprint CMS-00)

Generated: 2026-07-27
Scope: Complete architecture audit — analysis only, no code changes
Status: ANALYSIS ONLY — No implementation

---

## 1. Current Architecture

### Overview

Tamer Studio is a Next.js 16 application using the App Router with TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, and shadcn/ui components. The project follows a hybrid architecture combining:

- **Marketing Website** — Public-facing pages under `src/app/(marketing)/`
- **Admin Panel** — Protected admin pages under `src/app/admin/(protected)/`
- **Dashboard** — User dashboard under `src/app/(dashboard)/`
- **Auth Pages** — Authentication flows under `src/app/(auth)/`
- **API Routes** — REST API under `src/app/api/`
- **Core Modules** — Business logic under `src/core/`
- **Components** — UI components under `src/components/`

### Architecture Patterns

- **App Router** with route groups `(marketing)`, `(dashboard)`, `(auth)`, `(admin)`
- **Server Components** by default, with `"use client"` for interactive components
- **Drizzle ORM** for database access with PostgreSQL
- **better-auth** for authentication
- **next-intl NOT used** — custom localization system via `src/lib/localization/`
- **shadcn/ui** component library with base-nova style
- **@dnd-kit** for drag-and-drop in the Landing Builder
- **@base-ui/react** for UI primitives
- **recharts** for charts
- **sonner** for toast notifications
- **swr** for client-side data fetching
- **react-hook-form** + **@hookform/resolvers** + **zod** for forms

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and layouts |
| `src/components/` | React components organized by domain |
| `src/core/` | Business logic modules (auth, admin, ai, billing, etc.) |
| `src/lib/` | Utilities, database schema, localization, AI SDK |
| `src/providers/` | React context providers (localization, currency) |
| `src/hooks/` | Custom React hooks |
| `src/features/` | Feature-specific modules (auth, ai, production, project, workspace) |
| `src/modules/` | Email modules |
| `src/app/api/` | API routes (REST) |
| `locales/` | Translation JSON files (en.json, id.json) |
| `drizzle/` | Database migration snapshots |

### Technology Stack

- **Framework**: Next.js 16.2.10 (App Router)
- **Language**: TypeScript 5.9.2
- **Database**: PostgreSQL via Drizzle ORM 0.45.2
- **Auth**: better-auth 1.6.23 with Drizzle adapter
- **UI**: shadcn/ui (base-nova style), Tailwind CSS 4.3.3
- **State**: React Context, useState, useReducer
- **Data Fetching**: fetch API, swr (client-side)
- **Forms**: react-hook-form + zod
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Charts**: recharts 3.10.0
- **Email**: @sendgrid/mail, resend, mailgun.js, @aws-sdk/client-ses
- **AI**: @google/generative-ai, openai
- **Real-time**: socket.io + socket.io-client
- **Caching**: @upstash/redis, @upstash/ratelimit
- **Payments**: Stripe (implied via billing module)
- **i18n**: Custom localization service (NOT next-intl)
- **Deployment**: Vercel (evidenced by VERCEL_URL references)

---

## 2. Project Structure

### App Router Route Groups

```
src/app/
├── (auth)/                    # Authentication routes
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify-email/page.tsx
│   └── layout.tsx
├── (dashboard)/               # User dashboard routes
│   ├── layout.tsx
│   ├── page.tsx               # Dashboard home
│   ├── ai/page.tsx            # AI platform
│   ├── api-keys/page.tsx
│   ├── billing/page.tsx
│   ├── media/page.tsx
│   ├── notifications/page.tsx
│   ├── production/[id]/page.tsx
│   ├── production/page.tsx
│   ├── profile/page.tsx
│   ├── projects/[id]/page.tsx
│   ├── projects/page.tsx
│   ├── publishing/page.tsx
│   ├── settings/page.tsx
│   ├── templates/page.tsx
│   └── workspace/[id]/page.tsx
│   └── workspace/page.tsx
├── (marketing)/               # Public marketing routes
│   ├── layout.tsx
│   ├── page.tsx               # Homepage (root)
│   ├── about/page.tsx
│   ├── blog/[slug]/page.tsx
│   ├── blog/page.tsx
│   ├── careers/page.tsx
│   ├── contact/page.tsx
│   ├── credits/page.tsx
│   ├── docs/page.tsx
│   ├── faq/page.tsx
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── register/page.tsx
│   ├── roadmap/page.tsx
│   └── support/page.tsx
│   ├── legal/privacy/page.tsx
│   └── legal/terms/page.tsx
├── admin/                     # Admin panel routes
│   ├── page.tsx               # Admin home
│   ├── (public)/              # Public admin routes
│   │   ├── login/page.tsx
│   │   └── logout/page.tsx
│   └── (protected)/           # Protected admin routes
│       ├── layout.tsx
│       ├── ai-providers/page.tsx
│       ├── analytics/page.tsx
│       ├── api-keys/page.tsx
│       ├── audit-logs/page.tsx
│       ├── billing/page.tsx
│       ├── coupons/page.tsx
│       ├── email/page.tsx + sub-routes
│       ├── feature-flags/page.tsx
│       ├── jobs/page.tsx
│       ├── landing-builder/page.tsx
│       ├── organizations/page.tsx
│       ├── profile/page.tsx
│       ├── queues/page.tsx
│       ├── settings/page.tsx
│       ├── subscriptions/page.tsx
│       ├── users/page.tsx
│       └── workspaces/page.tsx
├── api/                       # API routes
│   ├── admin/                 # Admin API (27+ endpoints)
│   ├── analytics/
│   ├── auth/
│   ├── billing/
│   ├── landing/               # Landing page API
│   ├── localization/
│   ├── notifications/
│   └── ... (18+ route groups)
├── dashboard/                 # Legacy dashboard
├── error.tsx
├── layout.tsx                 # Root layout
├── not-found.tsx
└── page.tsx                   # Root page (redirects to marketing)
```

### Component Organization

```
src/components/
├── admin/                     # Admin-specific components
├── ai/                        # AI-related components
├── analytics/                 # Analytics dashboard components
├── auth/                      # Auth-related components
├── dashboard/                 # Dashboard components
├── landing/                   # Landing page components
├── production/                # Production-related components
├── project/                   # Project-related components
├── providers/                 # Provider components (Theme, etc.)
├── ui/                        # Base UI components (shadcn)
└── workspace/                 # Workspace-related components
```

### Core Module Organization

```
src/core/
├── admin/                     # Admin panel logic
├── ai/                        # AI provider management
├── auth/                      # Authentication logic
├── billing/                   # Billing logic
├── commerce/                  # Commerce (orders, vouchers, etc.)
├── localization/              # Localization services
├── middleware/                # Express-style middleware
└── ... (20+ modules)
```

### Key Observations

1. **Route groups** are used extensively for organization without affecting URL paths
2. **Marketing layout** (`src/app/(marketing)/layout.tsx`) wraps all public pages with Header and Footer
3. **Admin layout** is minimal — just AdminShell + PageLayout with no session validation in dev
4. **Dashboard layout** uses AppShell + PageLayout
5. **Root layout** includes ThemeProvider, LocalizationProvider, CurrencyProvider, and JSON-LD structured data
6. **API routes** are organized by domain (admin, auth, billing, landing, localization, etc.)
7. **No middleware.ts** exists at the root — no Next.js middleware for geo-detection or locale routing
8. **The landing page** (`src/app/page.tsx`) is a Server Component that fetches SEO data via client-side fetch in `generateMetadata`

---

## 3. Reusable Components

### Existing Reusable Components

| Component | Path | Reusability | Notes |
|-----------|------|-------------|-------|
| `Button` | `src/components/ui/button.tsx` | High | Base button with variants |
| `Card` | `src/components/ui/card.tsx` | High | Container card |
| `Badge` | `src/components/ui/Badge.tsx` | High | Status indicator |
| `Input` | `src/components/ui/input.tsx` | High | Form input |
| `Label` | `src/components/ui/label.tsx` | High | Form label |
| `Checkbox` | `src/components/ui/checkbox.tsx` | High | Checkbox input |
| `Sheet` | `src/components/ui/Sheet.tsx` | High | Slide-over panel |
| `Sidebar` | `src/components/ui/Sidebar.tsx` | Medium | Navigation sidebar |
| `SidebarItem` | `src/components/ui/SidebarItem.tsx` | Medium | Sidebar navigation item |
| `StatCard` | `src/components/ui/StatCard.tsx` | High | Statistics card |
| `DashboardCard` | `src/components/ui/DashboardCard.tsx` | High | Dashboard container card |
| `PageContainer` | `src/components/ui/PageContainer.tsx` | High | Page wrapper |
| `PageHeader` | `src/components/ui/PageHeader.tsx` | High | Page header with title |
| `PageLayout` | `src/components/ui/PageLayout.tsx` | High | Page layout with breadcrumbs |
| `AppShell` | `src/components/ui/AppShell.tsx` | Medium | App shell layout |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | High | Loading skeleton |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | High | Empty state placeholder |
| `ErrorState` | `src/components/ui/states/Error.tsx` | High | Error state |
| `Loading` | `src/components/ui/states/Loading.tsx` | High | Loading state |
| `ElegantLoader` | `src/components/ui/ElegantLoader.tsx` | Medium | Animated loader |
| `Avatar` | `src/components/ui/Avatar.tsx` | High | User avatar |
| `AvatarDropdown` | `src/components/ui/AvatarDropdown.tsx` | Medium | Avatar with dropdown |
| `Breadcrumb` | `src/components/ui/Breadcrumb.tsx` | High | Breadcrumb navigation |
| `SearchInput` | `src/components/ui/SearchInput.tsx` | High | Search input field |
| `NotificationCenter` | `src/components/ui/NotificationCenter.tsx` | Medium | Notification panel |
| `LanguageSwitcher` | `src/components/ui/LanguageSwitcher.tsx` | Medium | Locale switcher |
| `ThemeProvider` | `src/components/providers/ThemeProvider.tsx` | High | Theme context provider |
| `HtmlLangUpdater` | `src/components/providers/HtmlLangUpdater.tsx` | Medium | Updates html lang attribute |
| `Topbar` | `src/components/ui/Topbar.tsx` | Medium | Top navigation bar |
| `WorkspaceSwitcher` | `src/components/ui/WorkspaceSwitcher.tsx` | Medium | Workspace selector |
| `AdminShell` | `src/components/admin/AdminShell.tsx` | Medium | Admin layout shell |
| `AdminSidebar` | `src/components/admin/AdminSidebar.tsx` | Medium | Admin navigation sidebar |
| `AdminTopbar` | `src/components/admin/AdminTopbar.tsx` | Medium | Admin top bar |
| `AdminAvatarDropdown` | `src/components/admin/AdminAvatarDropdown.tsx` | Medium | Admin user menu |
| `AdminLoginForm` | `src/components/admin/AdminLoginForm.tsx` | Medium | Admin login form |
| `AdminDataTable` | `src/components/admin/AdminDataTable.tsx` | Medium | Generic data table |
| `AdminShell` | `src/components/admin/AdminShell.tsx` | Medium | Admin page shell |
| `Breadcrumbs` | `src/components/admin/Breadcrumbs.tsx` | Medium | Admin breadcrumbs |
| `TranslationKeyPicker` | `src/components/admin/TranslationKeyPicker.tsx` | Low | Translation key selector |
| `Header` | `src/components/landing/Header.tsx` | Medium | Site header with nav |
| `Footer` | `src/components/landing/Footer.tsx` | Medium | Site footer |
| `Hero` | `src/components/landing/Hero.tsx` | Medium | Hero section |
| `Features` | `src/components/landing/Features.tsx` | Medium | Features grid |
| `PricingSection` | `src/components/landing/PricingSection.tsx` | Medium | Pricing plans |
| `FAQ` | `src/components/landing/FAQ.tsx` | Medium | FAQ accordion |
| `Testimonials` | `src/components/landing/Testimonials.tsx` | Medium | Testimonials |
| `SocialProof` | `src/components/landing/SocialProof.tsx` | Medium | Social proof section |
| `CTASection` | `src/components/landing/CTASection.tsx` | Medium | Call to action |
| `AIPlatform` | `src/components/landing/AIPlatform.tsx` | Medium | AI platform section |
| `Screenshots` | `src/components/landing/Screenshots.tsx` | Medium | Screenshots carousel |
| `RealtimeStats` | `src/components/landing/RealtimeStats.tsx` | Medium | Real-time statistics |
| `CampaignBanner` | `src/components/landing/CampaignBanner.tsx` | Medium | Campaign banner |
| `CreditPacks` | `src/components/landing/CreditPacks.tsx` | Medium | Credit pack display |
| `CreditCalculator` | `src/components/landing/CreditCalculator.tsx` | Medium | Credit cost calculator |
| `CreditUsageTable` | `src/components/landing/CreditUsageTable.tsx` | Medium | Credit usage table |
| `LandingPageContent` | `src/components/landing/LandingPageContent.tsx` | Medium | Landing page orchestrator |
| `LandingKeyboardShortcuts` | `src/components/landing/LandingKeyboardShortcuts.tsx` | Low | Keyboard shortcuts |
| `SectionHeader` | `src/components/ui/SectionHeader.tsx` | Medium | Section heading |
| `ActionButton` | `src/components/ui/ActionButton.tsx` | Medium | Action button variant |
| `PermissionGuard` | `src/components/auth/PermissionGuard.tsx` | Medium | Permission-based rendering |
| `RoleGuard` | `src/components/auth/RoleGuard.tsx` | Medium | Role-based rendering |
| `ProjectCard` | `src/components/project/ProjectCard.tsx` | Medium | Project card |
| `ProjectDetail` | `src/components/project/ProjectDetail.tsx` | Medium | Project detail view |
| `WorkspaceCard` | `src/components/workspace/WorkspaceCard.tsx` | Medium | Workspace card |
| `WorkspaceDetail` | `src/components/workspace/WorkspaceDetail.tsx` | Medium | Workspace detail |
| `WorkspaceEditForm` | `src/components/workspace/WorkspaceEditForm.tsx` | Medium | Workspace edit form |
| `ProductionCard` | `src/components/production/ProductionCard.tsx` | Medium | Production card |
| `CollaborativeProductionEditor` | `src/components/production/CollaborativeProductionEditor.tsx` | Low | Production editor |
| `AIProviderCard` | `src/components/ai/AIProviderCard.tsx` | Medium | AI provider card |
| `PromptTemplateCard` | `src/components/ai/PromptTemplateCard.tsx` | Medium | Prompt template card |
| `AnalyticsDashboard` | `src/components/analytics/AnalyticsDashboard.tsx` | Medium | Analytics dashboard |
| `AnalyticsPanel` | `src/components/dashboard/AnalyticsPanel.tsx` | Medium | Analytics panel |
| `AuditLogs` | `src/components/dashboard/AuditLogs.tsx` | Medium | Audit log display |
| `ChartComponents` | `src/components/dashboard/ChartComponents.tsx` | Medium | Chart components |
| `DashboardHero` | `src/components/dashboard/DashboardHero.tsx` | Medium | Dashboard hero |
| `DashboardSkeleton` | `src/components/dashboard/DashboardSkeleton.tsx` | Medium | Dashboard loading skeleton |
| `HealthPanel` | `src/components/dashboard/HealthPanel.tsx` | Medium | Health status panel |
| `NotificationsContent` | `src/components/dashboard/NotificationsContent.tsx` | Medium | Notifications content |
| `StatisticsCards` | `src/components/dashboard/StatisticsCards.tsx` | Medium | Statistics cards |
| `CommandPalette` | `src/components/ui/CommandPalette.tsx` | Medium | Command palette |
| `sonner` | `src/components/ui/sonner.tsx` | High | Toast notification wrapper |
| `sonner` | `src/components/ui/sonner.tsx` | High | Toast notification wrapper |

---

## 4. Duplicate Components

### Confirmed Duplicates

| Component | Location 1 | Location 2 | Impact |
|-----------|-----------|-----------|--------|
| `AnalyticsDashboard` | `src/components/analytics/AnalyticsDashboard.tsx` | `src/components/dashboard/AnalyticsDashboard.tsx` | Same component in two directories — one is likely unused or a copy |
| `DashboardCard` | `src/components/ui/DashboardCard.tsx` | `src/components/dashboard/` (imported) | UI component used by dashboard |
| `SectionList.tsx` inline SVGs | `src/app/admin/(protected)/landing-builder/_components/SectionList.tsx` | `src/app/admin/(protected)/landing-builder/_components/SectionDrawer.tsx` | EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, EditIcon, TrashIcon, SearchIcon, PlusIcon defined inline in both files |
| `Footer.tsx` social SVGs | `src/components/landing/Footer.tsx` | Hardcoded in component | Discord and GitHub SVGs are inline, not reusable |
| `Header.tsx` nav items | `src/components/landing/Header.tsx` | Hardcoded navigation | Navigation items are hardcoded, not data-driven |
| `LandingPageContent.tsx` | `src/components/landing/LandingPageContent.tsx` | `src/app/page.tsx` | Orchestrator used only on homepage |
| `useLandingSections` hook | `src/hooks/use-landing-sections.ts` | `src/app/admin/(protected)/landing-builder/_components/LivePreview.tsx` | Same hook imported in two different contexts |
| `useLandingData` hook | `src/hooks/use-landing-data.ts` | `src/components/landing/Hero.tsx`, `PricingSection.tsx`, `FAQ.tsx`, `Footer.tsx` | Same hook used across multiple landing components |
| `LocalizationProvider` | `src/providers/localization/LocalizationProvider.tsx` | `src/providers/localization/index.ts` | Provider + index re-export |
| `LandingSection` type | `src/hooks/use-landing-sections.ts` | `src/app/admin/(protected)/landing-builder/_components/SectionList.tsx` | Type defined in hook file, duplicated in SectionList |
| `SectionRendererProps` | `src/lib/landing-section-renderer.ts` | `src/components/landing/Hero.tsx`, `FAQ.tsx`, `PricingSection.tsx`, `Footer.tsx`, etc. | Type imported from lib, but also defined in SectionList.tsx as `LandingSection` |

### Near-Duplicates

| Component | Notes |
|-----------|-------|
| `AdminDataTable` vs `SectionList` | Both are data tables with sorting, filtering, and row actions |
| `AdminSidebar` vs `Sidebar` | Both are navigation sidebars with similar structure |
| `AdminTopbar` vs `Topbar` | Both are top navigation bars |
| `DashboardCard` (ui) vs `DashboardCard` (dashboard) | Same name, different locations — potential conflict |
| `LandingSection` type (hook) vs `LandingSection` type (SectionList) | Same type name, different definitions |
| `renderLandingSection` vs `renderLandingSections` | Single section vs. list — could be unified |
| `CurrencyProvider` vs `LocalizationProvider` | Both are context providers with similar patterns |
| `useLocalizationContext` vs `useLocalization` | Two hooks for the same purpose |
| `useLocale` vs `useLocalization` vs `useLocalizationContext` | Three hooks for locale-related functionality |

### Duplicated CSS/Styles

- Multiple components use the same gradient patterns (`from-primary to-primary/80`)
- Multiple components use the same card styling (`border border-border bg-card`)
- Multiple components use the same button styling patterns
- The `cn()` utility is used everywhere for class merging

### Duplicated Utilities

- `cn()` from `@/lib/utils` — used across the project (good, centralized)
- `toFooterLink()` in `Footer.tsx` — similar pattern could be generalized
- `escapeHtml()` in `LivePreview.tsx` — only used in one place
- `generatePreviewHTML()` in `LivePreview.tsx` — only used in one place

---

## 5. Database Review

### Schema Files (21 files in `src/lib/db/schema/`)

| File | Tables | Status |
|------|--------|--------|
| `auth.ts` | user, session, account, verification | Migrates exist (0000, 0002) |
| `auth-events.ts` | failed_login_attempt | Migration exists (0001) |
| `identity.ts` | user_profile, external_identity, user_preferences, role, permission, role_permission, organization, workspace, workspace_member, organization_member, invitation, api_key, workspace_transfer | **NO MIGRATIONS** |
| `billing.ts` | wallet, credit_transaction, credit_reservation, usage_record, cost_record, subscription, invoice | **NO MIGRATIONS** |
| `billing-admin.ts` | billing (admin) | **NO MIGRATIONS** |
| `commerce.ts` | order, checkout_session, payment_intent, payment_attempt, voucher, voucher_usage, coupon, coupon_usage, tax_rule, refund | **NO MIGRATIONS** |
| `email.ts` | email_provider, email_template, email_template_version, email_queue, email_log, email_preference | **NO MIGRATIONS** |
| `feature-flags.ts` | feature_flag, feature_flag_variant | **NO MIGRATIONS** |
| `ai-providers.ts` | ai_provider, ai_provider_model | **NO MIGRATIONS** |
| `analytics.ts` | production_metrics, user_activity_metrics, workspace_metrics | **NO MIGRATIONS** |
| `asset.ts` | asset, asset_version, asset_lineage, asset_collection, asset_collection_item, asset_tag, asset_lifecycle_event | **NO MIGRATIONS** |
| `audit.ts` | audit_log | **NO MIGRATIONS** |
| `admin.ts` | Empty placeholder | **NO MIGRATIONS** |
| `jobs.ts` | job, queue | **NO MIGRATIONS** |
| `workflows.ts` | workflow, workflow_execution | **NO MIGRATIONS** |
| `notification.ts` | notification_template, notification_template_version, notification_preference, notification, event_queue | **NO MIGRATIONS** |
| `support.ts` | support_ticket, support_ticket_comment, support_knowledge_category, support_knowledge_article, support_feedback, support_customer_timeline, support_sla_policy, support_sla_violation, support_attachment, support_internal_note | **NO MIGRATIONS** |
| `localization.ts` | localization_profile, region, pricing_profile, pricing_rule, payment_profile, payment_method, currency_profile | **NO MIGRATIONS** |
| `landing.ts` | landing_section, landing_media | **NO MIGRATIONS** |
| `index.ts` | Re-exports all schemas | N/A |

### Critical Database Issues

1. **Only 3 migrations exist** (0000, 0001, 0002) covering only auth tables
2. **42+ tables defined in Drizzle schema have NO migrations** — they do not exist in the database
3. **Admin APIs use raw SQL** against tables that may not exist (`billing`, `organization`, `workspace`)
4. **3 core services are in-memory only** — job-store, ProvidersService, FeatureFlagsService
5. **ID type inconsistency** — analytics tables use `serial`/`uuid` while all others use `text`
6. **Missing foreign keys** on most tables
7. **Missing audit fields** (`createdBy`, `updatedBy`) on 40+ tables
8. **Missing `description` column** on `workspace` table
9. **No soft-delete pattern** on commerce tables
10. **The `landing.ts` schema** has `landing_section` and `landing_media` tables — these are the only CMS-like tables

### Landing-Specific Tables

#### `landing_section`
- `id` (text, PK), `sectionKey` (text, unique), `title`, `description`, `component`, `type`, `visible`, `locked`, `order`, `config` (jsonb), `styles` (jsonb), `createdAt`, `updatedAt`
- Has indexes on `sectionKey`, `order`, `type`, `visible`, `locked`
- **No localization columns** — content is stored in `config` JSONB only
- **No versioning** — no history tracking
- **No publish workflow** — visible flag is the only state control

#### `landing_media`
- `id` (text, PK), `sectionKey` (FK → landing_section), `url`, `alt`, `type`, `order`, `createdAt`
- Cascades on delete from landing_section

### Reusable Tables

| Table | Reusable? | Notes |
|-------|-----------|-------|
| `user` | Yes | Core auth table, reusable for any user management |
| `session` | Yes | Session management |
| `account` | Yes | OAuth/SSO accounts |
| `localization_profile` | Yes | Reusable for multi-tenant locale config |
| `region` | Yes | Reusable for geo-based routing |
| `pricing_profile` | Yes | Reusable for subscription pricing |
| `payment_profile` | Yes | Reusable for payment methods |
| `currency_profile` | Yes | Reusable for currency formatting |
| `landing_section` | Yes | CMS section table, reusable for website CMS |
| `landing_media` | Yes | Media attachment table, reusable |
| `voucher` | Yes | Reusable for promotions |
| `subscription` | Yes | Reusable for recurring billing |
| `wallet` | Yes | Reusable for credit system |
| `order` | Yes | Reusable for commerce |
| `asset` | Yes | Reusable for media management |
| `notification` | Yes | Reusable for notifications |
| `email_template` | Yes | Reusable for email templates |
| `ai_provider` | Yes | Reusable for AI provider config |

### Tables That Should Remain Untouched

- `user`, `session`, `account`, `verification` — core auth tables
- `failed_login_attempt` — security audit table
- `audit_log` — compliance table
- `api_key` — security table

### Tables with Data Duplication Risk

- `pricing_rule` duplicates pricing info that could be in `pricing_profile.config`
- `currency_profile` duplicates currency info that could be in `localization_profile`
- `landing_section.config` stores JSON that could be normalized into separate columns
- `voucher` and `coupon` may overlap in functionality
- `subscription` and `billing` tables may have overlapping data

---

## 6. Business Module Review

### Authentication Module

| Aspect | Status |
|--------|--------|
| Implementation | `better-auth` v1.6.23 with Drizzle adapter |
| Schema | `src/lib/db/schema/auth.ts` — user, session, account, verification |
| API Routes | `src/app/api/auth/` — login, register, forgot-password, reset-password, verify-email, sign-in, sign-out |
| Admin Auth | `src/app/api/admin/auth/` — admin login/logout |
| Middleware | `src/core/middleware/auth.middleware.ts` — admin auth middleware |
| Guards | `src/core/auth/guards.ts`, `src/components/auth/PermissionGuard.tsx`, `src/components/auth/RoleGuard.tsx` |
| Features | Email verification, password reset, OAuth support, session management |
| Reusable? | Yes — core auth module, well-structured |

### Users Module

| Aspect | Status |
|--------|--------|
| Schema | `user` table in auth.ts + `user_profile` in identity.ts |
| Admin API | `src/app/api/admin/users/` — CRUD operations |
| Profile | `src/app/(dashboard)/profile/page.tsx` |
| Features | User management, role-based access, preferences |
| Reusable? | Yes — user data is foundational |

### Subscription Module

| Aspect | Status |
|--------|--------|
| Schema | `subscription` table in billing.ts (no migration) |
| API | `src/app/api/landing/subscription/` — returns subscription plans from landing_section.config |
| Admin | `src/app/admin/(protected)/subscriptions/page.tsx` |
| Core | `src/core/subscription/` — plans.ts, subscription.ts |
| Reusable? | Yes — subscription data drives pricing display |

### Credits Module

| Aspect | Status |
|--------|--------|
| Schema | `wallet`, `credit_transaction`, `credit_reservation` in billing.ts |
| API | `src/app/api/landing/currency/` — returns currency data |
| Components | `CreditPacks`, `CreditCalculator`, `CreditUsageTable` |
| Reusable? | Yes — credit system is a core business feature |

### Voucher Module

| Aspect | Status |
|--------|--------|
| Schema | `voucher`, `voucher_usage` in commerce.ts |
| API | `src/app/api/admin/coupons/` — admin coupon management |
| Core | `src/core/commerce/voucher/` — voucher.service.ts, voucher.repository.ts |
| Reusable? | Yes — voucher system is reusable for promotions |

### Payment Module

| Aspect | Status |
|--------|--------|
| Schema | `order`, `checkout_session`, `payment_intent`, `payment_attempt` in commerce.ts |
| API | `src/app/api/billing/`, `src/app/api/admin/billing/` |
| Core | `src/core/commerce/checkout/`, `payment/`, `refund/`, `tax/`, `transactions/` |
| Reusable? | Yes — payment infrastructure is reusable |

### AI Providers Module

| Aspect | Status |
|--------|--------|
| Schema | `ai_provider`, `ai_provider_model` — **NO MIGRATIONS** |
| Core | `src/core/ai/` — extensive AI provider management (factory, registry, fallback, health, etc.) |
| Components | `AIProviderCard`, `PromptTemplateCard` |
| Admin | `src/app/admin/(protected)/ai-providers/page.tsx` |
| Features | Provider registry, model selection, cost tracking, health checks, retry logic |
| Reusable? | Yes — AI provider abstraction is well-designed |

### Localization Module

| Aspect | Status |
|--------|--------|
| Custom | NOT next-intl — custom localization service |
| Schema | `localization_profile`, `region`, `pricing_profile`, `pricing_rule`, `payment_profile`, `payment_method`, `currency_profile` |
| API | `src/app/api/admin/localization/` — profiles, regions, currencies, exchange-rates, pricing-profiles, payment-profiles |
| Provider | `src/providers/localization/LocalizationProvider.tsx` |
| Service | `src/lib/localization/` — LocalizationService class |
| Translation Files | `locales/en.json`, `locales/id.json` |
| Supported Locales | en, id (hardcoded in types.ts) |
| Reusable? | Partially — the service layer is reusable but the provider is tightly coupled |

### Email Module

| Aspect | Status |
|--------|--------|
| Schema | `email_provider`, `email_template`, `email_template_version`, `email_queue`, `email_log`, `email_preference` |
| API | `src/app/api/admin/email/` — full email management |
| Admin | 6 email sub-pages (providers, templates, queue, logs, health, statistics) |
| Modules | `src/modules/email/` — providers, templates |
| Reusable? | Yes — email infrastructure is reusable |

### Notification Module

| Aspect | Status |
|--------|--------|
| Schema | `notification_template`, `notification_template_version`, `notification_preference`, `notification`, `event_queue` |
| API | `src/app/api/notifications/`, `src/app/api/admin/notifications/` |
| Components | `NotificationCenter`, `NotificationsContent` |
| Reusable? | Yes — notification system is reusable |

### Key Observations

1. **Most modules expose reusable data** through API routes
2. **Many modules already have APIs** — admin CRUD endpoints exist for most entities
3. **Synchronization opportunities** exist between business modules and landing page components (see Section 17)
4. **The subscription module** drives pricing display but data lives in landing_section.config JSONB
5. **The voucher module** is separate from the coupon admin API — potential overlap
6. **The AI providers module** is the most sophisticated with health checks, fallback, retry, and cost tracking
7. **The localization module** has a custom service but lacks database-driven content translations

---

## 7. Localization Review

### Current Localization System

The project does NOT use next-intl. It has a custom localization system:

- **Translation Files**: locales/en.json (93KB), locales/id.json (94KB)
- **Service**: src/lib/localization/ — LocalizationService class
- **Provider**: src/providers/localization/LocalizationProvider.tsx — React context
- **Hooks**: useLocalizationContext(), useLocale(), useLocalization()
- **Types**: SupportedLocale = 'en' | 'id' (hardcoded)
- **Fallback**: Falls back to English for missing keys
- **Detection Priority**: User preference > Cookie > Browser language > Fallback to English

### Translation Key Structure

The keys.ts file defines 800+ typed translation keys organized by category:
- common.* — 100+ common UI strings
- marketing.* — Marketing page strings
- landing.* — Landing page strings
- landingBuilder.* — Landing builder strings
- dmin.* — Admin panel strings
- email.* — Email management strings
- sectionList.*, sectionDrawer.*, ddSectionDialog.* — Landing builder strings
- livePreview.* — Preview strings

### Database Content Translations — Why They Fail

1. **No locale column on landing sections** — landing_section table has no locale field
2. **Config stored as JSONB** — section.config contains all content in the default locale only
3. **No translation table** — No landing_section_translation or similar table exists
4. **API returns single locale** — /api/landing/sections returns sections without locale filtering
5. **esolve() function** in LocalizationProvider only resolves dot-notation keys, not database content
6. **generateMetadata() in page.tsx** fetches SEO data from API but does not pass locale to the API
7. **The SEO API** (/api/landing/seo) uses cookie-based locale detection but does not query database translations

### Components That Ignore Locale

| Component | Issue |
|-----------|-------|
| Header.tsx | Navigation items are hardcoded in English |
| Footer.tsx | Footer links are data-driven but labels come from config |
| Hero.tsx | Uses 	() for labels but config content is locale-agnostic |
| PricingSection.tsx | Plan names and features come from config JSONB, not translations |
| FAQ.tsx | FAQ items come from config JSONB, not translations |
| LandingPageContent.tsx | No locale-aware rendering |
| LivePreview.tsx | Preview does not respect locale |

### Data That Should Stay in Translation Files

- All UI labels, buttons, navigation items
- All error messages and validation text
- All toast messages and notification text
- All form field labels and placeholders
- All admin panel labels
- All modal and dialog text

### Data That Should Move to Multilingual JSON

- Marketing page content (about, features, pricing descriptions)
- FAQ content (currently in config JSONB)
- Hero section content (currently in config JSONB)
- Footer links and labels
- CTA button text
- Social proof/testimonial content
- Pricing plan names and descriptions

### Recommended Localization Strategy

1. **Keep UI labels in translation files** (en.json, id.json)
2. **Move marketing content to database with locale columns** or multilingual JSON files
3. **Add locale column to landing_section** or create a separate translation table
4. **Implement locale-aware API endpoints** that filter by locale
5. **Add middleware for locale detection** (Next.js middleware)
6. **Support hreflang tags** for SEO
7. **Add locale switching** with cookie persistence
8. **Consider next-intl** for a more standardized approach, or continue with custom service

---

## 8. Landing Builder Review

### Current Capabilities

The Landing Builder is an admin panel feature that allows managing landing page sections:

- **CRUD Operations**: Create, read, update, delete landing sections
- **Drag & Drop**: Reorder sections using @dnd-kit
- **Live Preview**: Preview landing page in a side panel using iframe
- **Section Types**: 14 predefined types (hero, features, ai-platform, screenshots, realtime-stats, pricing, credit-packs, credit-calculator, credit-usage, testimonials, faq, cta, footer, custom-html, custom-section)
- **Configuration**: Each section has configurable config (JSONB) and styles (JSONB)
- **Visibility Control**: Toggle section visibility
- **Locking**: Lock sections to prevent accidental changes
- **Duplication**: Duplicate sections
- **Undo**: Delete undo with 5-second window
- **Auto-save**: Section drawer auto-saves after 800ms of inactivity

### Database Structure

- landing_section table with: id, sectionKey, title, description, component, type, visible, locked, order, config (jsonb), styles (jsonb), createdAt, updatedAt
- landing_media table with: id, sectionKey (FK), url, alt, type, order, createdAt
- **No locale column** — content is not multilingual
- **No versioning** — no history tracking
- **No publish workflow** — visible flag is the only state control
- **No draft status** — all sections are either visible or not

### Save Process

1. User edits section in SectionDrawer
2. Auto-save triggers after 800ms of inactivity
3. PATCH request to /api/landing/sections/{sectionKey}
4. Server updates the database
5. Client refreshes data via mutate()

### Preview Process

1. User clicks  Live Preview button
2. Opens a side panel with iframe
3. LivePreview.tsx fetches sections via useLandingSections()
4. Generates HTML string and sets it as iframe srcDoc
5. Preview is a static render — no interactivity

### Publish Process

- **No explicit publish process** — sections are published by setting isible=true
- The landingSection table has a isible boolean field
- There is no draft/published/archive state machine
- There is no publish date or scheduling

### Localization

- **No localization support** — all section content is stored in the default locale
- The config JSONB stores all text content without locale distinction
- The SectionDrawer has a TranslationKeyPicker component but it only picks translation keys, not actual translated content
- The esolve() function in LocalizationProvider can resolve dot-notation keys from translation files, but database content is not translated

### Drag & Drop

- Uses @dnd-kit/core with @dnd-kit/sortable
- DndContext + SortableContext + erticalListSortingStrategy
- Reorder API: PATCH to /api/landing/sections/reorder
- Locked sections cannot be dragged

### Versioning

- **No versioning** — no history tracking, no snapshots, no rollback capability
- The updatedAt timestamp is the only change tracking
- No audit log for section changes

### Can Landing Builder Evolve into Website CMS?

**Yes, with significant redesign:**

1. **Current state**: Landing Builder manages a single-page landing page with sections
2. **CMS evolution**: A CMS would need:
   - Multiple pages (not just one landing page)
   - Page templates and layouts
   - Reusable sections across pages
   - Draft/publish workflow
   - Version history
   - Localization support
   - Media management integration
   - SEO metadata per page
   - Navigation management
   - User roles and permissions for content editing

3. **Reusable parts**:
   - Section CRUD API pattern
   - Section type registry (SECTION_COMPONENTS)
   - Section renderer (enderLandingSections)
   - Drag-and-drop reordering
   - Config/styles JSONB pattern
   - Visibility/locking mechanism

4. **Parts that must be redesigned**:
   - Add locale support to sections
   - Add versioning system
   - Add publish workflow (draft → published → archived)
   - Add page-level organization (not just sections)
   - Add navigation management
   - Add SEO metadata per page
   - Add media library integration
   - Add role-based content editing permissions


---

## 9. Performance Review

### Bundle Size

- No bundle analysis has been performed
- Next.js 16 with Turbopack
- shadcn/ui components — tree-shakeable but many imported globally
- @dnd-kit — 4 packages for drag-and-drop
- recharts — significant bundle weight
- @base-ui/react — large UI primitives library

### Large Components

| Component | Lines | Concern |
|-----------|-------|---------|
| SectionDrawer.tsx | 602 | Too large — split into tabs |
| SectionList.tsx | 562 | Too large — inline SVGs |
| AdminLandingBuilderClient.tsx | 392 | Too large — CRUD, DnD, preview |
| Hero.tsx | 139 | Large for single section |
| Footer.tsx | 192 | Large — social icons inline |
| PricingSection.tsx | 194 | Large — plan rendering |
| FAQ.tsx | 115 | Moderate — hardcoded fallbacks |
| LandingPageContent.tsx | 57 | Moderate — orchestrator |
| AdminSidebar.tsx | 229 | Large — navigation |

### Client vs Server Components

- LandingPageContent.tsx is Client Component but could be Server Component
- generateMetadata() uses client-side fetch() — not ideal
- Many admin pages use use client unnecessarily

### Repeated Queries

- fetch(/api/landing/sections) called 3+ times across components
- fetch(/api/landing/seo) called 2 times
- fetch(/api/landing/currency) called 2 times
- fetch(/api/landing/pricing) called 2 times
- useLandingSections() used in 4+ components
- useLandingData() used in 4+ components

### Repeated Renders

- LandingPageContent re-renders on locale change
- PricingSection re-renders on currency change
- FAQ re-renders on accordion toggle

### Unused Code

- AnalyticsDashboard duplicated in analytics/ and dashboard/
- useLocalization() and useLocale() hooks appear redundant
- EXAMPLE_ANALYTICS_PAGE.tsx not used in production

### Caching

- No caching strategy for landing page data
- No ISR for marketing pages
- No CDN caching configuration


---

## 10. SEO Review

### Current SEO Implementation

The SEO is implemented in the root layout and the homepage:

1. Root Layout (src/app/layout.tsx):
   - Static metadata: title, description, keywords, icons, alternates (canonical), openGraph, twitter, robots
   - JSON-LD structured data (Organization schema)
   - Hardcoded values - not dynamic

2. Homepage (src/app/page.tsx):
   - Dynamic metadata via generateMetadata()
   - Fetches SEO data from /api/landing/seo API
   - Supports hreflang tags
   - Falls back to static defaults on error

3. SEO API (src/app/api/landing/seo/route.ts):
   - Returns title, description, keywords, image, URL, type, locale, hreflangs
   - Uses cookie-based locale detection
   - Falls back to English defaults

### SEO Elements Present

| Element | Status |
|---------|--------|
| Meta title | Partial - static in layout, dynamic on homepage |
| Meta description | Partial - static in layout, dynamic on homepage |
| Canonical URL | Yes - set in root layout |
| Open Graph | Yes - set in root layout and homepage |
| Twitter Card | Yes - summary large image |
| Robots | Yes - index: true, follow: true |
| JSON-LD Structured Data | Yes - Organization schema |
| hreflang tags | Partial - homepage only |
| Sitemap | No - not implemented |
| robots.txt | No - not implemented |
| Dynamic metadata per page | No - only homepage |
| Image alt text | Partial - some components |
| Semantic HTML | Partial - some sections |

### Can SEO Become Database-Driven?

Yes. The current architecture supports this:
1. landing_section table could store SEO metadata per section
2. A new page-level SEO table could store per-page metadata
3. The /api/landing/seo endpoint could query the database
4. Each marketing page could have its own SEO metadata
5. The generateMetadata() pattern could be extended to all pages

### SEO Gaps

- No sitemap.xml generation
- No robots.txt generation
- No per-page metadata (only homepage has dynamic SEO)
- No structured data for landing sections
- No schema.org markup for FAQ, Pricing, or other rich snippets
- No Open Graph images per page
- No canonical URL per marketing page
- No hreflang for non-homepage pages
- No automatic meta description generation from content


---

## 11. Technical Debt

### Dead Code

- src/app/test/page.tsx - Test page, not for production
- src/app/dashboard/page.tsx - Legacy dashboard, not used
- EXAMPLE_ANALYTICS_PAGE.tsx - Example page, not in production
- verify_admin_features.py - Python script, not part of app
- audit_admin.py - Python script, not part of app

### Unused Components

- AnalyticsDashboard in src/components/analytics/ - duplicated in dashboard/
- useLocalization() hook - redundant with useLocalizationContext()
- useLocale() hook - redundant with useLocalizationContext()
- TranslationKeyPicker - only used in SectionDrawer

### Duplicate Utilities

- toFooterLink() in Footer.tsx - not reusable, could be in utils
- escapeHtml() in LivePreview.tsx - not reusable, could be in utils
- generatePreviewHTML() in LivePreview.tsx - not reusable, could be in utils
- getTypeIcon() in LivePreview.tsx - duplicated with TYPE_ICONS in SectionList

### Duplicate Hooks

- useLandingSections() used in 4+ components
- useLandingData() used in 4+ components
- useLocalization() and useLocale() appear redundant with useLocalizationContext()

### Duplicate Types

- LandingSection type defined in both use-landing-sections.ts and SectionList.tsx

### Duplicate API Routes

- /api/landing/sections is very large (280 lines)
- /api/landing/sections/reorder could be a PATCH on the main route
- Admin billing/organizations/workspaces APIs use raw SQL instead of Drizzle ORM

### Duplicate CSS

- Gradient patterns duplicated across components
- Card styling duplicated across components
- Button styling patterns duplicated
- Form layouts duplicated between SectionDrawer and AddSectionDialog


---

## 12. Architecture Risks

### Critical Risks

1. Database Schema Drift: 42+ tables defined in Drizzle schema have no migrations. The database does not match the schema.

2. Raw SQL in Admin APIs: Admin billing, organizations, and workspaces APIs use raw SQL against tables that may not exist.

3. In-Memory Services: Three core services (job-store, ProvidersService, FeatureFlagsService) are entirely in-memory. Data is lost on restart.

4. No Localization in Database Content: Landing page sections store all content in JSONB without locale awareness.

5. No Publish Workflow: The Landing Builder has no draft/published/archive state machine. No versioning or history.

6. No Middleware: There is no Next.js middleware.ts for geo-detection, locale routing, or security headers.

7. No Sitemap or robots.txt: The site has no dynamic sitemap or robots.txt generation.

8. No Caching Strategy: Landing page data is fetched fresh on every request with no caching, CDN, or ISR.

9. ID Type Inconsistency: Analytics tables use serial/uuid while all other tables use text.

10. Missing Foreign Keys: Most tables lack foreign key constraints, risking data integrity.

### High Risks

11. Admin Panel Session Validation: The admin layout comment says skip session validation in development - security risk.

12. No Audit Fields: 40+ tables are missing createdBy and updatedBy fields.

13. No Soft Delete: Commerce tables lack soft delete, risking accidental data loss.

14. Component Duplication: AnalyticsDashboard exists in two directories.

15. No Bundle Analysis: No tooling to measure or optimize bundle size.

### Medium Risks

16. Hardcoded Strings: 100% of UI text is hardcoded in English across 40+ files.

17. No Type Safety for Translation Keys: The t() function accepts any string key.

18. No Rate Limiting on Public APIs: The landing API endpoints have no rate limiting.

19. No Error Boundaries: No React error boundaries for granular error handling.

20. No Testing Strategy: No comprehensive test coverage for landing builder or CMS features.


---

## 13. Recommended Refactor Order

### Phase 1: Foundation (Sprint CMS-01)

1. Fix database schema drift - create migrations for all 42+ missing tables
2. Replace raw SQL in admin APIs with Drizzle ORM
3. Migrate in-memory services to database-backed repositories
4. Add middleware.ts for geo-detection and security headers
5. Add createdBy/updatedBy audit fields to all major tables
6. Add soft delete pattern to commerce tables
7. Fix ID type inconsistency in analytics tables

### Phase 2: Localization (Sprint CMS-02)

8. Implement proper localization with next-intl or enhanced custom service
9. Add locale column to landing_section table
10. Create landing_section_translation table for multilingual content
11. Add middleware for locale detection and routing
12. Extract all hardcoded strings into translation files
13. Add hreflang tags to all marketing pages
14. Add locale-aware API endpoints
15. Add language switcher with proper persistence

### Phase 3: Landing Builder CMS (Sprint CMS-03)

16. Add publish workflow (draft -> published -> archived)
17. Add versioning system for landing sections
18. Add page-level organization (not just sections)
19. Add SEO metadata per page
20. Add navigation management
21. Add media library integration
22. Add role-based content editing permissions
23. Add scheduled publishing

### Phase 4: Website CMS (Sprint CMS-04)

24. Extend landing builder into full website CMS
25. Add page templates and layouts
26. Add reusable sections across pages
27. Add navigation menu management
28. Add footer management
29. Add blog/content management
30. Add SEO metadata per page
31. Add preview/draft/publish workflow for all pages

### Phase 5: Optimization (Sprint CMS-05)

32. Implement caching strategy (ISR, CDN, SWR)
33. Add bundle analysis and optimization
34. Convert unnecessary Client Components to Server Components
35. Deduplicate components and utilities
36. Add comprehensive test coverage
37. Add error boundaries
38. Optimize database queries with proper indexing

## 14. Migration Strategy

### 14.1 Database Migrations

The project currently has only 3 Drizzle migrations covering approximately 5 tables, while the schema defines 50+ tables. A phased migration strategy is required:

1. **Phase 1 — Schema Sync**: Generate a baseline migration from the current Drizzle schema using `drizzle-kit generate`. This will capture all existing table definitions. Review and edit the generated SQL to ensure correctness before applying.

2. **Phase 2 — Data Backfill**: For tables that already have data in the production database (auth users, landing sections, localization entries), write data migration scripts to populate the new schema without data loss. Use idempotent SQL scripts.

3. **Phase 3 — Index and Constraint Migration**: Add missing indexes, unique constraints, and foreign key constraints identified in the schema definitions. Apply these in a separate migration to avoid locking issues on large tables.

4. **Phase 4 — Validation**: Run checksum queries comparing row counts and critical field values between pre- and post-migration states. Automate this as a CI step.

### 14.2 Localization Migration

The custom localization system uses JSON files (`locales/en.json`, `locales/id.json`) rather than database-backed translations. To support per-locale landing content:

- Add a `locale` column to the `landing_section` table (already defined in schema but not yet migrated).
- Migrate existing `landing_section` rows to have a default locale value (e.g., `en`).
- Create a `localized_content` table or extend `landing_section` with locale-specific JSONB columns for section content.
- Update the `LocalizationService` to support database-backed locale overrides for landing sections.

### 14.3 Admin Panel Migration

- Migrate from raw SQL queries in API routes to Drizzle ORM queries for type safety.
- Add database-backed session validation (replace the current cookie-only approach with a sessions table).
- Implement the missing `GET /api/admin/audit-logs` endpoint using Drizzle queries against the `audit_logs` table.
- Add the missing `GET /api/admin/feature-flags` endpoint using Drizzle queries.

### 14.4 Infrastructure Migration

- Add `middleware.ts` at the project root for geo-detection and locale routing.
- Generate `robots.txt` and `sitemap.xml` routes.
- Add per-page metadata generation for all marketing pages.
- Configure `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` environment variables.

## 15. Estimated Impact

### 15.1 Risk Assessment

| Risk Area | Severity | Likelihood | Impact |
|-----------|----------|------------|--------|
| Missing DB migrations | Critical | Certain | Data loss or schema drift on deploy |
| No locale column in landing_section | High | Certain | Cannot serve localized landing content |
| In-memory services (job-store, ProvidersService, FeatureFlagsService) | High | Certain | State loss on restart, no multi-instance support |
| Admin APIs using raw SQL | Medium | Certain | Type errors, SQL injection risk |
| No session validation in admin panel | High | Certain | Unauthorized access to admin functions |
| No publish workflow in Landing Builder | Medium | Likely | Unreviewed content goes live |
| No versioning for landing sections | Medium | Likely | Cannot rollback content changes |
| No middleware for geo/locale routing | Medium | Likely | Poor SEO, incorrect locale detection |
| Missing SEO metadata per page | Medium | Certain | Poor search engine visibility |
| AnalyticsDashboard duplication | Low | Certain | Maintenance burden, inconsistency risk |

### 15.2 Effort Estimation

| Task | Estimated Effort | Priority |
|------|-----------------|----------|
| Generate and apply DB migrations | 2-3 days | Critical |
| Add locale support to landing sections | 3-5 days | High |
| Implement session validation for admin | 2-3 days | High |
| Migrate admin APIs to Drizzle ORM | 2-3 days | Medium |
| Add publish workflow to Landing Builder | 3-5 days | Medium |
| Add versioning to landing sections | 3-5 days | Medium |
| Implement middleware for geo/locale routing | 2-3 days | Medium |
| Add per-page SEO metadata | 1-2 days | Medium |
| Deduplicate AnalyticsDashboard | 0.5 days | Low |
| Add robots.txt and sitemap.xml | 0.5 days | Low |
| Add error boundaries | 1-2 days | Medium |
| Add comprehensive test coverage | 5-10 days | Medium |

### 15.3 Dependency Impact

No new dependencies are required for the migration strategy. All work uses existing libraries (Drizzle ORM, Next.js, shadcn/ui). The only potential addition is a migration tooling enhancement if `drizzle-kit` does not currently support the full schema generation needed.

## 16. Component Inventory

### 16.1 Landing Page Components

| Component | Path | Purpose |
|-----------|------|--------|
| Hero | `src/components/landing/Hero.tsx` | Landing page hero section with CTA |
| FAQ | `src/components/landing/FAQ.tsx` | Frequently asked questions section |
| PricingSection | `src/components/landing/PricingSection.tsx` | Pricing display with currency support |
| Footer | `src/components/landing/Footer.tsx` | Site footer |
| Header | `src/components/landing/Header.tsx` | Site header with navigation |
| LandingPageContent | `src/components/landing/LandingPageContent.tsx` | Orchestrates all landing sections |

### 16.2 Landing Builder Admin Components

| Component | Path | Purpose |
|-----------|------|--------|
| AdminLandingBuilderClient | `src/app/admin/(protected)/landing-builder/AdminLandingBuilderClient.tsx` | Client-side landing builder interface |
| SectionList | `src/components/admin/landing-builder/SectionList.tsx` | Displays list of landing sections |
| SectionDrawer | `src/components/admin/landing-builder/SectionDrawer.tsx` | Drawer for editing section properties |
| AddSectionDialog | `src/components/admin/landing-builder/AddSectionDialog.tsx` | Dialog for adding new sections |
| LivePreview | `src/components/admin/landing-builder/LivePreview.tsx` | Live preview of landing page |

### 16.3 Admin Panel Components

| Component | Path | Purpose |
|-----------|------|--------|
| AdminLayout | `src/app/admin/layout.tsx` | Admin panel layout with sidebar |
| Sidebar | `src/components/admin/sidebar.tsx` | Admin navigation sidebar |
| DashboardPage | `src/app/admin/(protected)/dashboard/page.tsx` | Admin dashboard overview |
| UsersPage | `src/app/admin/(protected)/users/page.tsx` | User management |
| SettingsPage | `src/app/admin/(protected)/settings/page.tsx` | Application settings |
| AuditLogsPage | `src/app/admin/(protected)/audit-logs/page.tsx` | Audit log viewer |

### 16.4 Marketing Page Components

| Page | Path | Purpose |
|------|------|--------|
| AboutPage | `src/app/(marketing)/about/page.tsx` | About page |
| BlogPage | `src/app/(marketing)/blog/page.tsx` | Blog listing |
| BlogPostPage | `src/app/(marketing)/blog/[slug]/page.tsx` | Individual blog post |
| CareersPage | `src/app/(marketing)/careers/page.tsx` | Careers page |
| ContactPage | `src/app/(marketing)/contact/page.tsx` | Contact page |
| CreditsPage | `src/app/(marketing)/credits/page.tsx` | Credits page |
| DocsPage | `src/app/(marketing)/docs/page.tsx` | Documentation page |
| FAQPage | `src/app/(marketing)/faq/page.tsx` | FAQ page |
| FeaturesPage | `src/app/(marketing)/features/page.tsx` | Features page |
| PricingPage | `src/app/(marketing)/pricing/page.tsx` | Pricing page |
| RegisterPage | `src/app/(marketing)/register/page.tsx` | Registration page |
| RoadmapPage | `src/app/(marketing)/roadmap/page.tsx` | Roadmap page |
| SupportPage | `src/app/(marketing)/support/page.tsx` | Support page |

### 16.5 Hooks

| Hook | Path | Purpose |
|------|------|--------|
| useLandingData | `src/hooks/use-landing-data.ts` | Fetches landing page data |
| useLandingSections | `src/hooks/use-landing-sections.ts` | Fetches landing sections |
| useLocalization | `src/hooks/useLocalization.ts` | Localization context hook |
| useLocale | `src/hooks/useLocale.ts` | Current locale hook |
| useCurrency | `src/hooks/useCurrency.ts` | Currency context hook |
| useWebSocket | `src/hooks/useWebSocket.ts` | WebSocket connection hook |

### 16.6 Services and Utilities

| Service/Utility | Path | Purpose |
|-----------------|------|--------|
| LocalizationService | `src/lib/localization/LocalizationService.ts` | Translation lookup and locale management |
| LocalizationProvider | `src/providers/localization/LocalizationProvider.tsx` | React context for localization |
| CurrencyFormatter | `src/lib/currency/formatter.ts` | Currency formatting utility |
| LandingSectionRenderer | `src/lib/landing-section-renderer.ts` | Renders landing sections by type |
| AuthModule | `src/lib/auth/` | Authentication utilities |
| SubscriptionModule | `src/lib/subscription/` | Subscription management |
| PricingModule | `src/lib/pricing/` | Pricing calculations |
| VoucherModule | `src/lib/voucher/` | Voucher/discount logic |

### 16.7 Duplicated Components

| Component | Locations |
|-----------|----------|
| AnalyticsDashboard | `src/components/analytics/` and `src/components/dashboard/` |

## 17. Synchronization Matrix

### 17.1 Schema-to-API Synchronization

| Schema Table | API Route | Sync Status |
|-------------|-----------|-------------|
| users | `/api/auth/*` | In sync (auth module) |
| landing_sections | `/api/landing/sections` | In sync |
| landing_seo | `/api/landing/seo` | In sync |
| landing_currency | `/api/landing/currency` | In sync |
| landing_pricing | `/api/landing/pricing` | In sync |
| landing_campaign | `/api/landing/campaign` | In sync |
| landing_subscription | `/api/landing/subscription` | In sync |
| localization_entries | No dedicated API | Out of sync — needs API |
| audit_logs | No dedicated API | Out of sync — needs API |
| feature_flags | No dedicated API | Out of sync — needs API |

### 17.2 Schema-to-Component Synchronization

| Schema Table | Component(s) | Sync Status |
|-------------|-------------|-------------|
| landing_sections | LandingPageContent, SectionList, SectionDrawer, LivePreview | In sync |
| landing_seo | No component | Out of sync — needs UI |
| landing_currency | PricingSection | Partial — currency formatting exists but no admin UI |
| landing_pricing | PricingSection | In sync |
| localization_entries | LocalizationProvider, useLocalization | In sync (file-based) |
| users | AdminLayout, Sidebar, UsersPage | In sync |

### 17.3 Locale Synchronization

| Locale Resource | File | Coverage |
|----------------|------|----------|
| English translations | `locales/en.json` | Full coverage (93KB) |
| Indonesian translations | `locales/id.json` | Full coverage (94KB) |
| Landing section content (DB) | `landing_section` table | No locale column — broken |
| Admin panel strings | Hardcoded in components | No locale support |

### 17.4 Middleware Synchronization

| Middleware Concern | Current State | Required State |
|-------------------|--------------|----------------|
| Auth session validation | Cookie-based only | Database-backed sessions with middleware |
| Geo-detection | Not implemented | `middleware.ts` with geo IP lookup |
| Locale routing | Not implemented | `middleware.ts` with locale prefix routing |
| Audit logging | Middleware exists but no DB persistence | Persist audit events to `audit_logs` table |

## 18. Localization Strategy

### 18.1 Current State

The project uses a custom localization system rather than `next-intl`. Key characteristics:

- **Translation files**: JSON files at `locales/en.json` (93KB) and `locales/id.json` (94KB)
- **Provider**: `LocalizationProvider` at `src/providers/localization/LocalizationProvider.tsx` provides React context
- **Service**: `LocalizationService` at `src/lib/localization/LocalizationService.ts` handles lookup logic
- **Hooks**: `useLocalization` and `useLocale` hooks consume the context
- **Constants**: `src/lib/localization/constants.ts` defines supported locales and defaults
- **Validation**: `src/lib/localization/validation.ts` validates locale codes and translation keys
- **Business logic**: `src/lib/localization/business.ts` handles locale-specific business rules

### 18.2 Gaps in Current Localization

1. **No database-backed translations for landing content**: The `landing_section` table has no locale column, so section content cannot be translated per locale.
2. **No admin UI for translation management**: There is no interface for admins to edit or add translations.
3. **No fallback locale chain**: If a key is missing in `id.json`, there is no automatic fallback to `en.json`.
4. **No pluralization support**: The custom system does not handle plural forms, which is critical for Indonesian and English.
5. **No interpolation/variable substitution**: Dynamic values in translations are not supported.
6. **Hardcoded locale files**: Adding a new locale requires creating a new JSON file and restarting the application.
7. **No namespace/scoping**: All translations are in a flat structure, making it difficult to manage as the application grows.

### 18.3 Recommended Localization Strategy

1. **Retain the custom system** for static UI translations (buttons, labels, navigation) since it works well for a small number of locales.
2. **Add database-backed translations** for dynamic content (landing sections, marketing page content) using a `localized_content` table or locale columns on existing tables.
3. **Implement a fallback chain**: When a translation key is missing in the active locale, fall back to English (`en`) before showing the key itself.
4. **Add interpolation support**: Allow `{{variable}}` placeholders in translation strings, resolved at render time.
5. **Add pluralization rules**: Implement locale-aware pluralization (English: singular/plural; Indonesian: no plural distinction).
6. **Create an admin translation editor**: A simple UI in the admin panel for managing translations per locale.
7. **Consider next-intl for future scaling**: If the project grows beyond 3-4 locales or requires ICU message format, migrate to `next-intl`.

### 18.4 Localization Architecture Diagram

```
Locale Request
    |
    v
+------------------+
| Middleware       |  <- Detects locale from URL prefix / Accept-Language header
| (geo + locale)   |
+------------------+
    |
    v
+------------------+
| LocalizationProvider (React Context) |
+------------------+
    |
    +---> Static translations (JSON files: en.json, id.json)
    |
    +---> Dynamic translations (DB: landing_section.locale_content)
    |
    +---> Fallback chain: active locale -> en -> key as last resort
```

## 19. Website CMS Proposal

### 19.1 Vision

The Tamer Studio project should evolve from a static marketing site with a basic landing page builder into a full Website CMS that supports:

- Multi-page content management (marketing pages, blog, docs)
- Per-locale content with a proper localization workflow
- A publish workflow with draft/review/live states
- Version history and rollback capability for all content
- Role-based content editing permissions
- SEO metadata management per page
- Media asset management for images and documents

### 19.2 Current Landing Builder as CMS Foundation

The existing Landing Builder (`AdminLandingBuilderClient`) provides a foundation that can be extended into a full CMS:

| Current Capability | CMS Extension Needed |
|-------------------|---------------------|
| Section-based layout | Extend to full page composition with sections, headers, footers, and sidebars |
| Live preview | Add draft preview with device emulation (mobile, tablet, desktop) |
| Section ordering (drag-and-drop) | Add section type library with drag-from-palette |
| No publish workflow | Add draft/scheduled/published states with approval workflow |
| No versioning | Add version history with diff view and rollback |
| No locale support | Add locale tabs and per-locale content editing |
| No media library | Add media upload and asset management |
| No SEO controls | Add per-page SEO metadata editor (title, description, OG tags) |

### 19.3 Proposed CMS Architecture

```
CMS Layer
=========
|
+-- Content Types
|   +-- LandingPage (composed of sections)
|   +-- MarketingPage (about, blog, careers, etc.)
|   +-- BlogPost (with author, tags, featured image)
|   +-- Product/PricingPage
|   +-- LegalPage (terms, privacy, credits)
|
+-- Content Fields
|   +-- title, slug, description
|   +-- body (rich text or section-based)
|   +-- seo (title, description, OG image)
|   +-- status (draft, review, published, archived)
|   +-- publishedAt, scheduledAt
|   +-- locale
|
+-- Versioning
|   +-- content_versions table (snapshot of content at publish time)
|   +-- diff between versions
|   +-- rollback to any previous version
|
+-- Workflow
|   +-- draft -> review -> published
|   +-- scheduled publishing
|   +-- unpublish capability
|
+-- Media
    +-- media_library table (images, documents, videos)
    +-- CDN integration for asset delivery
```

### 19.4 CMS Implementation Phases

**Phase 1 — Foundation** (Weeks 1-4)
- Add `pages` table to schema with content type, locale, status, and version fields
- Add `media_library` table for asset management
- Add `content_versions` table for versioning
- Generate and apply database migrations
- Create admin API routes for CRUD on pages and media

**Phase 2 — Editor** (Weeks 5-8)
- Extend Landing Builder to support full page editing (not just sections)
- Add draft/review/published status workflow
- Add version history UI with diff view
- Add locale tabs for multi-locale content editing
- Add SEO metadata editor

**Phase 3 — Publishing** (Weeks 9-12)
- Implement scheduled publishing
- Add approval workflow (editor submits, admin approves)
- Add rollback capability
- Add media upload and asset library UI
- Add per-page robots meta and sitemap generation

**Phase 4 — Polish** (Weeks 13-16)
- Add role-based permissions for content editors
- Add preview mode with device emulation
- Add analytics integration for page performance
- Add CDN integration for media assets
- Add comprehensive test coverage for CMS features

### 19.5 CMS vs. Current State

| Aspect | Current State | CMS Target State |
|--------|--------------|------------------|
| Content editing | Landing Builder only (sections) | Full page editor with sections, text, media |
| Localization | JSON files, no DB locale column | DB-backed per-locale content with admin UI |
| Publish workflow | None (content is live immediately) | Draft -> Review -> Published with scheduling |
| Versioning | None | Full version history with rollback |
| SEO | No per-page metadata | Per-page SEO editor with preview |
| Media | No asset management | Media library with upload, CDN delivery |
| Roles | Admin only | Admin, Editor, Viewer roles |
| Pages | Static marketing pages | Dynamic CMS-managed pages |

### 19.6 Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| CMS scope creep | Strict phase boundaries, prioritize core content management first |
| Performance degradation with many pages | Implement caching layer (Redis or in-memory), pagination on listing endpoints |
| Data migration from existing landing sections | Write migration scripts that map current landing sections to the new pages content model |
| Editor UX complexity | Start with simple section-based editing, add rich text later |
| Locale management complexity | Start with 2 locales (en, id), expand as needed |

---

*End of Architecture Audit Report — Sprint CMS-00*
*Generated: 2026-07-27*
*Status: Analysis Only — No Code Changes*
