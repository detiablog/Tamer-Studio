# Documentation Architecture Recommendation

Generated: 2026-08-02
Purpose: Final recommendation for Tamer Studio documentation architecture
Status: Ready for approval before DOC-02 execution

---

## Documentation Health Score

| Criterion | Current | Proposed | Notes |
|-----------|---------|----------|-------|
| Architecture | 3/10 | 9/10 | Current: 150 root files, 409 loose docs. Proposed: 15 domain groups |
| Maintainability | 4/10 | 8/10 | Current: scattered, duplicated. Proposed: centralized per domain |
| Scalability | 3/10 | 9/10 | Current: every sprint adds chaos. Proposed: clear growth pattern |
| Consistency | 4/10 | 9/10 | Current: mixed naming, mixed structure. Proposed: uniform format |
| Discoverability | 3/10 | 9/10 | Current: 3-5 clicks, many dead ends. Proposed: max 3 clicks |
| Duplication Risk | 2/10 | 9/10 | Current: 15 duplicate clusters. Proposed: one-topic-one-location |
| Navigation | 3/10 | 9/10 | Current: no clear entry points. Proposed: domain-based navigation |
| Long-Term Maintainability | 3/10 | 8/10 | Current: degrades with each sprint. Proposed: self-maintaining |
| **Overall** | **3/10** | **9/10** | Major improvement in all dimensions |

---

## 1. Recommended Folder Structure

