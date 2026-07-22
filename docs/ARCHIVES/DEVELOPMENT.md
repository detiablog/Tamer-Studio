# Tamer Studio - Development Standards

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-07-21

---

# Purpose

This document defines the official development standards for Tamer Studio.

Its objective is to ensure that every developer and AI coding assistant follows the same implementation standards, coding style, project organization, and engineering practices.

This document complements **ADR.md**.

ADR explains **why** architectural decisions exist.

Development Standards explain **how** they are implemented.

---

# 1. General Principles

Every implementation must follow these principles.

- Readability over cleverness.
- Simplicity over complexity.
- Consistency over personal preference.
- Security by default.
- Performance matters.
- Code should be easy to replace.
- Every module should have a single responsibility.

---

# 2. Project Structure

Current project structure:

```

src/
app/
components/
lib/
hooks/
providers/
styles/
types/

```

Rules

- Do not create random top-level folders.
- Every new module must belong to an existing directory.
- Infrastructure belongs inside `lib`.
- Shared UI belongs inside `components`.
- Business logic never belongs inside `app`.

---

# 3. Folder Organization

Good

```

lib/

auth/
billing/
ai/
validation/
storage/

```

Bad

```

lib/

helper.ts
helper2.ts
temp.ts
utils-old.ts

```

Every folder must represent a business capability.

---

# 4. Naming Convention

## Components

PascalCase

```

LoginForm.tsx
UserCard.tsx
BillingTable.tsx

```

---

## Hooks

camelCase with use prefix

```

useAuth.ts
useWallet.ts
useProjects.ts

```

---

## Services

```

auth.service.ts
billing.service.ts
promotion.service.ts

```

---

## Validators

```

login.validator.ts
payment.validator.ts

```

---

## Repository

```

user.repository.ts
project.repository.ts

```

---

## Types

```

auth.types.ts
billing.types.ts

```

---

## Enums

```

user-role.enum.ts
subscription-status.enum.ts

```

---

# 5. Business Logic Rules

Business logic must never exist inside:

- page.tsx
- layout.tsx
- UI components

Correct

Page

↓

Service

↓

Repository

↓

Database

Incorrect

Page

↓

Database

---

# 6. Component Standards

Components should remain presentational whenever possible.

Components should:

- display data
- collect input
- emit events

Components should NOT:

- access database
- call ORM
- contain payment logic
- contain authentication logic

---

# 7. Service Standards

Every business capability should expose one public service.

Example

```

AuthService
BillingService
WalletService
PromotionService

```

Avoid duplicated business logic.

---

# 8. Validation

Every external input must be validated.

Examples

- API
- Forms
- Webhooks
- Admin panel

Never trust client input.

---

# 9. Error Handling

Standard response

```json
{
  "success": false,
  "code": "AUTH_INVALID_SESSION",
  "message": "...",
  "details": {}
}
```

Rules

- Never expose stack traces.
- Never expose secrets.
- Log internal errors.

---

# 10. Logging

Log Levels

- INFO
- WARN
- ERROR
- SECURITY
- AUDIT

Console logging is prohibited in production.

---

# 11. Environment Variables

Environment variables must use prefixes.

Examples

```

DATABASE\_
AUTH\_
ADMIN\_
PAYMENT\_
AI\_
EMAIL\_
STORAGE\_

```

Avoid generic names.

Bad

```

TOKEN
PASSWORD
KEY

```

---

# 12. Authentication

Authentication must never be implemented inside UI.

Only approved authentication services may create sessions.

Never duplicate login logic.

---

# 13. Authorization

Never check permissions manually.

Bad

```

if(user.role==="admin")

```

Correct

```

requireAdmin()

```

Authorization belongs to dedicated guards.

---

# 14. Database Standards

Recommended columns

```

id

created_at

updated_at

deleted_at

created_by

updated_by

```

Soft delete is preferred whenever appropriate.

---

# 15. API Standards

Every endpoint should provide

- Authentication
- Authorization
- Validation
- Business Logic
- Audit (when applicable)

Response format must remain consistent.

---

# 16. Security Standards

Every security-sensitive operation must include

- Validation
- Authorization
- Audit Logging
- Error Handling

Secrets must never be hardcoded.

---

# 17. AI Provider Standards

Every AI provider should expose a unified interface.

Example

```

generateText()

generateImage()

generateVideo()

estimateCost()

healthCheck()

```

Providers should be replaceable without changing business logic.

---

# 18. Payment Standards

Every payment gateway should expose

```

createPayment()

verifyPayment()

refundPayment()

cancelPayment()

```

Business logic must remain gateway-independent.

---

# 19. Admin Standards

Every admin page must use

```

requireAdmin()

```

Never bypass admin guards.

Emergency login must remain separated from user authentication.

---

# 20. Testing Standards

Minimum expectations

- Business logic tested
- Authentication tested
- Payment flow tested
- Admin authentication tested

Critical features require regression tests.

---

# 21. Code Review Checklist

Before every merge

- Build passes
- Lint passes
- TypeScript passes
- No secrets
- No console.log
- No duplicated logic
- Validation exists
- Authentication checked
- Authorization checked
- Error handling implemented

---

# 22. Production Checklist

Before deployment

- Environment configured
- Database migrations complete
- Security headers enabled
- Rate limiter enabled
- HTTPS enabled
- Logging configured
- Monitoring configured
- Health checks operational

---

# 23. AI Coding Assistant Rules

AI-generated code must

- follow ADR.md
- follow Development Standards
- avoid introducing duplicate logic
- preserve project structure
- include comments only when necessary
- prefer readability over complexity

Generated code must always be reviewed before production deployment.

---

# 24. Documentation Rules

Every major feature must include

- Purpose
- Public API
- Dependencies
- Configuration
- Limitations

Documentation should evolve together with implementation.

---

# 25. Long-Term Engineering Principles

Tamer Studio is intended to evolve into a scalable AI SaaS platform.

Every implementation should consider:

- Maintainability
- Extensibility
- Security
- Performance
- Developer Experience

Short-term convenience must never compromise long-term architecture.