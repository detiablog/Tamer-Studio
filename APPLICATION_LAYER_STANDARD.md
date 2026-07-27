# APPLICATION_LAYER_STANDARD

Version: 1.0

Status: LOCKED

Owner: Tamer Studio Architecture

Applies To:

- All API Routes
- Route Handlers
- Server Actions
- Middleware
- Request Validation
- Response Mapping
- Error Handling
- Authentication
- Authorization

---

# Purpose

This document defines the implementation standard for the Application Layer.

The Application Layer is responsible for translating external requests into business operations.

It is NOT responsible for business logic.

It is NOT responsible for persistence.

It is NOT responsible for UI.

---

# Architecture

```
User
    │
    ▼
HTTP Request
    │
    ▼
API Route
    │
    ▼
Validation
    │
    ▼
Authentication
    │
    ▼
Authorization
    │
    ▼
Service
    │
    ▼
Repository
    │
    ▼
Database
```

Application Layer stops at Service.

Everything below belongs to Domain/Persistence.

---

# Responsibilities

The Application Layer MAY:

- Parse requests
- Validate inputs
- Authenticate users
- Authorize actions
- Convert DTOs
- Call Services
- Return HTTP responses
- Map errors
- Log request metadata

The Application Layer MUST NOT:

- Execute SQL
- Use Drizzle directly
- Use db.select()
- Use db.insert()
- Use db.update()
- Use db.delete()
- Call repositories directly
- Implement business rules
- Implement pricing rules
- Implement payment rules
- Implement localization logic
- Implement RBAC logic

---

# Allowed Dependency Flow

```
API Route

↓

Validation

↓

Authentication

↓

Authorization

↓

Service

↓

DTO Mapper

↓

HTTP Response
```

Forbidden

```
API

↓

Repository
```

Forbidden

```
API

↓

Database
```

Forbidden

```
API

↓

Drizzle
```

Forbidden

```
API

↓

Business Logic
```

---

# Standard Route Structure

Every Route Handler should follow this order.

```
Parse Request

↓

Validate DTO

↓

Authenticate

↓

Authorize

↓

Call Service

↓

Map Response

↓

Return HTTP
```

Nothing else.

---

# Request Validation

Every endpoint must validate input before calling a Service.

Validation should happen only once.

Recommended order

```
Request

↓

DTO Validation

↓

Service
```

Never validate the same field twice.

---

# DTO Rules

Every endpoint has its own DTO.

Example

CreateWorkspaceRequest

UpdateWorkspaceRequest

DeleteWorkspaceRequest

Never expose Repository models.

Never expose Database models.

Never expose Drizzle types.

---

# Response Rules

API responses must never return Repository objects directly.

Instead

```
Repository Entity

↓

Response DTO

↓

JSON
```

Mapping belongs to the Application Layer.

---

# Error Strategy

Layer Responsibilities

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

HttpError

↓

JSON Response
```
Repository never returns HTTP errors.

Service never returns HTTP errors.

Only Application Layer returns HTTP responses.

---

# Error Format

Every endpoint returns the same structure.

Success

```json
{
  "success": true,
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "error": {
    "code": "WORKSPACE_NOT_FOUND",
    "message": "Workspace not found"
  }
}
```

Never return raw exceptions.

Never expose stack traces.

Never expose SQL errors.

---

# Authentication

Authentication happens before Services.

Example

```
Request

↓

Auth Middleware

↓

Service
```

Services receive authenticated identity.

Services never parse tokens.

---

# Authorization

Authorization belongs to the Application Layer.

RBAC Service may be called.

Example

```
Request

↓

Authentication

↓

Authorization

↓

Service
```

Services should assume authorization has already occurred unless a business rule requires an additional permission check.

---

# Middleware Responsibilities

Middleware MAY

Authentication

Logging

Rate limiting

Tracing

Locale detection

Request ID generation

Middleware MUST NOT

Query database directly

Call repositories

Execute business logic

Modify business data

---

# Logging

Application Layer logs only

HTTP Method

Path

Status

Duration

Request ID

User ID

Never log

Passwords

Tokens

Secrets

Payment credentials

---

# Dependency Rules

Application Layer MAY depend on

Validation

Authentication

Authorization

Service Interfaces

DTOs

Response Mapper

Logger

Application Layer MUST NOT depend on

Repository

Database

Drizzle

ORM

SQL

UI

Components

---

# HTTP Status Mapping

| Business Result | HTTP |
|-----------------|------|
| Success | 200 |
| Created | 201 |
| Accepted | 202 |
| ValidationError | 422 |
| AuthenticationError | 401 |
| PermissionDenied | 403 |
| NotFound | 404 |
| Conflict | 409 |
| RateLimited | 429 |
| InternalError | 500 |

Never invent custom HTTP codes.

---

# Route Naming

REST endpoints

```
GET

POST

PUT

PATCH

DELETE
```

Use nouns.

Avoid verbs.

Example

Good

```
/api/workspaces

/api/users

/api/orders
```

Avoid

```
/api/createWorkspace

/api/deleteUser

/api/updateOrder
```

---

# Dependency Injection

API Routes never instantiate repositories.

Preferred

```
Route

↓

Service Interface

↓

DI Container

↓

Repository
```

Temporary (allowed until Infrastructure Sprint)

```
Route

↓

DefaultService()
```

Direct repository instantiation inside API Routes is forbidden.

---

# Application Layer Checklist

Every endpoint must answer YES to all:

- No SQL
- No Drizzle
- No Repository
- No Business Logic
- Validation exists
- Authentication exists
- Authorization exists (if required)
- Calls Service only
- Returns DTO only
- Uses standard error format
- Uses standard HTTP status
- Uses centralized logging

---

# Sprint Validation

Before closing every sprint verify:

- No new API Route accesses the database.
- No API Route imports a repository.
- No API Route contains business rules.
- No API Route contains pricing calculations.
- No API Route contains permission logic.
- No API Route contains localization logic.
- No API Route contains payment workflow.
- No API Route contains transaction orchestration.

---

# Definition of Done

The Application Layer is considered complete when:

- Every endpoint follows the standard request flow.
- Every endpoint delegates business logic to Services.
- Every endpoint returns standardized DTOs.
- Every endpoint uses standardized error responses.
- No endpoint accesses the Repository directly.
- No endpoint accesses the Database directly.
- No endpoint contains business logic.
- Authentication and authorization are consistently enforced.
- The implementation complies with the Master Architecture Blueprint and Implementation Governance.

---

# Governance Lock

This document is part of the Architecture Governance.

Changes require:

- Architecture Review
- ADR (Architecture Decision Record)
- Approval before implementation

No sprint may violate this standard without an approved ADR.