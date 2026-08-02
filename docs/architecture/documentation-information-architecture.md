# Documentation Information Architecture

Generated: 2026-08-02
Purpose: How developers navigate documentation and find knowledge

---

## Navigation Principles

### 1. Maximum 3 Clicks to Any Document

From `docs/README.md`, any document should be reachable in at most 3 clicks:

```
docs/README.md → Domain Group → Module → Document
```

### 2. Find by Domain, Not by File Type

Developers think in product domains, not in file types:
- "How does billing work?" → `docs/domains/billing/`
- "How does authentication work?" → `docs/domains/identity/`
- "How does the CMS work?" → `docs/domains/cms/`

Not:
- "Where is the architecture doc?" → Search everywhere
- "Where is the API doc?" → Search everywhere

### 3. One Entry Point Per Domain

Each domain group has a single `README.md` that serves as the entry point and table of contents.

---

## Proposed Navigation Structure

```
docs/
├── README.md                    # Portal: links to all domains
│
├── domains/                     # Product documentation (15 groups)
│   ├── foundation/              # Core infrastructure
│   │   └── README.md            # Entry point → links to sub-sections
│   ├── identity/                # Identity & access
│   │   └── README.md
│   ├── security/                # Security
│   │   └── README.md
│   ├── platform/                # Platform operations
│   │   └── README.md
│   ├── ai/                      # AI system
│   │   └── README.md
│   ├── cms/                     # Content management
│   │   └── README.md
│   ├── billing/                 # Billing & commerce
│   │   └── README.md
│   ├── communications/          # Notifications & messaging
│   │   └── README.md
│   ├── admin/                   # Admin panel
│   │   └── README.md
│   ├── support/                 # Support & customer service
│   │   └── README.md
│   ├── studios/                 # Creative studios
│   │   └── README.md
│   ├── analytics/               # Analytics & intelligence
│   │   └── README.md
│   ├── automation/              # Automation & quality
│   │   └── README.md
│   ├── storage/                 # Storage & assets
│   │   └── README.md
│   └── misc/                    # Miscellaneous
│       └── README.md
│
├── architecture/                # System-wide architecture
│   ├── overview.md
│   └── ...
│
├── standards/                   # Coding standards
│   ├── api-guidelines.md
│   └── ...
│
├── adr/                         # Architecture Decision Records
│   └── ADR-{number}-{title}.md
│
├── audit/                       # Audit & validation reports
│   └── ...
│
├── sprint/                      # Active sprint docs
│   └── {sprint-id}/
│
├── archive/                     # Archived documentation
│   └── ...
│
└── product/                     # Product definition
    ├── overview.md
    ├── roadmap.md
    └── brand.md
```

---

## Click Depth Analysis

### From docs/README.md to any document:

| Path | Clicks |
|------|--------|
| README.md → domains/cms/README.md → architecture.md | 2 |
| README.md → domains/identity/README.md → auth/login-flow.md | 3 |
| README.md → architecture/overview.md | 1 |
| README.md → standards/api-guidelines.md | 1 |
| README.md → adr/ADR-001-authentication-architecture.md | 1 |
| README.md → domains/billing/README.md → payment/stripe-integration.md | 3 |
| README.md → sprint/CMS-01/README.md | 1 |
| README.md → archive/sprint-reports/README.md | 1 |

**Maximum depth: 3 clicks** ✅

### Comparison with Current State

| Current Path | Clicks | Proposed Path | Clicks |
|-------------|--------|---------------|--------|
| README.md → docs/auth/AuthenticationAudit.md | 2 | README.md → domains/identity/README.md | 1 |
| README.md → docs/cms-api-report.md | 1 | README.md → domains/cms/README.md | 1 |
| README.md → docs/modules/navigation/api-report.md | 3 | README.md → domains/cms/README.md → navigation.md | 2 |
| README.md → docs/modules/localization/translation-cache.md | 3 | README.md → domains/cms/README.md → localization.md | 2 |
| README.md → docs/modules/foundation/di-report.md | 3 | README.md → domains/foundation/README.md | 1 |

**Average depth reduced from 2.5 to 1.5 clicks** ✅

---

## AI Discoverability

### How AI Finds Module Knowledge

When an AI coding assistant needs to understand a module:

1. **Step 1:** Read `docs/README.md` → find the domain group
2. **Step 2:** Read `docs/domains/{domain}/README.md` → find the module
3. **Step 3:** Read `docs/domains/{domain}/{module}.md` → get full context

### AI-Friendly Structure

Each module documentation follows a consistent format:

```markdown
# {Module Name}

## Overview
Brief description of what this module does.

## Architecture
How this module fits into the system.

## Key Files
- `path/to/main-service.ts` — Main service
- `path/to/repository.ts` — Data access
- `path/to/types.ts` — Type definitions

## Database
Schema files and relationships.

## API
Endpoints exposed by this module.

## Dependencies
What this module depends on.
What depends on this module.

## Verification
How to verify this module works correctly.
```

This structure allows AI to:
- Quickly find the module
- Understand its purpose
- Locate key source files
- Understand relationships
- Verify correctness

---

## Duplicate Documentation Prevention

### Rule: One Topic = One Location

| Topic | Primary Location | Cross-Reference |
|-------|-----------------|-----------------|
| Authentication Architecture | `domains/identity/README.md` | ADR-001, ADR-002, ADR-005 |
| CMS Architecture | `domains/cms/README.md` | ADR-013 |
| AI Architecture | `domains/ai/README.md` | ADR-010, ADR-011 |
| Security Architecture | `domains/security/README.md` | ADR-009 |
| Event System | `domains/foundation/README.md` | ADR-008 |

### Rule: Cross-Reference, Don't Duplicate

Instead of copying content:
```markdown
See [Authentication Architecture](../identity/README.md#architecture)
```

Not:
```markdown
# Authentication Architecture
(copy of content from identity/README.md)
```

---

## Search Strategy

### By Domain
```
docs/domains/{domain}/README.md
```

### By Topic
```
docs/README.md → search by keyword
```

### By ADR
```
docs/adr/README.md → list of all ADRs
```

### By Sprint
```
docs/sprint/{sprint-id}/README.md
```

### By Standard
```
docs/standards/README.md → list of all standards
```

---

## Navigation Rules

### 1. Every Directory Has a README.md
Every directory that contains documentation must have a `README.md` that serves as the entry point.

### 2. README.md Lists All Contents
Every `README.md` must list all files in its directory with brief descriptions.

### 3. Cross-References Use Relative Paths
All internal links use relative paths, not absolute paths.

### 4. Broken Links Are Build Failures
Documentation builds should check for broken links.

### 5. New Documentation Requires Index Update
When adding a new document, update the parent `README.md` to include it.
