# Tamer Studio Architecture

Version: 2.0
Status: Active
Owner: Tamer Studio
Last Updated: YYYY-MM-DD

---

# 1. Purpose

This document defines the official architecture of the Tamer Studio platform.

Its purpose is to ensure that every feature, module, service, API, and AI workflow follows a single architectural vision.

No implementation may violate this document without an approved Architecture Decision Record (ADR).

---

# 2. Architecture Philosophy

Tamer Studio follows these principles:

- Modular
- Scalable
- API First
- AI First
- Security by Design
- Documentation Driven Development
- Separation of Concerns
- Low Coupling
- High Cohesion
- Reuse Before Create

---

# 3. High-Level Architecture

                   User
                     │
                     ▼
            Next.js Frontend
                     │
                     ▼
              API Layer (Route)
                     │
                     ▼
          Application Service Layer
                     │
                     ▼
             Business Domain Layer
                     │
                     ▼
          Repository / Data Access
                     │
                     ▼
              PostgreSQL Database

                     │
                     ▼

          AI Gateway Abstraction Layer
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Kilo Gateway   OpenRouter     Direct Provider
                                     │
                      ┌──────────────┼──────────────┐
                      ▼              ▼              ▼
                   OpenAI        Gemini        Other Models

---

# 4. Layer Responsibilities

## 4.1 Presentation Layer

Responsibilities:

- UI
- Forms
- Dashboard
- User Experience
- Client Validation

Must NOT:

- Business Logic
- Database Access

---

## 4.2 API Layer

Responsibilities:

- Request Validation
- Authentication
- Authorization
- API Versioning
- Response Formatting

Must NOT:

- Complex Business Logic

---

## 4.3 Service Layer

Responsibilities:

- Business Rules
- Transactions
- Workflow
- Orchestration

Must NOT:

- Direct SQL
- UI Logic

---

## 4.4 Repository Layer

Responsibilities:

- Database Query
- CRUD
- ORM

Must NOT:

- Business Logic

---

## 4.5 Database Layer

Responsibilities:

- Data Persistence
- Index
- Constraint
- Migration

---

# 5. Core Modules

The platform consists of the following primary modules.

## Authentication

- Login
- Register
- Session
- Better Auth
- RBAC

---

## User

- Profile
- Preferences
- Language
- Currency

---

## Wallet

- Balance
- Top Up
- Transaction
- Payment

---

## Billing

- Invoice
- Payment Gateway
- Subscription

---

## AI Gateway

- Provider Selection
- Fallback
- Retry
- Logging
- Cost Tracking

---

## Image Generation

- Prompt Builder
- Image Generation
- History

---

## Video Generation

- Storyboard
- Prompt Builder
- Video Generation
- Progress
- Export

---

## Credits

- Usage
- Purchase
- Expiration

---

## Affiliate

- Referral
- Commission
- Withdrawal

---

## Loyalty

- Point
- Voucher
- Reward

---

## Admin

- Dashboard
- Users
- Products
- Orders
- Credits
- AI Providers
- Reports

---

# 6. AI Gateway Architecture

Every AI request must pass through the Gateway.

User

↓

Gateway Runtime

↓

Provider Selection Engine

↓

Circuit Breaker

↓

Fallback Engine

↓

Provider

Never connect frontend directly to AI providers.

---

# 7. Security Architecture

Authentication

↓

Authorization

↓

RBAC

↓

Rate Limiter

↓

Input Validation

↓

Audit Log

↓

Monitoring

Every protected endpoint follows this chain.

---

# 8. Folder Architecture

Example:

src/

app/

components/

features/

services/

repositories/

hooks/

lib/

types/

utils/

middleware/

No business logic inside components.

No SQL inside services.

---

# 9. API Standards

Every endpoint must:

Validate Input

Authenticate

Authorize

Log Errors

Return Standard Response

Version if Breaking Change

---

# 10. Database Standards

Use:

PostgreSQL

Drizzle ORM

Migration Versioning

Foreign Keys

Indexes

Soft Delete where appropriate

Audit Tables when required

---

# 11. Integration Standards

External services must be isolated.

Examples:

Payment

AI Provider

Email

Storage

Notification

Every integration requires an abstraction layer.

---

# 12. Scalability Strategy

Support:

Multiple AI Providers

Multi-language

Multi-currency

Feature Flags

Future Mobile App

Horizontal Scaling

---

# 13. Architecture Constraints

Never bypass Service Layer.

Never bypass Repository Layer.

Never expose Provider API directly.

Never duplicate Business Logic.

Never create circular dependencies.

Never couple unrelated modules.

---

# 14. Architecture Review

Architecture review is mandatory when:

New Module

Database Change

Authentication Change

Payment Change

AI Gateway Change

Major Refactoring

---

# 15. Related Documents

PRODUCT.md

PROJECT_CONTEXT.md

GOVERNANCE.md

ENGINEERING_PLAYBOOK.md

AI_GATEWAY_ARCHITECTURE.md

ADR/

---

# 16. Architecture Principles Summary

Every implementation must satisfy:

✓ Simplicity

✓ Scalability

✓ Maintainability

✓ Security

✓ Modularity

✓ Reusability

✓ Consistency

If any principle is violated, an ADR is required before implementation.