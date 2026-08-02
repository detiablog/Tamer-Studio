# Documentation Architecture Review

Generated: 2026-08-02
Purpose: Critical review of the proposed documentation architecture from DOC-01

---

## Executive Summary

The DOC-01 proposal created a documentation architecture with **33 module directories** under `docs/modules/`. This review finds that the proposal is **structurally sound but over-decomposed** — it mirrors source code too literally instead of grouping modules by product domain.

**Key Finding:** 89 source modules should become **15 documentation groups**, not 33.

---

## 1. What the DOC-01 Proposal Got Right

### Principles Validated

| Principle | Status | Notes |
|-----------|--------|-------|
| Source Code is Single Source of Truth | ✅ Correct | Documentation must reflect implementation |
| One Module = One Documentation Home | ✅ Correct | Each product domain has one docs directory |
| No Markdown in Root | ✅ Correct | Root-level .md files are forbidden |
- Archive before Delete | ✅ Correct | Never permanently delete documentation |
| Update Before Create | ✅ Correct | Prevents documentation sprawl |

### Structural Decisions Validated

| Decision | Status | Notes |
|----------|--------|-------|
| `docs/modules/` as primary location | ✅ Correct | Module-centric organization is right |
| `docs/adr/` for Architecture Decision Records | ✅ Correct | Standard practice |
| `docs/archive/` for historical docs | ✅ Correct | Preserves project history |
| `docs/audit/` for audit reports | ✅ Correct | Keeps audit trail separate |
| `docs/standards/` for coding standards | ✅ Correct | Clear separation of concerns |

---

## 2. What the DOC-01 Proposal Got Wrong

### Problem 1: Too Many Module Directories (33 → Should Be 15)

The proposal creates 33 directories under `docs/modules/`:

```
admin, ai, analytics, auth, automation, billing, cache, cms, commerce,
email, events, foundation, homepage, landing, localization, media,
middleware, navigation, notifications, observability, operations,
orchestrator, payment, pricing, publishing, quality-assurance, scaling,
security, seo, storage, templates, users, workspace
```

**Problems:**
- Many directories will contain only 1-2 files (e.g., `cache/`, `middleware/`, `pricing/`)
- Some directories overlap conceptually (e.g., `payment/` vs `billing/` vs `commerce/`)
- Some are infrastructure, not product features (e.g., `events/`, `cache/`, `middleware/`)
- A developer looking for "how does billing work" must check 3+ directories

**Recommendation:** Group by product domain, not by source code module.

### Problem 2: Infrastructure Mixed with Product

The proposal treats infrastructure modules as product modules:

| Infrastructure (not product) | Product (user-facing) |
|------------------------------|----------------------|
| `cache/` | `cms/` |
| `events/` | `landing/` |
| `middleware/` | `dashboard/` |
| `foundation/` | `ai/` |
| `observability/` | `billing/` |

**Impact:** A developer looking for "how does the CMS work" must also understand cache, events, middleware, and foundation — concepts that are internal infrastructure, not product features.

**Recommendation:** Separate infrastructure documentation from product documentation.

### Problem 3: Homepage vs Landing Confusion

The proposal creates separate directories for `homepage/` and `landing/`:

- `homepage/` — Dynamic homepage composition engine (complex: runtime, composition, sections, cache)
- `landing/` — Landing page builder (simple: section CRUD)

**Analysis:** While they are technically separate modules, from a documentation perspective, they serve the same product area: **content rendering and page composition**. Homepage is the public-facing homepage; Landing is the marketing page builder.

**Recommendation:** Merge into `docs/modules/cms/` as sub-sections (Homepage and Landing Page).

### Problem 4: Payment/Billing/Commerce Split

The proposal creates three separate directories:

- `payment/` — Stripe gateway, payment processing
- `billing/` — Billing orchestrator (wallet, usage, cost, subscription, invoice)
- `commerce/` — Plans, pricing, checkout, credits, orders

**Analysis:** From a developer's perspective, "how does money work?" is one question. The source code splits these into separate modules for code organization, but documentation should reflect the product understanding.

**Recommendation:** Merge into `docs/modules/billing/` with clear sub-sections for Payment, Billing Engine, and Commerce.

### Problem 5: Navigation as Standalone

The proposal creates `docs/modules/navigation/` as a standalone directory with 11 report files.

**Analysis:** Navigation is architecturally significant (it integrates CMS, localization, SEO, and permissions), but it's not a standalone product feature. Users don't "use navigation" — they use the CMS, and navigation is how the CMS renders menus.

