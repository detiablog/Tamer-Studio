# Tamer Studio - Architecture Decision Records (ADR)

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-07-21

---

# Purpose

This document serves as the single source of truth for all architectural decisions made in the Tamer Studio platform.

Every major architectural decision must be recorded here before implementation.

The objective is to ensure that every developer and AI assistant understands not only **what** was built, but also **why** it was built that way.

---

# ADR-000 — Architecture Principles

## Status

Accepted

## Background

Tamer Studio is designed as a long-term AI SaaS platform.

Without architectural standards, feature development will eventually become inconsistent and tightly coupled.

## Decision

The platform adopts the following architectural principles.

1. Separation of Concerns
2. Security First
3. Modular Architecture
4. Infrastructure Isolation
5. Replaceable Providers
6. Event-Driven Communication
7. Consistent Developer Experience
8. Production-Ready by Default

## Design Rules

- UI contains no business logic.
- Business logic belongs to services.
- Infrastructure must remain replaceable.
- Every module must expose a clear public API.
- Every important decision must be documented.

## Future Evolution

Future architectural decisions must remain compatible with these principles whenever possible.

---

# ADR-001 — Authentication Architecture

## Status

Accepted

## Background

User authentication and administrator authentication have different security requirements and operational responsibilities.

Using a single authentication mechanism increases security risks and maintenance complexity.

## Decision

Authentication is separated into two independent systems.

User Authentication

- Better Auth

Administrator Authentication

- Dedicated Admin Authentication

## Design Rules

- User sessions and admin sessions must never be shared.
- Admin authentication must remain operational independently of Better Auth.
- Authentication logic must never exist inside UI components.

## Future Evolution

Possible future integrations:

- Enterprise SSO
- OAuth Providers
- Passkeys
- MFA

---

# ADR-002 — Hybrid Admin Authentication

## Status

Accepted

## Background

Administrators require an emergency recovery mechanism without compromising operational security.

## Decision

Administrator authentication uses two authentication layers.

Layer 1

Operational Admin Credentials

Stored inside the database.

Layer 2

Master Emergency Credentials

Stored only inside environment variables.

## Design Rules

Authentication flow

Database

↓

Master Key

↓

Reject

Master credentials

- Cannot be modified from UI
- Cannot be stored in database
- Used only for emergency recovery

## Future Evolution

Hardware Security Keys

Enterprise Identity Providers

---

# ADR-003 — Routing Architecture

## Status

Accepted

## Background

Public pages, authenticated pages and administrative pages require different routing behavior.

## Decision

Routing is divided into three areas.

/

Marketing Website

/dashboard

Authenticated User Area

/admin

Administrator Area

/admin/login

Administrator Login

## Design Rules

- Marketing routes never require authentication.
- Dashboard routes always require authenticated users.
- Admin routes always require administrator authentication.

---

# ADR-004 — Middleware Architecture

## Status

Accepted

## Background

Authentication logic should never be duplicated across layouts and pages.

## Decision

The platform uses centralized middleware.

Dedicated guards

requireUser()

requireAdmin()

## Design Rules

No page performs authentication manually.

Middleware is responsible for route protection.

---

# ADR-005 — Better Auth Integration

## Status

Accepted

## Decision

Better Auth is responsible only for user authentication.

Administrator authentication remains independent.

## Design Rules

- Better Auth never authenticates administrators.
- Admin sessions never depend on Better Auth.

---

# ADR-006 — Session Management

## Status

Accepted

## Decision

Separate session systems.

User Session

Managed by Better Auth.

Administrator Session

Managed internally.

## Design Rules

Separate cookies

Separate expiration

Separate validation

Separate logout

---

# ADR-007 — Platform Core

## Status

Accepted

## Background

Direct communication between feature modules creates strong coupling.

## Decision

Business modules communicate only through Platform Core.

Platform services include:

- Authentication
- Billing
- Wallet
- Credits
- AI
- Assets
- Workflow
- Notifications
- Audit
- Analytics
- Configuration

## Design Rules

Feature modules never communicate directly.

Correct

Feature

↓

Platform Core

↓

Feature

Incorrect

Feature

↓

Feature

---

# ADR-008 — Event Bus

## Status

Accepted

## Background

Cross-module dependencies should be minimized.

## Decision

Business events are published through an internal event bus.

Examples

USER_CREATED

USER_LOGIN

PAYMENT_SUCCESS

PROJECT_CREATED

WORKFLOW_COMPLETED

AI_GENERATION_FINISHED

PROMOTION_USED

## Design Rules

Modules publish events.

Modules subscribe to events.

Modules never directly invoke unrelated business modules.

---

# ADR-009 — Security Standards

## Status

Accepted

## Decision

Security is treated as a platform-wide responsibility.

## Design Rules

- HttpOnly cookies
- Secure cookies
- SameSite protection
- CSRF protection
- Security headers
- Rate limiting
- Password hashing
- Audit logging
- Secret isolation

## Future Evolution

MFA

Passkeys

Hardware Keys

Enterprise SSO

---

# ADR-010 — Production Rules

## Status

Accepted

## Decision

The following rules are mandatory.

## Rules

- No business logic inside UI.
- No direct database access from UI.
- No plaintext secrets.
- No duplicated authentication logic.
- No direct feature-to-feature communication.
- Every security-sensitive action must be audited.
- Every major architectural change must update this ADR.

---

# Architecture Governance

Every future architectural decision must answer the following questions.

1. What problem does it solve?

2. Why is it necessary?

3. What alternatives were considered?

4. What are the long-term consequences?

5. Does it follow ADR-000?

If not, the decision must be reviewed before implementation.

---

# Change Log

## Version 1.0

Initial architecture decisions established.

- Architecture Principles
- Authentication
- Hybrid Admin Authentication
- Routing
- Middleware
- Better Auth
- Session Management
- Platform Core
- Event Bus
- Security Standards
- Production Rules