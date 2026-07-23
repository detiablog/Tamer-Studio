# Tamer Studio Development Standards

Version: 2.0

Status: Active

Owner: Tamer Studio

Last Updated: YYYY-MM-DD

Related Documents

- README.md
- PRODUCT.md
- PROJECT_CONTEXT.md
- BRAND_DNA.md
- GOVERNANCE.md
- ARCHITECTURE.md
- ENGINEERING_PLAYBOOK.md
- ADR/

---

# 1. Purpose

This document defines the official software engineering standards for Tamer Studio.

Its objective is to ensure every engineer and every AI coding assistant produces software that is:

- Consistent
- Maintainable
- Scalable
- Secure
- Modular
- Easy to understand
- Easy to replace
- Easy to review

This document defines HOW software is implemented.

It does NOT define:

- Business requirements
- Product roadmap
- Architecture decisions
- Sprint workflow

Those belong to their respective documents.

---

# 2. Scope

These standards apply to:

- Frontend
- Backend
- API
- Database
- Authentication
- AI Gateway
- Admin Panel
- User Panel
- Payment
- AI Features
- Internal Libraries
- Infrastructure Code

Every pull request, sprint, and AI-generated implementation must comply with these standards.

---

# 3. Development Philosophy

Every implementation must follow these engineering principles.

## 3.1 Readability First

Readable code is more valuable than clever code.

Future developers should understand the implementation without needing its author.

---

## 3.2 Simplicity Over Complexity

Always choose the simplest solution that satisfies the requirement.

Avoid unnecessary abstraction.

Avoid overengineering.

---

## 3.3 Reuse Before Create

Before creating:

- Component
- Service
- Repository
- Hook
- Utility
- API

Developers must verify whether an existing implementation can be reused or extended.

Duplicate implementations are prohibited.

---

## 3.4 Separation of Concerns

Each layer has a single responsibility.

UI

↓

API

↓

Service

↓

Repository

↓

Database

No layer may bypass another without an approved ADR.

---

## 3.5 Documentation Driven Development

Major implementation changes require documentation updates.

Documentation is considered part of the feature.

A feature is NOT complete until its required documentation is updated.

---

## 3.6 Security by Default

Security is never optional.

Every implementation must consider:

- Authentication
- Authorization
- Input Validation
- Output Sanitization
- Rate Limiting
- Audit Logging
- Session Management
- Secret Management

---

## 3.7 AI-Assisted Development

AI is an engineering assistant.

AI does not define product requirements.

AI does not override Architecture.

AI does not override Governance.

AI must follow:

- Product
- Project Context
- Architecture
- Development Standards
- ADR

before implementation begins.

---

# 4. Definition of Quality

Working software alone is NOT sufficient.

Every implementation must satisfy:

✓ Correctness

✓ Readability

✓ Maintainability

✓ Performance

✓ Security

✓ Testability

✓ Reusability

✓ Documentation

---

# 5. Engineering Decision Order

Whenever implementation decisions conflict,
follow this order:

1. Product

↓

2. Project Context

↓

3. Brand DNA

↓

4. Governance

↓

5. Architecture

↓

6. ADR

↓

7. Development Standards

↓

8. Sprint

↓

9. Implementation

Implementation must never override higher-level documents.

---

# 6. AI Development Rules

Before writing any code, AI must:

1. Read Product

2. Read Project Context

3. Read Architecture

4. Read ADR

5. Read Development Standards

6. Review Sprint Requirements

7. Analyze Existing Code

8. Produce an Implementation Plan

Only after completing these steps may implementation begin.

If requirements are incomplete or contradictory,
AI must stop and request clarification.

AI must never invent missing business rules.

---

# 7. Coding Priorities

Every implementation should prioritize:

Priority 1

Correctness

↓

Priority 2

Security

↓

Priority 3

Maintainability

↓

Priority 4

Readability

↓

Priority 5

Performance

↓

Priority 6

Optimization

Optimization must never reduce maintainability.

---

# 8. Software Lifecycle

Every feature follows the same lifecycle.

Requirement

↓

Planning

↓

Implementation

↓

Testing

↓

Review

↓

Documentation

↓

Release

↓

Maintenance

↓

Refactoring

↓

Deprecation

No phase should be skipped.

---

# 9. Prohibited Practices

The following practices are prohibited.

❌ Duplicate business logic

❌ Hardcoded secrets

❌ Direct database access from UI

❌ Business logic inside components

❌ Circular dependencies

❌ Hidden side effects

❌ Dead code

❌ Temporary code committed to production

❌ Copy-paste implementation without justification

❌ Architecture changes without ADR

---

# 10. Version Compatibility

Every implementation should consider:

Backward compatibility

Database migration safety

Configuration compatibility