```
docs/
├── README.md                              # Documentation portal
├── documentation-policy.md                # Permanent governance rules
│
├── domains/                               # Product documentation (15 groups)
│   ├── foundation/                        # Core infrastructure
│   │   ├── README.md                      # Overview + navigation
│   │   ├── container-and-di.md            # DI container, service registry
│   │   ├── lifecycle.md                   # Bootstrap, shutdown, lifecycle
│   │   ├── configuration.md               # Config, env, feature flags
│   │   ├── logging.md                     # Logger
│   │   ├── errors.md                      # Error types & handler
│   │   ├── events.md                      # Event bus, pub-sub, async events
│   │   └── cache.md                       # Memory cache, Redis cache
│   │
│   ├── identity/                          # Identity & access
│   │   ├── README.md                      # Overview + navigation
│   │   ├── authentication.md              # Better Auth, sessions, TOTP
│   │   ├── authorization.md               # RBAC, permissions, guards
│   │   ├── users.md                       # User CRUD, profiles
│   │   ├── workspace.md                   # Workspaces, membership
│   │   ├── api-keys.md                    # API key management
│   │   └── audit-trail.md                 # Audit logging
│   │
│   ├── security/                          # Security (2-layer)
│   │   ├── README.md                      # Overview + navigation
│   │   ├── primitives.md                  # Headers, CSRF, crypto, rate limiting
│   │   ├── operations.md                  # Threat detection, incidents, compliance
│   │   └── admin-security.md              # Admin moderation, maintenance
│   │
│   ├── platform/                          # Platform operations
│   │   ├── README.md                      # Overview + navigation
│   │   ├── middleware.md                   # Auth, CSRF, rate-limit, audit middleware
│   │   ├── observability.md               # Metrics, logging, tracing, alerts
│   │   ├── monitoring.md                  # Health checks, system metrics
│   │   ├── operations.md                  # Deployment, maintenance, reports
│   │   ├── scaling.md                     # Performance, capacity, load testing
│   │   ├── sla.md                         # SLA policies & violations
│   │   └── websocket.md                   # Real-time communication
│   │
│   ├── ai/                                # AI system
│   │   ├── README.md                      # Overview + navigation
│   │   ├── core.md                        # AI runtime, provider routing
│   │   ├── gateway.md                     # Model registry, health, routing
│   │   ├── creative-memory.md             # Brand profiles, preferences, memories
│   │   ├── learning-engine.md             # Learning events, patterns
│   │   └── prompt-intelligence.md         # Prompt library, optimizer, templates
│   │
│   ├── cms/                               # Content management
│   │   ├── README.md                      # Overview + navigation
│   │   ├── core.md                        # CMSService, pages, sections, blocks
│   │   ├── navigation.md                  # Menus, breadcrumbs, routing
│   │   ├── homepage.md                    # Homepage composition engine
│   │   ├── landing.md                     # Landing page builder
│   │   ├── seo.md                         # Metadata, OpenGraph, schema, sitemap
│   │   ├── localization.md                # Regions, currencies, translations
│   │   ├── media.md                       # Media library, upload, storage
│   │   └── publishing.md                  # Social media publishing
│   │
│   ├── billing/                           # Billing & commerce
│   │   ├── README.md                      # Overview + navigation
│   │   ├── orchestrator.md                # Billing engine (wallet, usage, cost)
│   │   ├── commerce.md                    # Plans, pricing, checkout, orders
│   │   ├── payment.md                     # Stripe gateway, iPaymu, manual transfer
│   │   ├── wallet.md                      # Credit wallet
│   │   └── subscription.md               # Plans, subscriptions, invoices
│   │
│   ├── communications/                    # Notifications & messaging
│   │   ├── README.md                      # Overview + navigation
│   │   ├── dispatcher.md                  # Multi-channel notification dispatch
│   │   ├── email.md                       # Provider management, templates, queues
│   │   ├── sms.md                         # SMS sending (provider-agnostic)
│   │   ├── push.md                        # Push notifications
│   │   ├── inbox.md                       # In-app notification storage
│   │   └── preferences.md                 # User notification preferences
│   │
│   ├── admin/                             # Admin panel
│   │   ├── README.md                      # Overview + navigation
│   │   ├── dashboard.md                   # Admin dashboard
│   │   ├── system.md                      # System management
│   │   ├── settings.md                    # Admin settings
│   │   ├── moderation.md                  # Content moderation
│   │   ├── providers.md                   # Provider management
│   │   ├── feature-flags.md              # Feature flag management
│   │   └── maintenance.md                # Maintenance mode
│   │
│   ├── support/                           # Support & customer service
│   │   ├── README.md                      # Overview + navigation
│   │   ├── tickets.md                     # Ticket management
│   │   ├── feedback.md                    # User feedback
│   │   ├── knowledge.md                   # Knowledge base
│   │   └── customer.md                    # Customer management
│   │
│   ├── studios/                           # Creative studios
│   │   ├── README.md                      # Overview + navigation
│   │   ├── image-studio.md               # Image generation
│   │   ├── video-studio.md               # Video generation
│   │   ├── drama-studio.md               # Drama/storytelling
│   │   ├── story-engine.md               # Story creation
│   │   ├── project-studio.md             # Project management
│   │   ├── production.md                 # Production management
│   │   ├── media.md                      # Media management
│   │   └── affiliate-studio.md           # Affiliate marketing
│   │
│   ├── analytics/                         # Analytics & intelligence
│   │   ├── README.md                      # Overview + navigation
│   │   ├── analytics.md                   # Analytics engine
│   │   ├── bi.md                          # Business intelligence
│   │   ├── product-intelligence.md        # Product intelligence
│   │   ├── trend-analyzer.md             # Trend analysis
│   │   ├── conversion-optimizer.md       # Conversion optimization
│   │   └── asset-intelligence.md         # Asset intelligence
│   │
│   ├── automation/                        # Automation & quality
│   │   ├── README.md                      # Overview + navigation
│   │   ├── automation.md                  # Rule engine, scheduling, queue
│   │   ├── orchestrator.md               # Intent analysis, pipeline building
│   │   ├── quality-assurance.md          # Validation, scoring, recovery
│   │   └── workflow.md                   # Workflow management
│   │
│   ├── storage/                           # Storage & assets
│   │   ├── README.md                      # Overview + navigation
│   │   ├── storage-engine.md             # High-level storage (files, quotas)
│   │   └── assets.md                     # Low-level storage (Local, R2, S3)
│   │
│   └── misc/                              # Miscellaneous
│       ├── README.md                      # Overview + navigation
│       ├── api-platform.md               # API platform, key middleware
│       ├── calendar.md                   # Calendar management
│       ├── campaign.md                   # Campaign management
│       ├── beta-program.md              # Beta program
│       ├── jobs.md                       # Job management
│       └── templates.md                  # Templates management
│
├── architecture/                          # System-wide architecture
│   ├── README.md                          # Architecture overview
│   ├── system-overview.md                # Full system architecture
│   ├── database.md                       # Database architecture
│   ├── api.md                            # API architecture
│   ├── frontend.md                       # Frontend architecture
│   ├── ai-layer.md                       # AI architecture
│   ├── domain-dependency-map.md          # Module dependencies
│   └── domain-relationship-matrix.md     # Cross-domain relationships
│
├── standards/                             # Coding standards
│   ├── README.md                          # Standards overview
│   ├── application-layer.md             # API route standards
│   ├── infrastructure.md               # Infrastructure standards
│   ├── api-guidelines.md               # API design guidelines
│   ├── commit-convention.md            # Git commit conventions
│   ├── database-guidelines.md          # Database design guidelines
│   ├── design-patterns.md             # Design pattern catalog
│   ├── testing-guidelines.md          # Testing standards
│   ├── git-workflow.md                # Git workflow
│   └── engineering-playbook.md        # Engineering playbook
│
├── adr/                                   # Architecture Decision Records
│   ├── README.md                          # ADR index
│   ├── ADR-000-architecture-principles.md
│   ├── ADR-001-authentication-architecture.md
│   ├── ADR-002-hybrid-admin-authentication.md
│   ├── ADR-003-routing-architecture.md
│   ├── ADR-004-middleware-architecture.md
│   ├── ADR-005-better-auth-integration.md
│   ├── ADR-006-session-management.md
│   ├── ADR-007-platform-core.md
│   ├── ADR-008-event-bus.md
│   ├── ADR-009-security-standards.md
│   ├── ADR-010-ai-gateway-strategy.md
│   ├── ADR-011-ai-platform-core-architecture.md
│   ├── ADR-012-production-engineering-rules.md
│   └── ADR-013-navigation-architecture.md
│
├── audit/                                 # Audit & validation reports
│   ├── README.md
│   ├── documentation-inventory.md
│   ├── documentation-validation.md
│   ├── documentation-mapping.md
│   ├── documentation-cleanup-plan.md
│   ├── documentation-architecture-review.md
│   ├── documentation-architecture-recommendation.md
│   └── root-cleanup-plan.md
│
├── sprint/                                # Active sprint documentation
│   ├── README.md                          # Sprint overview
│   └── {sprint-id}/                      # Per-sprint docs
│       ├── README.md
│       ├── testing.md
│       └── final-report.md
│
├── archive/                               # Archived documentation
│   ├── README.md                          # Archive overview
│   ├── root-reports/                     # Archived root-level reports
│   ├── sprint-reports/                   # Old sprint reports
│   └── superseded/                       # Superseded documentation
│
└── product/                               # Product definition
    ├── README.md                          # Product overview
    ├── overview.md                       # Product definition
    ├── roadmap.md                        # Product roadmap
    └── brand.md                          # Brand identity
```

