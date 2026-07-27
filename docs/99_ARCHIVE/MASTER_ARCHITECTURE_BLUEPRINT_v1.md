# Tamer Studio
# MASTER_ARCHITECTURE_BLUEPRINT

Version: 1.0
Status: Approved
Project: Tamer Studio
Type: Architecture Constitution

---

# 1. Purpose

This document is the single source of architectural truth for the Tamer Studio project.

Its purpose is to:

- Define the long-term architecture.
- Prevent inconsistent implementations.
- Prevent duplicated systems.
- Preserve business modules.
- Ensure every implementation follows the same design principles.

Every implementation sprint MUST follow this blueprint.

This document has higher priority than individual sprint prompts.

---

# 2. Product Vision

Tamer Studio is an AI Production Platform that enables creators, marketers, businesses, and agencies to generate, manage, publish, and optimize AI-powered content from one unified workspace.

Tamer Studio is NOT:

- an AI Image Generator
- a Landing Builder
- a Website Builder
- a CMS

Those are only modules inside the platform.

---

# 3. Core Platform Architecture

                    Tamer Studio

                          │

      ┌───────────────────┼───────────────────┐

      │                   │                   │

 Marketing Website     User Dashboard     Admin Panel

      │                   │                   │

      └───────────────────┼───────────────────┘

                          │

                Website CMS Engine

                          │

               Presentation Layer

                          │

             Component Registry Engine

                          │

                 Rendering Engine

──────────────────────────────────────────────

                Business Modules

Authentication

Subscription

Billing

Credits

Voucher

Workspace

Projects

AI Providers

Localization

Notifications

Email

FAQ

Announcements

Analytics

Media

──────────────────────────────────────────────

                    Database

---

# 4. Architecture Principles

## Principle 1

Refactor Before Replace

Never replace an existing system without first evaluating whether it can be refactored.

---

## Principle 2

Reuse Before Create

Search for reusable components before creating new ones.

---

## Principle 3

Single Source of Truth

Every business entity must have only one owner.

Duplicating business data is prohibited.

---

## Principle 4

Configuration over Hardcode

Content must be configurable.

Never hardcode:

- Navigation
- Footer
- Homepage Content
- Pricing
- SEO
- Announcements

---

## Principle 5

Presentation and Business must remain separated.

---

# 5. Business Module Ownership

| Module | Owner |
|---------|-------|
| Authentication | Auth Module |
| Users | Auth Module |
| Subscription | Subscription Module |
| Voucher | Voucher Module |
| Billing | Billing Module |
| Credits | Billing Module |
| FAQ | FAQ Module |
| Announcement | Announcement Module |
| AI Providers | AI Module |
| Workspace | Workspace Module |
| Project | Project Module |
| Localization | Localization Module |
| Email | Email Module |
| Notification | Notification Module |

Only the owner may modify business data.

---

# 6. Website CMS Scope

Website CMS owns ONLY:

- Website Pages
- Sections
- Layout
- Navigation
- SEO
- Theme
- Media
- Draft
- Publish
- Preview
- Versioning

Website CMS DOES NOT own:

- Pricing Logic
- Subscription Logic
- Billing
- Voucher Logic
- Credits
- AI Providers
- Authentication
- User Management

---

# 7. Website Inventory

Review every page.

For each page classify:

- Keep
- Refactor
- Hide
- Remove

Pages include:

- Home
- Pricing
- Features
- FAQ
- About
- Contact
- Support
- Credits
- Roadmap
- Careers
- Blog
- Privacy
- Terms

---

# 8. Component Inventory

Review every reusable component.

For every component classify:

- Reuse
- Refactor
- Replace

Priority:

1. Hero

2. Header

3. Footer

4. Pricing

5. FAQ

6. CTA

7. Cards

8. Forms

9. Dialogs

10. Layouts

---

# 9. Component Registry

Every component must follow this architecture.

Component

↓

Configuration

↓

Registry

↓

Renderer

↓

Output

Do not implement rendering with large switch statements whenever a registry pattern is suitable.

---

# 10. Data Flow

Business Data Flow

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

Website CMS never accesses business tables directly.

---

# 11. Synchronization Rules

Subscription

↓

Pricing Component

Voucher

↓

Promotion Banner

FAQ

↓

FAQ Component

Announcement

↓

Homepage Banner

AI Provider

↓

Provider Section

Synchronization must always occur through Service/API.

---

# 12. Localization Strategy

Static UI

↓

Translation Files

Dynamic Content

↓

Multilingual JSON

Example

{
    "title": {
        "en": "...",
        "id": "..."
    }
}

Avoid introducing a new localization framework unless there is a project-wide architecture decision.

---

# 13. Navigation Strategy

Navigation has one source.

Header

↓

Footer

↓

Sidebar

↓

Mobile Menu

↓

Website CMS

Hardcoded navigation is prohibited.

---

# 14. Homepage Architecture

Homepage structure:

Hero

↓

Who Is It For

↓

Workflow

↓

AI Studios

↓

Production Pipeline

↓

AI Models

↓

Pricing

↓

Testimonials

↓

FAQ

↓

CTA

↓

Footer

---

# 15. SEO Strategy

Every page must support:

- Metadata
- OpenGraph
- Canonical
- JSON-LD
- Robots
- Sitemap
- hreflang

SEO must be configurable.

---

# 16. Implementation Roadmap

Completed

✔ CMS-00 Architecture Audit

Current

CMS-00 Master Blueprint

Next

CMS-01 CMS Foundation

CMS-02 Homepage

CMS-03 Synchronization

CMS-04 Website CMS

CMS-05 QA

---

# 17. Definition of Done

A sprint is complete only when:

- No TypeScript errors.
- No ESLint errors.
- Localization is complete.
- SEO is preserved.
- Responsive layouts are verified.
- Database synchronization works.
- Existing features are not broken.
- No duplicated business logic.
- No duplicated business data.
- Documentation is updated.

---

# 18. Global Rules

The following rules are mandatory.

1. Refactor Before Replace

2. Reuse Before Create

3. Single Source of Truth

4. Website CMS owns Presentation only.

5. Business Modules own Business Data.

6. No Hardcoded Content.

7. Localization First.

8. SEO First.

9. Responsive by Default.

10. Accessibility by Default.

11. Every Feature must support Database Synchronization.

12. Every Sprint must preserve backward compatibility whenever feasible.

13. Never remove an existing module without architectural approval.

14. Always search for reusable components before creating new ones.

15. Follow this blueprint before following implementation prompts.

---

# 19. Relationship with Other Documents

Priority order:

1. MASTER_ARCHITECTURE_BLUEPRINT.md

2. ARCHITECTURE_AUDIT.md

3. Sprint Prompt

4. Task Prompt

If conflicts occur, the higher-priority document prevails.

---

END OF DOCUMENT