API compatibility

Upgrade path

Breaking changes require:

- ADR
- Migration Plan
- Documentation Update

---

# End of Part 1

The following sections will be covered in Part 2:

11. Project Structure

12. Folder Organization

13. Naming Convention

14. React Standards

15. Next.js Standards

16. TypeScript Standards

17. File Organization

18. Component Standards

19. Hook Standards

20. Utility Standards

# 11. Project Structure

The project must maintain a predictable and modular structure.

Recommended structure:

src/
├── app/
├── components/
├── features/
├── services/
├── repositories/
├── hooks/
├── lib/
├── middleware/
├── providers/
├── types/
├── utils/
├── config/
├── styles/
└── generated/

Rules:

• Never create new top-level folders without architectural approval.
• Every folder must represent a business capability or infrastructure responsibility.
• Folder names should remain singular unless representing collections.
• Infrastructure code belongs in lib/.
• Shared UI belongs in components/.
• Business features belong in features/.
• Cross-cutting utilities belong in utils/.

---

# 12. Feature Organization

Every major feature should be self-contained.

Example:

features/
└── wallet/
    ├── components/
    ├── hooks/
    ├── services/
    ├── repositories/
    ├── validators/
    ├── types/
    ├── constants/
    └── index.ts

Benefits:

- easier maintenance
- isolated ownership
- simpler testing
- scalable architecture

---

# 13. Naming Standards

Consistency is mandatory.

Components

PascalCase

UserCard.tsx
WalletHistory.tsx

Hooks

useWallet.ts

useLanguage.ts

Services

wallet.service.ts

Repositories

wallet.repository.ts

Validators

wallet.validator.ts

Constants

wallet.constants.ts

Types

wallet.types.ts

Enums

wallet-status.enum.ts

Interfaces

wallet.interface.ts

Avoid names like:

helper.ts

helper2.ts

temp.ts

utils-old.ts

newService.ts

---

# 14. React Standards

Components should be as small as possible.

Prefer:

Presentational Components

↓

Container Components

↓

Hooks

↓

Services

Rules

Components should:

✓ render UI

✓ receive props

✓ emit events

Components should NOT:

✗ perform database operations

✗ call ORM

✗ contain payment logic

✗ contain authentication logic

✗ contain business workflow

---

# 15. Next.js Standards

Default:

Server Components

Use Client Components only when required.

Use Server Actions when appropriate.

Use Route Handlers for external APIs.

Keep Metadata close to pages.

Loading UI should use loading.tsx.

Errors should use error.tsx.

404 should use not-found.tsx.

Never fetch sensitive data directly from Client Components.

---

# 16. TypeScript Standards

Strict mode is mandatory.

Avoid:

any

Prefer:

unknown

Use readonly whenever possible.

Prefer explicit types.

Avoid large union types without documentation.

Interfaces:

for extendable contracts.

Types:

for composition and utility types.

Never disable TypeScript checking.

---

# 17. File Organization

One file should have one primary responsibility.

Recommended maximum:

Component

≈300 lines

Service

≈400 lines

Repository

≈300 lines

If significantly larger:

Consider splitting the implementation.

Large files require justification during review.

---

# 18. Component Standards

Each component should have:

Single responsibility

Minimal props

Clear naming

Predictable rendering

Reusable design

Avoid deeply nested JSX.

Extract repeated UI.

Memoization should only be introduced after profiling demonstrates a need.

---

# 19. Hook Standards

Hooks encapsulate reusable UI behaviour.

Hooks should:

manage state

coordinate UI logic

call services

Hooks should NOT:

perform database access

contain payment rules

contain authentication rules

modify unrelated global state

---

# 20. Utility Standards

Utility functions must remain:

Pure

Reusable

Side-effect free

Good examples:

formatCurrency()

formatDate()

slugify()

generateFilename()

Avoid:

Functions that call APIs.

Functions that update databases.

Functions that depend on business workflows.

Those belong in Services.

---

# End of Part 2

Next Part:

21. Service Standards

22. Repository Standards

23. API Standards

24. Database Standards

25. Validation Standards

26. Error Handling

27. Logging

28. Environment Variables

29. Security Coding Standards

30. Authentication & Authorization

# 21. Service Standards

The Service Layer contains business logic.

Service Responsibilities

✓ Business Rules

✓ Workflow

✓ Transactions

✓ Orchestration

✓ Domain Validation

Service MUST NOT

✗ Access UI

✗ Access React Components

✗ Render HTML

✗ Execute Raw SQL

✗ Call external APIs directly without abstraction

Rules

One Service = One Business Capability

Examples

AuthService

WalletService

BillingService

AffiliateService

VideoGenerationService

Avoid

WalletManager

WalletHelper

