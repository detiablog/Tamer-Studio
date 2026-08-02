# Sprint CMS-01 — B3

# Application Layer Refactor

Version: 1.0

Status: READY FOR IMPLEMENTATION

---

# References

1.
MASTER_ARCHITECTURE_BLUEPRINT.md

2.
IMPLEMENTATION_GOVERNANCE.md

3.
APPLICATION_LAYER_STANDARD.md

4.
Sprint B1 Reports

5.
Sprint B2 Reports

---

# Objective

Refactor the entire Application Layer.

Every API Route becomes a thin transport layer.

Application Layer owns:

- Request parsing
- Validation
- Authentication
- Authorization
- DTO mapping
- Error mapping
- HTTP responses

Business logic must remain exclusively in Services.

Persistence must remain exclusively in Repositories.

---

# Scope

Allowed

API Route refactor

Request DTO

Response DTO

Request validation

Authentication

Authorization

Response mapping

Error mapping

Application middleware

Logging

Request ID

Tracing

Rate limiting integration

API documentation

Application tests

Forbidden

Database schema changes

Repository refactor

Business logic changes

Localization implementation

Navigation

Homepage

CMS features

SEO

Performance optimization

---

# Task 1

API Audit

Inspect every API Route.

Generate:

Application Layer Audit Report

Identify:

Direct Repository imports

Direct Database imports

Business logic

Large handlers

Duplicated validation

Duplicated responses

Duplicated authentication

Duplicated authorization

---

# Task 2

DTO Standardization

Every endpoint must have:

Request DTO

Response DTO

Validation schema

Never expose Repository entities.

Never expose Drizzle models.

Never expose database rows.

---

# Task 3

Validation Layer

All validation must happen before Services.

Use centralized validation.

No duplicated validation.

---

# Task 4

Authentication

Move authentication into reusable middleware/helpers.

Services receive authenticated identity only.

Never parse tokens inside Services.

---

# Task 5

Authorization

Centralize RBAC checks.

API

↓

Authorization

↓

Service

Never duplicate permission checks.

---

# Task 6

Response Mapper

Repository Entity

↓

Application DTO

↓

HTTP JSON

Create reusable response mappers.

---

# Task 7

Error Mapping

Repository

↓

DataError

↓

Service

↓

BusinessError

↓

Application Layer

↓

HttpResponse

Every endpoint must return the standard error contract.

---

# Task 8

Logging

Every request automatically logs:

Request ID

Method

Route

Duration

Status

User ID

No duplicated logging.

---

# Task 9

Application Middleware

Standardize:

Authentication

Authorization

Locale detection

Request ID

Tracing

Rate limiting hooks

Logging hooks

---

# Acceptance Criteria

No API Route imports Repository.

No API Route imports Database.

No API Route imports Drizzle.

No API Route contains business logic.

No API Route performs validation twice.

No API Route builds SQL.

No API Route performs transactions.

Every endpoint uses DTO.

Every endpoint returns standardized responses.

Every endpoint uses standardized errors.

Every endpoint follows APPLICATION_LAYER_STANDARD.md.

---

# Deliverables

Application Layer Audit Report

DTO Mapping Report

Validation Report

Authentication Report

Authorization Report

Response Mapping Report

Error Mapping Report

Middleware Report

Architecture Compliance Report

Updated API Layer

---

# Definition of Done

API Routes become transport only.

Validation centralized.

Authentication centralized.

Authorization centralized.

DTO standardized.

Responses standardized.

Errors standardized.

Blueprint preserved.

Ready for Sprint B4.