**Recommendation:** Merge into `docs/modules/cms/` as a sub-section.

### Problem 6: Too Many Small Directories

Several proposed directories will contain minimal documentation:

| Proposed Directory | Actual Content | Recommendation |
|-------------------|----------------|----------------|
| `cache/` | 1 report file | Merge into Platform |
| `middleware/` | 1 report file | Merge into Platform |
| `observability/` | 1 report file | Merge into Platform |
| `email/` | 1 report file | Merge into Communications |
| `events/` | 2 report files | Merge into Platform |
| `seo/` | 2 files | Merge into CMS |
| `media/` | 0 root files | Merge into CMS |
| `templates/` | 0 root files | Merge into Studios |
| `users/` | 0 root files | Merge into Identity |
| `workspace/` | 0 root files | Merge into Identity |
| `pricing/` | 0 root files | Merge into Billing |

**Impact:** Empty or near-empty directories create navigation confusion and suggest the architecture is incomplete.

---

## 3. What the DOC-01 Proposal Missing

### Missing: Existing docs/ Directories Not Addressed

The proposal doesn't explain what happens to these existing directories:

| Directory | Files | Status in Proposal |
|-----------|-------|-------------------|
| `docs/00_DEV_OS/` | 677 | Not addressed |
| `docs/00_META/` | 19 | Not addressed |
| `docs/02_ARCHITECTURE/` | 25 | Not addressed |
| `docs/03_AI/` | 22 | Not addressed |
| `docs/04_BACKEND/` | 20 | Not addressed |
| `docs/PLATFORM/` | 22 | Not addressed |
| `docs/SPECIFICATIONS/` | 19 | Not addressed |
| `docs/CI_CD/` | 22 | Not addressed |
| `docs/DEVELOPER/` | 22 | Not addressed |
| `docs/PROMPTS/` | 12 | Not addressed |
| `docs/CONTEXT/` | 16 | Not addressed |
| `docs/QUALITY/` | 8 | Not addressed |
| `docs/MEMORY/` | 3 | Not addressed |
| `docs/LOCALIZATION/` | 5 | Not addressed |
| `docs/GLOBAL_PREFERENCES/` | 5 | Not addressed |

**Impact:** The proposal creates a new structure without explaining how it coexists with the existing 800+ files.

### Missing: Archive Strategy for Existing Reports

The proposal mentions `docs/archive/` but doesn't define:
- When to archive
- How to archive
- What archive structure looks like
- How to reference archived docs

### Missing: Documentation Lifecycle

The proposal doesn't define:
- How documentation ages
- When to archive vs delete
- How to handle sprint-specific docs
- How to handle feature docs that become obsolete

### Missing: Migration Path

The proposal doesn't explain:
- How to transition from current state to proposed state
- What order to move files
- How to handle broken links during migration
- How to verify no documentation is lost

---

## 4. Score Card

| Criterion | Score | Notes |
|-----------|-------|-------|
| Matches Source Code | 7/10 | Too literal — mirrors module count instead of product domains |
| Simplicity | 5/10 | 33 directories is too many for this project size |
| Scalability | 6/10 | Will become unwieldy as new modules are added |
| Maintainability | 6/10 | Many small directories are hard to keep updated |
| Discoverability | 5/10 | Developer must check many directories to find answers |
| Duplication Risk | 7/10 | Low risk due to one-module-one-home principle |
| Navigation | 5/10 | Too many top-level entries in module listing |
| Follows README | 8/10 | Aligns with project documentation policy |
| **Overall** | **6/10** | Functional but needs simplification |

---

## 5. Recommendations

### Immediate Actions

1. **Reduce module directories from 33 to ~15** by grouping related modules
2. **Separate infrastructure from product** documentation
3. **Merge small directories** (cache, middleware, events, observability) into Platform
4. **Merge CMS-related modules** (navigation, seo, homepage, landing, media) into CMS
5. **Merge billing-related modules** (payment, billing, commerce, pricing) into Billing
6. **Merge communication modules** (email, sms, push, notifications) into Communications
7. **Merge identity modules** (users, workspace, membership, apikey) into Identity

### Structural Changes

1. Replace `docs/modules/` with numbered domain groups: `docs/domains/`
2. Each domain group contains sub-modules as sections, not directories
3. Infrastructure lives in `docs/platform/` separate from product domains
4. Active sprint docs live in `docs/sprint/` (not per-module)

### Process Changes

1. Define documentation lifecycle (creation → maintenance → archive)
2. Define archive structure and rules
3. Create migration plan from current state to proposed state
4. Address all existing docs/ directories in the migration plan