---

## 2. Recommended Module Structure

Each domain group follows a consistent documentation format:

```
docs/domains/{domain}/
├── README.md              # Entry point (required)
├── architecture.md        # Architecture (if complex)
├── database.md            # Database schema (if applicable)
├── api.md                 # API documentation (if applicable)
├── runtime.md             # Runtime behavior (if applicable)
├── verification.md        # How to verify (if applicable)
└── changelog.md           # Changes (if applicable)
```

### README.md Template

```markdown
# {Domain Name}

Brief description of this domain.

## Modules

| Module | Source Code | Description |
|--------|-------------|-------------|
| [{module}](module.md) | `src/core/{module}/` | Brief description |

## Architecture

How this domain fits into the system.

## Dependencies

What this domain depends on.
What depends on this domain.

## Quick Links

- [Architecture](../architecture/overview.md)
- [Standards](../standards/README.md)
- [ADRs](../adr/README.md)
```

---

## 3. Recommended Archive Strategy

### When to Archive

| Trigger | Action |
|---------|--------|
| Sprint completed | Move sprint docs to `docs/archive/sprint-reports/` |
| Feature superseded | Move old docs to `docs/archive/superseded/` |
| Report outdated | Move to `docs/archive/root-reports/` |
| Fix applied | Move fix report to `docs/archive/root-reports/` |

### Archive Structure

```
docs/archive/
├── README.md                  # Archive index
├── root-reports/             # Root-level reports (archived)
├── sprint-reports/           # Old sprint reports
└── superseded/               # Superseded documentation
```

### Archive Rules

1. Never delete — always archive
2. Archive maintains chronological order
3. Archived docs are read-only (no updates)
4. Archived docs are excluded from documentation audits
5. Archive README.md lists all archived content

---

## 4. Recommended Report Strategy

### Active Reports (in domain directories)

Only current, relevant reports live in domain directories:

```
docs/domains/{domain}/
├── README.md
├── architecture.md
├── verification.md          # Current verification status
└── changelog.md             # Recent changes
```

### Historical Reports (in archive)

All historical reports move to archive:

```
docs/archive/
├── root-reports/            # 40+ root-level reports
├── sprint-reports/          # 200+ sprint reports
└── superseded/              # 50+ superseded docs
```

### Report Naming Convention

| Type | Naming | Example |
|------|--------|---------|
| Architecture | `architecture.md` | `docs/domains/ai/architecture.md` |
| Verification | `verification.md` | `docs/domains/cms/verification.md` |
| Changelog | `changelog.md` | `docs/domains/billing/changelog.md` |
| Sprint Report | `{sprint-id}-final-report.md` | `docs/sprint/CMS-01/final-report.md` |
| Audit Report | `{topic}-audit.md` | `docs/audit/documentation-audit.md` |

