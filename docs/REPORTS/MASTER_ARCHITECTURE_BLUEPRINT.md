# Tamer Studio

# MASTER_ARCHITECTURE_BLUEPRINT.md

**Version:** 2.0  
**Status:** LOCKED  
**Project:** Tamer Studio

## Blueprint Status

This document defines the target architecture of Tamer Studio.

It is not a description of the current implementation.

Current implementation is documented in `ARCHITECTURE_AUDIT.md`.

Target implementation is documented in this blueprint.

---

## Architecture States

### Current Architecture
Reference: `ARCHITECTURE_AUDIT.md`

### Target Architecture
Reference: `MASTER_ARCHITECTURE_BLUEPRINT.md`

Implementation sprints migrate the project from the current architecture toward the target architecture while preserving backward compatibility whenever feasible.

---

## Purpose

This blueprint is the single source of architectural truth.

Implementation prompts must not redefine the architecture.

---

## Product Vision

Tamer Studio is an AI Production Platform that enables creators, marketers, businesses, and agencies to generate, manage, publish, and optimize AI-powered content from one unified workspace.

Landing Builder, Website CMS, AI Generator, and Dashboard are modules of the platform—not the product itself.

---

## Architecture Principles

1. Refactor Before Replace
2. Reuse Before Create
3. Single Source of Truth
4. Configuration over Hardcode
5. Separation of Presentation and Business Logic

---

## Business Module Ownership

| Module | Owner |
|---|---|
| Authentication | Auth Module |
| Users | Auth Module |
| Subscription | Subscription Module |
| Billing | Billing Module |
| Credits | Billing Module |
| Voucher | Voucher Module |
| Workspace | Workspace Module |
| Projects | Project Module |
| AI Providers | AI Module |
| Localization | Localization Module |
| Email | Email Module |
| Notifications | Notification Module |
| FAQ | FAQ Module (future if needed) |
| Announcements | Announcement Module (future if needed) |
| Analytics | Analytics Module |
| Media | Media Module |

Some modules may not yet exist. Their presence defines future ownership responsibilities.

---

## Website CMS Scope

Website CMS owns only:

- Pages
- Sections
- Layout
- Navigation
- SEO
- Theme
- Media Library
- Draft
- Preview
- Publish
- Versioning

Website CMS must never permanently own business data.

Business data must be consumed from business services.

---

## Migration Principles

- No Big Bang Rewrite
- Backward Compatibility First
- Incremental Refactoring
- Reuse Existing Systems
- Preserve Existing APIs
- Business Data Migration before UI Migration
- Preserve Existing Records
- Prefer Reversible Migrations

---

## Component Registry

Use registry pattern for:

- CMS Sections
- Dynamic Marketing Blocks
- Homepage Sections
- Widgets

Do not force registry for UI primitives such as Button, Input, Icon, Typography, or simple Layouts.

---

## Data Flow

Database

↓

Repository

↓

Service

↓

API

↓

Website CMS

↓

Renderer

↓

Component

↓

User

---

## Localization Strategy

Static UI → Translation Files

Dynamic Content → Multilingual JSON stored in the owning entity.

Example:

```json
{
  "title": {
    "en": "AI Studio",
    "id": "Studio AI"
  }
}
```

Avoid duplicate localization systems.

---

## Navigation Strategy

Single navigation source for:

- Header
- Footer
- Sidebar
- Mobile Navigation

Hardcoded navigation should be eliminated incrementally.

---

## Homepage Architecture

Target structure:

1. Hero
2. Who Is It For
3. Workflow
4. AI Studios
5. Production Pipeline
6. AI Models
7. Pricing
8. Testimonials
9. FAQ
10. CTA
11. Footer

---

## SEO Strategy

Support:

- Metadata
- OpenGraph
- Canonical
- JSON-LD
- Robots
- Sitemap
- hreflang

---

## AI Implementation Rules

- Search existing components first.
- Search existing services first.
- Search existing APIs first.
- Search existing schemas first.
- Search existing migrations first.
- Search existing localization keys first.
- Never create duplicate modules.
- Never bypass business services.
- Never hardcode business values.
- Update localization resources with every UI change.
- Keep reasoning concise.

---

## Definition of Done

- No TypeScript errors.
- No ESLint errors.
- Localization updated.
- SEO preserved.
- Responsive verified.
- Database synchronization works.
- No duplicated services.
- No duplicated repositories.
- No duplicated schemas.
- No duplicated localization keys.
- No duplicated business logic.

---

## Global Rules

- Business Modules expose Services.
- Website CMS consumes Services.
- Presentation never owns Business Data.
- Every feature supports Localization.
- Every feature supports SEO.
- Every feature supports Responsive Design.
- Every feature supports Accessibility.
- AI implementations follow AI Implementation Rules.
- Blueprint has higher priority than implementation prompts.
- Architecture changes require Blueprint revision before implementation.

---

## Blueprint Lock

Version: 2.0

Status: LOCKED

Implementation prompts cannot override this blueprint.
