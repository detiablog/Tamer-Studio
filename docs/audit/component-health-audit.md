# Component Health Audit

**Date:** 2026-08-03
**Scope:** All UI components in `src/components/`

---

## Component Inventory

### `ui/` — Shared UI Primitives (42 files)

| Component | Type | Notes |
|-----------|------|-------|
| `accordion.tsx` | shadcn | Standard |
| `alert.tsx` | shadcn | Standard |
| `button.tsx` | shadcn | Standard |
| `card.tsx` | shadcn | Standard |
| `checkbox.tsx` | shadcn | Standard |
| `dialog.tsx` | shadcn | Standard |
| `input.tsx` | shadcn | Standard |
| `label.tsx` | shadcn | Standard |
| `progress.tsx` | shadcn | Standard |
| `select.tsx` | shadcn | Standard |
| `separator.tsx` | shadcn | Standard |
| `skeleton.tsx` | shadcn | Standard |
| `skeleton-card.tsx` | Custom | Overlaps with skeleton.tsx |
| `sonner.tsx` | shadcn | Standard |
| `switch.tsx` | shadcn | Standard |
| `tabs.tsx` | shadcn | Standard |
| `textarea.tsx` | shadcn | Standard |
| `tooltip.tsx` | shadcn | Standard |
| `Sheet.tsx` | shadcn | Capitalized (inconsistent) |
| `AppShell.tsx` | Custom | App layout shell |
| `Avatar.tsx` | Custom | User avatar |
| `AvatarDropdown.tsx` | Custom | Avatar with dropdown |
| `Badge.tsx` | Custom | Status badges |
| `Breadcrumb.tsx` | Custom | Breadcrumb navigation |
| `ActionButton.tsx` | Custom | Action button wrapper |
| `CommandPalette.tsx` | Custom | Cmd+K command palette |
| `DashboardCard.tsx` | Custom | Dashboard card wrapper |
| `ElegantLoader.tsx` | Custom | Loading spinner |
| `EmptyState.tsx` | Custom | Empty state placeholder |
| `LanguageSwitcher.tsx` | Custom | Language toggle |
| `MobileNav.tsx` | Custom | Mobile navigation |
| `NotificationCenter.tsx` | Custom | Notification bell |
| `PageContainer.tsx` | Custom | Page wrapper |
| `PageHeader.tsx` | Custom | Page header |
| `PageLayout.tsx` | Custom | Page layout |
| `SearchInput.tsx` | Custom | Search input |
| `SectionHeader.tsx` | Custom | Section header |
| `Sidebar.tsx` | Custom | Sidebar navigation |
| `SidebarItem.tsx` | Custom | Sidebar item |
| `StatCard.tsx` | Custom | Statistics card |
| `Topbar.tsx` | Custom | Top navigation bar |
| `WorkspaceSwitcher.tsx` | Custom | Workspace selector |
| `states/Error.tsx` | Custom | Error state |
| `states/Loading.tsx` | Custom | Loading state |

### `landing/` — Landing Page Components (26 files)

| Component | Complexity |
|-----------|------------|
| `Hero.tsx` | High — main hero section |
| `Features.tsx` | High — feature showcase |
| `PricingSection.tsx` | High — pricing table |
| `FAQ.tsx` | Medium — accordion FAQ |
| `Footer.tsx` | Medium — site footer |
| `Header.tsx` | Medium — site header |
| `Testimonials.tsx` | Medium — testimonials carousel |
| `LandingPageContent.tsx` | High — page orchestrator |
| `AIPlatform.tsx` | Medium — AI platform section |
| `AnnouncementBar.tsx` | Low — announcement banner |
| `BlogPreview.tsx` | Low — blog preview |
| `CampaignBanner.tsx` | Low — campaign banner |
| `CountdownTimer.tsx` | Low — countdown |
| `CreditCalculator.tsx` | Medium — calculator |
| `CreditPacks.tsx` | Medium — credit packs |
| `CreditUsageTable.tsx` | Low — usage table |
| `CTASection.tsx` | Low — CTA button |
| `DownloadApp.tsx` | Low — download section |
| `LandingKeyboardShortcuts.tsx` | Low — keyboard shortcuts |
| `NewsletterSection.tsx` | Low — newsletter form |
| `PartnerLogos.tsx` | Low — partner logos |
| `RealtimeStats.tsx` | Low — live stats |
| `RoadmapSection.tsx` | Low — roadmap |
| `Screenshots.tsx` | Low — screenshots |
| `SocialProof.tsx` | Low — social proof |
| `index.ts` | Barrel |

