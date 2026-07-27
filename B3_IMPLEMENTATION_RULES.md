# Sprint CMS-01 — B3

# Implementation Rules

Version: 1.0

Status: LOCKED

Applies To

- All API Routes
- Route Handlers
- Server Actions
- Middleware
- DTO
- Validation
- Response Mapping

---

# Purpose

These rules define what AI is allowed to modify during Sprint B3.

The objective is to refactor the Application Layer without changing business behavior.

---

# Primary Goal

Transform every API Route into a thin transport layer.

API

↓

Validation

↓

Authentication

↓

Authorization

↓

Service

↓

Response Mapping

↓

HTTP Response

Nothing else.

---

# Allowed Changes

AI MAY

Refactor API Routes

Extract DTO

Extract Validators

Extract Response Mappers

Extract Error Mappers

Create shared helpers

Create middleware

Standardize responses

Standardize errors

Standardize logging

Centralize authentication

Centralize authorization

Remove duplicated code

Improve readability

Improve maintainability

---

# Forbidden Changes

AI MUST NOT

Modify Repository behavior

Modify Service business logic

Modify database schema

Create migrations

Modify localization behavior

Modify SEO

Modify CMS

Modify Homepage

Modify Navigation

Modify payment calculations

Modify pricing rules

Modify RBAC rules

Modify subscription logic

Modify billing rules

---

# Database Rules

API Routes must never

Import db

Import Drizzle

Execute SQL

Call Repository directly

Build queries

Open transactions

All persistence must go through Services.

---

# Service Rules

API may call

Service Interface

Default Service

Application Service

API may never

Call Repository

Call Database

Call ORM

Duplicate Service logic

---

# DTO Rules

Every endpoint must have

Request DTO

Response DTO

Validation Schema

Never expose

Database entities

Repository models

Drizzle types

Internal IDs unless required

---

# Validation Rules

Validation happens before Services.

Validation occurs exactly once.

No duplicated validation.

---

# Authentication Rules

Authentication must be centralized.

Services receive authenticated identity only.

Services must never parse tokens.

---

# Authorization Rules

Authorization occurs before Service execution.

RBAC checks must be centralized.

No duplicated permission checks.

---

# Response Rules

All responses follow

Success

{
  "success": true,
  "data": {}
}

Failure

{
  "success": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}

Never expose

Stack traces

SQL errors

Repository exceptions

---

# Logging Rules

Each request logs

Request ID

Method

Route

Duration

Status

User ID

Never log

Passwords

Tokens

Secrets

Payment credentials

---

# Error Rules

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

HTTP Response

API Routes must never throw raw Error objects.

---

# Middleware Rules

Middleware may perform

Authentication

Authorization

Logging

Locale Detection

Tracing

Rate Limit Hooks

Middleware must never

Access database directly

Contain business logic

Modify business data

---

# Backward Compatibility

Existing frontend contracts must remain compatible.

If response changes are unavoidable,

Response adapters must be introduced.

Breaking API changes are forbidden.

---

# Scope Control

Every code change must answer YES

Does this belong to the Application Layer?

If NO

Do not modify it.

---

# Completion Criteria

Sprint B3 is complete only if

No API Route imports Repository.

No API Route imports Database.

No API Route imports Drizzle.

No API Route contains business logic.

Every endpoint uses DTO.

Every endpoint uses centralized validation.

Every endpoint returns standardized responses.

Every endpoint uses standardized error mapping.

Every endpoint complies with

APPLICATION_LAYER_STANDARD.md

MASTER_ARCHITECTURE_BLUEPRINT.md

IMPLEMENTATION_GOVERNANCE.md