WalletUtils

WalletCore

These names usually indicate unclear responsibilities.

---

# 22. Repository Standards

Repositories manage data persistence.

Repository Responsibilities

✓ CRUD

✓ Query Builder

✓ Pagination

✓ Filtering

✓ Transactions

Repository MUST NOT

✗ Business Logic

✗ Permission Checks

✗ Payment Logic

✗ AI Workflow

Pattern

Service

↓

Repository

↓

Database

Never bypass Repository.

Never place SQL inside Services.

---

# 23. API Standards

Every API endpoint must follow:

Request

↓

Authentication

↓

Authorization

↓

Validation

↓

Service

↓

Repository

↓

Response

Required

Input Validation

Output Consistency

Standard Error Response

Audit Logging

Rate Limiting (where applicable)

Versioning for Breaking Changes

Response Example

{
  "success": true,
  "data": {},
  "meta": {}
}

Error Example

{
  "success": false,
  "code": "...",
  "message": "...",
  "details": {}
}

---

# 24. Database Standards

Database

PostgreSQL

ORM

Drizzle ORM

Naming

snake_case

Tables

plural

Columns

snake_case

Primary Key

id

Recommended Columns

id

created_at

updated_at

deleted_at

created_by

updated_by

Indexes

Foreign Keys

Constraints

Soft Delete when appropriate

Never delete production data without an approved migration.

---

# 25. Validation Standards

Every external input must be validated.

Sources

Forms

API

Webhook

Payment Callback

Admin Panel

CSV Import

AI Prompt

Validation Levels

Required

Format

Length

Range

Enum

Permission

Business Rules

Never trust client-side validation.

---

# 26. Error Handling Standards

Errors should be predictable.

Every error must contain

Code

Message

Severity

Log Reference (when applicable)

Never expose

Stack Trace

Database Error

Secrets

Access Token

Internal Path

Unexpected errors must be logged.

---

# 27. Logging Standards

Logging is mandatory.

Levels

INFO

WARN

ERROR

SECURITY

AUDIT

Production

Never use console.log()

Logging should include

Request ID

User ID (if authenticated)

Timestamp

Module

Severity

Avoid logging secrets or personal data.

---

# 28. Environment Standards

Environment Variables

Must use prefixes

DATABASE_

AUTH_

PAYMENT_

AI_

EMAIL_

STORAGE_

CACHE_

QUEUE_

Avoid

TOKEN

PASSWORD

KEY

SECRET

without namespace.

Never hardcode credentials.

---

# 29. Security Coding Standards

Every feature must consider

Authentication

Authorization

RBAC

CSRF

XSS

SQL Injection

Rate Limiting

Session Fixation

Audit Logging

Input Validation

Secrets Management

Security is part of implementation.

Security is not a post-processing step.

---

# 30. Authentication & Authorization Standards

Authentication

Identity Verification

Authorization

Permission Verification

Rules

Never manually compare roles inside UI.

Avoid

if (user.role === "admin")

Prefer

requireAdmin()

or centralized authorization helpers.

RBAC rules should remain centralized.

Never duplicate authorization logic.

---

# End of Part 3

Next Part

31. Performance Standards

32. AI Coding Standards

33. Testing Standards

34. Code Review Standards

35. Production Readiness

36. AI Development Rules

37. Documentation Rules

38. Appendix

39. Engineering Checklist

40. Final Principles

# 31. Performance Standards

Performance is a design requirement.

Every implementation should minimize:

- unnecessary rendering
- unnecessary database queries
- unnecessary API calls
- duplicated computation
- oversized bundles

---

## Frontend

Prefer:

Server Components

Streaming

Suspense

Code Splitting

Dynamic Import

Image Optimization

Lazy Loading

Avoid unnecessary Client Components.

---

## Backend

Prefer:

Pagination

Caching

Batch Processing

Connection Pooling

Queue Processing

Retry Mechanism

Circuit Breaker

Avoid N+1 Queries.

---

## Database

Prefer:

Indexes

Selective Columns

Pagination

Transactions

Prepared Queries

Never execute unnecessary queries.

---

# 32. AI Coding Standards

AI is treated as an engineering contributor.

Before implementation AI MUST:

Read:

✓ Product

✓ Project Context

✓ Brand DNA

✓ Governance

✓ Architecture

✓ Development Standards

✓ ADR

✓ Sprint Requirement

Then:

Analyze existing implementation.

Generate implementation plan.

Identify affected modules.

Only then implement.

---

AI must NEVER

Create duplicate modules.

Invent business rules.

Ignore ADR.

Ignore Architecture.

Rename unrelated files.

Modify unrelated modules.

Perform unnecessary refactoring.

Remove existing features without approval.

Change public APIs silently.

---

