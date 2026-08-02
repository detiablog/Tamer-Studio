# Bootstrap Audit — INSTALL-AUDIT-01

> Generated: 2026-08-03
> Source: `src/` (Single Source of Truth)

---

## Executive Summary

Tamer Studio has **4 bootstrap modules** forming a layered initialization system:

1. **Foundation Bootstrap** — Application lifecycle + IoC container
2. **Event Runtime Bootstrap** — Event hub + subscribers
3. **Navigation Bootstrap** — Navigation item registration
4. **Commerce Bootstrap** — Commerce plan seeding (idempotent)

These modules are independent, well-separated, and follow singleton/idempotent patterns. They can be **reused directly** by an installation wizard.

---

## 1. Foundation Bootstrap

**File:** `src/core/foundation/bootstrap.ts` (16 lines)
**Supporting Files:**
- `src/core/foundation/lifecycle.ts` (35 lines)
- `src/core/foundation/registry.ts` (57 lines)
- `src/core/foundation/container.ts` (139 lines)

### Purpose
Orchestrates application lifecycle through 5 phases: `bootstrap → configure → initialize → ready → shutdown`.

### Execution Order
1. `lifecycle.transition("bootstrap")` — Phase 1
2. `initializeServices()` — Registers 27 singleton services via IoC container
3. `lifecycle.transition("configure")` — Phase 2
4. `lifecycle.transition("initialize")` — Phase 3
5. `lifecycle.transition("ready")` — Phase 4

### Dependencies
- `ApplicationLifecycle` singleton (5-phase state machine)
- `ServiceRegistry` (static facade over IoC container)
- `container` (IoC container: singleton/scoped/transient scopes)
- 27 service modules loaded via lazy `require()` factories

### Services Registered (27 total)
| Category | Services |
|----------|----------|
| Core | container, lifecycle, eventBus |
| Domain | identity, userService, workspaceService, roleService, permissionService, membershipService, apiKeyService, rbacService |
| Support | ticketService, supportService, knowledgeService, feedbackService, customerService, slaService, attachmentService, internalNoteService |
| Admin | adminDashboardService, adminSystemService, adminSettingsService, adminModerationService, adminProvidersService, adminOperationsService, adminFeatureFlagsService, adminMaintenanceService |

### Current Usage
- Called at application startup (Next.js server initialization)
- All 27 services available via `ServiceRegistry.get<T>(name)`

### Reuse Assessment
| Verdict | Reason |
|---------|--------|
| **REUSE** | Well-structured lifecycle with clear phases. IoC container supports test overrides. Services use lazy loading. No changes needed. |

### Improvement Opportunities
- `initializeServices()` uses `require()` (CommonJS dynamic import) — consider `import()` for ESM compatibility
- No error handling per-service registration failure
- No startup ordering dependencies between services

---

## 2. Event Runtime Bootstrap

**File:** `src/lib/bootstrap.ts` (24 lines)
**Supporting File:** `src/core/events/event-hub.ts` (74 lines)

### Purpose
Initializes the EventHub singleton with 3 subscribers:
1. **CacheInvalidationSubscriber** — Cache invalidation on events
2. **AuditLogSubscriber** — Audit logging
3. **NotificationSubscriber** — Notification dispatch

Also sets up in-memory `EventLog` for all events.

### Execution Order
1. Guard: Skip if already initialized (`isEventHubInitialized()`)
2. Guard: Deduplicate concurrent calls (`bootstrapPromise`)
3. Call `initializeEventHub()` — registers 3 subscribers

### Dependencies
- `eventBus` (EventBus singleton)
- 3 subscriber modules (cache-invalidation, audit-log, notification)

### Current Usage
- Called separately from foundation bootstrap
- Used for server-side event processing

### Reuse Assessment
| Verdict | Reason |
|---------|--------|
| **REUSE** | Clean idempotent initialization. Guard prevents double-init. Teardown supported. No changes needed. |

---

## 3. Navigation Bootstrap

**File:** `src/core/navigation/navigation-bootstrap.ts` (671 lines)
**Supporting Files:**
- `src/core/navigation/navigation-runtime.ts` (279 lines)
- `src/core/navigation/navigation.types.ts` (277 lines)