---

## 5. Recommended Sprint Strategy

### Active Sprint

```
docs/sprint/{sprint-id}/
├── README.md              # Sprint overview, goals, status
├── testing.md             # Test results
├── final-report.md        # Completion report
└── ...                    # Additional sprint docs
```

### Sprint Lifecycle

1. **Sprint Start:** Create `docs/sprint/{sprint-id}/README.md`
2. **During Sprint:** Update README.md with progress
3. **Sprint Close:** Add `final-report.md`, move to `docs/archive/sprint-reports/`
4. **Archive:** Update `docs/archive/README.md` index

### Sprint Documentation Rules

- Sprint docs are temporary (max 2 active sprints)
- Sprint docs are not reference documentation
- Sprint docs capture decisions, not architecture
- After sprint close, relevant findings merge into domain docs

---

## 6. Recommended Naming Convention

### Files

- Use `lowercase-kebab-case` for all filenames
- Examples: `architecture.md`, `login-flow.md`, `stripe-integration.md`
- Never use spaces, underscores, or CamelCase

### Directories

- Use `lowercase-kebab-case` for all directory names
- Exception: `adr/` (standard abbreviation)
- Domain directories use descriptive names: `identity/`, `cms/`, `billing/`

### Module Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Module overview and entry point |
| `architecture.md` | Architecture description |
| `database.md` | Database schema documentation |
| `api.md` | API endpoint documentation |
| `runtime.md` | Runtime behavior documentation |
| `verification.md` | Verification and testing documentation |
| `changelog.md` | Recent changes documentation |

---

## 7. Recommended Governance

### Documentation Rules

1. **Source Code First:** Source code is always the Single Source of Truth
2. **No Root Markdown:** All documentation lives in `docs/`
3. **One Topic One Location:** Never duplicate content
4. **Update Before Create:** Always update existing docs first
5. **Archive Before Delete:** Never permanently delete documentation
6. **3 Clicks Maximum:** Any document reachable in 3 clicks from portal

### Documentation Lifecycle

```
Architecture
    ↓
Implementation
    ↓
Verification
    ↓
Maintenance
    ↓
Archive
```

### Review Process

1. All documentation changes require code review
2. Reviewer checks: accuracy, completeness, naming convention
3. Documentation PRs follow same process as code PRs

### Quarterly Audit

1. Validate all docs against current source code
2. Archive stale documentation
3. Update documentation inventory
4. Check for broken cross-references

---

## 8. Migration Strategy

### Phase 1: Create New Structure (No File Movement)

1. Create `docs/domains/` directory
2. Create all 15 domain group directories
3. Create `README.md` files for each domain
4. Create `docs/architecture/`, `docs/standards/`, `docs/product/` directories

### Phase 2: Move Module Documentation

1. Move root-level module reports to appropriate domain directories
2. Move docs/ loose module docs to appropriate domain directories
3. Merge duplicate files
4. Update all cross-references

### Phase 3: Archive Historical Content

1. Move sprint docs to `docs/archive/sprint-reports/`
2. Move superseded docs to `docs/archive/superseded/`
3. Move root reports to `docs/archive/root-reports/`
4. Delete confirmed duplicates only

### Phase 4: Clean Up Existing Directories

1. Consolidate `docs/PLATFORM/` → `docs/domains/platform/`
2. Consolidate `docs/SPECIFICATIONS/` → `docs/domains/foundation/`
3. Consolidate `docs/STANDARTS/` → `docs/standards/`
4. Consolidate `docs/LOCALIZATION/` → `docs/domains/cms/`
5. Consolidate `docs/CI_CD/` → `docs/standards/`
6. Consolidate `docs/DEVELOPER/` → `docs/standards/`
7. Remove empty directories (05-13, ASSETS)
8. Archive `docs/sprints/` → `docs/archive/sprint-reports/`
9. Archive `docs/api/`, `docs/auth/`, `docs/database/`, `docs/e2e/` → `docs/archive/`

### Phase 5: Update Portal

1. Update `docs/README.md` to reflect new structure
2. Update `docs/INDEX.md` to reflect new structure
3. Verify all cross-references work
4. Run documentation audit to confirm completeness

---

## 9. Success Criteria

| Criterion | Target |
|-----------|--------|
| Maximum click depth | 3 |
| Total domain directories | 15 |
| Files per domain (avg) | 5-8 |
| Total active documentation files | ~150 |
| Archived documentation files | ~800 |
| Duplicate documentation | 0 |
| Orphaned documentation | 0 |
| Broken cross-references | 0 |
| Documentation health score | 9/10 |