### `dashboard/` — Dashboard Components (12 files)

| Component | Complexity |
|-----------|------------|
| `DashboardShell.tsx` | High — dashboard layout |
| `DashboardHero.tsx` | Medium — hero section |
| `AnalyticsDashboard.tsx` | High — analytics charts |
| `AnalyticsPanel.tsx` | Medium — analytics panel |
| `AuditLogs.tsx` | Medium — audit log viewer |
| `ChartComponents.tsx` | High — chart primitives |
| `DashboardSkeleton.tsx` | Low — loading skeleton |
| `ErrorState.tsx` | Low — error display |
| `HealthPanel.tsx` | Medium — health status |
| `NotificationsContent.tsx` | Medium — notifications |
| `StatisticsCards.tsx` | Medium — stats cards |
| `index.ts` | Barrel |

### `admin/` — Admin Components (9 files)

| Component | Complexity |
|-----------|------------|
| `AdminShell.tsx` | High — admin layout |
| `AdminSidebar.tsx` | High — admin navigation |
| `AdminTopbar.tsx` | Medium — admin topbar |
| `AdminDataTable.tsx` | High — data table |
| `AdminAvatarDropdown.tsx` | Low — avatar dropdown |
| `AdminLoginForm.tsx` | Medium — login form |
| `Breadcrumbs.tsx` | Low — breadcrumbs |
| `TranslationKeyPicker.tsx` | Medium — translation picker |
| `index.ts` | Barrel |

### Other Directories

| Directory | Files | Components |
|-----------|-------|------------|
| `ai/` | 3 | AIProviderCard, PromptTemplateCard |
| `analytics/` | 2 | AnalyticsDashboard |
| `auth/` | 6 | PermissionGuard, RoleGuard, hooks |
| `email/` | 2 | EmailBuilder, HtmlEditor |
| `homepage/` | 2 | HomepageRuntimeContent |
| `media/` | 1 | MediaUpload |
| `onboarding/` | 1 | OnboardingProvider |
| `production/` | 3 | CollaborativeProductionEditor, ProductionCard |
| `project/` | 3 | ProjectCard, ProjectDetail |
| `providers/` | 4 | ThemeProvider, EventHubProvider, HtmlLangUpdater |
| `pwa/` | 3 | PushNotificationBanner, PWAInstallPrompt, ServiceWorkerRegistration |
| `search/` | 1 | SearchCommand |
| `workspace/` | 4 | WorkspaceCard, WorkspaceDetail, WorkspaceEditForm |

---

## Duplicate Components

| Duplicate A | Duplicate B | Overlap |
|-------------|-------------|---------|
| `ui/skeleton.tsx` | `ui/skeleton-card.tsx` | Skeleton variants |
| `ui/DashboardCard.tsx` | `ui/card.tsx` | Dashboard-specific card |
| `dashboard/AnalyticsDashboard.tsx` | `analytics/AnalyticsDashboard.tsx` | Two analytics dashboards |
| `components/auth/` | `features/auth/components/` | Auth components in two locations |
| `components/ui/PageLayout.tsx` | `components/dashboard/DashboardShell.tsx` | Layout overlap |

---

## Component Architecture Issues

### 1. Mixed Component/Hook Ownership
`components/auth/` contains both components (`PermissionGuard`, `RoleGuard`) and hooks (`use-permissions.ts`, `use-admin-permissions.ts`). Hooks should live in `hooks/` or `features/auth/hooks/`.

### 2. Landing Components Are Too Numerous
26 components for a single landing page is excessive. Many are simple sections that could be data-driven from the CMS.

### 3. No Design System Index
There's no central export of the design system. `ui/` has individual exports but no unified barrel.

### 4. Provider Split
Providers live in two locations:
- `src/providers/` — CurrencyProvider, LocalizationProvider
- `src/components/providers/` — ThemeProvider, EventHubProvider, HtmlLangUpdater

### 5. Client/Server Boundary
Most dashboard components are client components (implicit `"use client"`). The project uses `page.tsx` (server) + `pageClient.tsx` (client) pattern correctly.

---

## Score

| Dimension | Score |
|-----------|-------|
| Component organization | 6/10 |
| Component reusability | 5/10 |
| Design system consistency | 5/10 |
| Duplicate detection | 4/10 |
| **Overall** | **5/10** |