### Purpose
Registers all navigation items for the application:
- **21 sidebar items** (Dashboard, Workspace, Projects, Media, Production, AI, Workflows, Story, Calendar, Publishing, Trends, Optimizer, Memory, Settings, Billing, Credits, Assets, Storage, Analytics, Referral, Affiliate, Developer)
- **20 admin sidebar items** (Admin Dashboard, Users, Workspaces, Projects, Workflows, AI Providers, Landing Builder, Jobs, Queues, Billing, Subscriptions, Pricing, Coupons, Analytics, Audit Logs, Feature Flags, Settings, Email, Publishing, Story Engine, Memory)
- **4 header items** (Notifications, Profile, Search, Help)
- **5 footer items** (Home, About, Contact, Privacy, Terms)

### Execution Order
1. Guard: Skip if already bootstrapped (`bootstrapped` flag)
2. Get `NavigationRuntime` singleton
3. Register sidebar items (21)
4. Register admin sidebar items (20)
5. Register header items (4)
6. Register footer items (5)

### Dependencies
- `NavigationRuntime` singleton (in-memory navigation system)
- No database dependencies
- Localization keys via `titleKey` fields

### Current Usage
- Called at application startup
- Powers sidebar, header, footer rendering
- Supports permission-based visibility filtering
- Generates breadcrumbs automatically

### Reuse Assessment
| Verdict | Reason |
|---------|--------|
| **REUSE** | Complete navigation definition. In-memory runtime supports permission filtering. No changes needed for installer. |

### Improvement Opportunities
- Items have hardcoded English titles alongside `titleKey` localization keys — should rely only on localization keys
- Some `order` values are duplicated (e.g., publishing=8, settings=8)

---

## 4. Commerce Bootstrap (Seed)

**File:** `src/core/commerce/seed.ts` (205 lines)

### Purpose
Seeds commerce plans, billing options, and pricing tiers idempotently.

### Data Seeded
| Type | Items |
|------|-------|
| Plans | Lite (tier 1), Creator (tier 2), Pro (tier 3) |
| Billing Options | Monthly, Yearly, One-Time |
| Pricing | 6 combinations (3 plans × 2 billing options) |

### Execution Order
1. Check if plans exist → if not, create 3 plans
2. Check if billing options exist → if not, create 3 options
3. For each plan × billing combination → create pricing if missing

### Dependencies
- `commerce.repository.ts` (findAllPlans, findAllBillingOptions, createPlan, createBillingOption, createPricing, findPricingByPlanId)
- No external dependencies

### Current Usage
- Called via `ensureSeeded()` — idempotent, promise-deduplicated
- Called from commerce-related API routes

### Reuse Assessment
| Verdict | Reason |
|---------|--------|
| **REUSE** | Already idempotent. Uses repository pattern. Can be called during installation without modification. |

---

## 5. Cron Setup

**File:** `src/core/jobs/cron-setup.ts` (105 lines)

### Purpose
Schedules recurring background jobs:
- **Daily metrics aggregation** — 1:00 AM UTC
- **Hourly health check** — every hour

### Reuse Assessment
| Verdict | Reason |
|---------|--------|
| **REUSE** | Self-contained cron setup. Can be optionally started during installation for production deployments. |

---

## Bootstrap Dependency Graph

```
Application Start
├── Foundation Bootstrap (bootstrap.ts)
│   ├── lifecycle.transition("bootstrap")
│   ├── initializeServices() → 27 services registered
│   ├── lifecycle.transition("configure")
│   ├── lifecycle.transition("initialize")
│   └── lifecycle.transition("ready")
├── Event Runtime Bootstrap (lib/bootstrap.ts)
│   └── initializeEventHub() → 3 subscribers
├── Navigation Bootstrap (navigation-bootstrap.ts)
│   └── bootstrapNavigation() → 50 items registered
└── Cron Setup (cron-setup.ts) [optional]
    └── setupMetricsCronJobs() → 2 scheduled jobs
```

---

## Recommendations

| Module | Action | Priority |
|--------|--------|----------|
| Foundation Bootstrap | **KEEP** — Well-structured, reusable | N/A |
| Event Runtime Bootstrap | **KEEP** — Idempotent, clean | N/A |
| Navigation Bootstrap | **KEEP** — Complete navigation definition | N/A |
| Commerce Seed | **KEEP** — Already idempotent | N/A |
| All Bootstrap Modules | **REUSE** in installation wizard | High |