# 33. AI Implementation Principles

Every implementation should satisfy:

Reuse before Create

↓

Extend before Replace

↓

Refactor before Rewrite

↓

Optimize after Measurement

↓

Document before Merge

These principles apply to both human developers and AI.

---

# 34. Testing Standards

Testing is mandatory.

Minimum coverage:

Business Logic

Authentication

Authorization

API

Payment

Wallet

Billing

AI Gateway

Admin

Critical workflows require regression tests.

---

Testing Levels

Unit

Integration

End-to-End

Regression

Smoke Test

Performance Test (when applicable)

---

# 35. Code Review Standards

Every merge request should review:

Correctness

Architecture

Security

Readability

Maintainability

Performance

Documentation

Reviewers should prioritize long-term maintainability over short-term convenience.

---

Review Checklist

✓ Build

✓ Lint

✓ TypeScript

✓ Tests

✓ No duplicate logic

✓ No dead code

✓ No unused imports

✓ No secrets

✓ Documentation updated

---

# 36. Production Readiness

Before production:

Environment configured

Database migration complete

Health Check available

Monitoring enabled

Logging enabled

Backup strategy verified

Rollback strategy documented

Feature Flags verified

Release Notes prepared

No Critical Security Findings

Platform Readiness PASS

Human Approval

---

# 37. Documentation Standards

Documentation is part of development.

Whenever implementation changes:

Architecture

↓

Update ARCHITECTURE.md

Business Behaviour

↓

Update PRODUCT.md

Engineering Workflow

↓

Update ENGINEERING_PLAYBOOK.md

Architecture Decision

↓

Update ADR

Roadmap

↓

Update ROADMAP.md

Documentation updates are part of the Definition of Done.

---

# 38. AI Output Standards

Every implementation should generate:

Implementation Summary

Modified Files

New Files

Deleted Files

Migration Required

Potential Risks

Technical Debt

Known Limitations

Recommended Next Steps

This report becomes part of the sprint review.

---

# 39. Engineering Checklist

Before requesting review:

Developer (or AI) must confirm:

□ Product understood

□ Architecture followed

□ ADR respected

□ Existing modules reused

□ No duplicate implementation

□ Security considered

□ Validation implemented

□ Tests completed

□ Documentation updated

□ Build successful

□ Lint successful

□ TypeScript successful

□ Ready for QA

---

# 40. Final Engineering Principles

Every engineer is responsible for the long-term health of the platform.

Working software is only the beginning.

The real objective is to continuously build software that remains:

Readable

Maintainable

Scalable

Secure

Testable

Modular

Predictable

Every line of code should make the project easier to evolve, not harder.

The quality of the platform is measured not only by what it can do today, but by how confidently it can be changed tomorrow.

---

# Part 5 — Navigation & Module Coding Standards

This section defines the coding standards for Navigation and Module implementation.

Implementation must comply with ADR-013 and the Engineering Playbook.

---

# 41. Navigation Registry Standards

Navigation Registry is the Single Source of Truth.

The following must never be hardcoded:

- Sidebar
- Breadcrumb
- Route
- Navigation Cards
- Module Registration

Every navigation item must originate from the Navigation Registry.

---

# 42. Module Folder Standards

Every module should follow this structure:

module/

├── layout.tsx

├── page.tsx

├── loading.tsx

├── error.tsx

├── components/

├── hooks/

├── services/

├── repositories/

├── actions/

├── schemas/

├── constants/

├── types/

├── tests/

├── README.md

└── module.json

---

# 43. Route Standards

Routes must follow module hierarchy.

Correct

/admin/wallet

/admin/wallet/history

/admin/wallet/settings

Incorrect

/admin/history

/admin/settings

when History and Settings belong to Wallet.

---

# 44. Dashboard Standards

Every Parent Module must expose:

- Overview
- Summary
- Statistics
- Navigation Cards
- Quick Actions
- Recent Activity

Dashboard components should remain reusable.

---

# 45. Breadcrumb Standards

Breadcrumbs must be generated from the Navigation Registry.

Hardcoded breadcrumbs are prohibited.

---

# 46. Metadata Standards

Each route must define:

- title
- description
- keywords
- icon
- category

Metadata should remain consistent with Navigation Registry.

---

# 47. Navigation Components

Reusable navigation components include:

- Sidebar
- Top Navigation
- Navigation Card
- Breadcrumb
- Module Header
- Search Bar

Avoid duplicate navigation implementations.

---

# 48. Navigation Testing Standards

Navigation testing should include:

✓ Route Resolution

✓ Permission Validation

✓ Breadcrumb Generation

✓ Sidebar Rendering

✓ Responsive Navigation

✓ Accessibility

Every navigation change should include automated tests where practical.

---