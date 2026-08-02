# Tamer Studio

> **From Intent to Production.**

AI-powered Content Production Studio that transforms ideas into production-ready content through an intelligent AI workflow.

---

# Vision

Build the easiest AI-powered content production platform for creators, affiliate marketers, businesses, and teams.

Tamer Studio enables users to generate high-quality images, videos, affiliate content, and drama productions from natural language while keeping the workflow simple, scalable, and production-ready.

---

# Mission

Transform ideas into production-ready content using an integrated AI production workflow.

Rather than providing isolated AI tools, Tamer Studio focuses on complete production pipelines that guide users from idea to final published content.

---

# Core Principles

## Intent First

Users describe what they want.

AI understands the intent and assists throughout the production workflow.

---

## Production First

Every feature exists to support a complete production workflow.

The goal is finished content, not isolated AI interactions.

---

## Simplicity First

Complexity should always be hidden behind intuitive user experiences.

Every feature should reduce user effort.

---

## Single Source of Truth

Every business entity must have one authoritative implementation.

Avoid duplicate:

- Business Logic
- Components
- APIs
- Services
- Database Schema
- Configuration
- Documentation

---

## Human in Control

AI accelerates production.

Humans always make the final decisions.

---

## Reproducible

Every production should be reproducible, auditable, editable, and traceable.

---

# Current Development Status

> **Current Stage:** Active Development

Current priorities:

- Architecture Cleanup
- Documentation Governance
- Environment Standardization
- Database Synchronization
- Admin Dashboard Redesign
- Landing Builder Redesign
- Landing Page Redesign
- User Dashboard Redesign
- AI Workflow Optimization

The current objective is improving product quality before introducing additional features.

---

# Technology Stack

## Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- next-themes

## Backend

- Next.js API Routes
- Better Auth
- PostgreSQL
- Drizzle ORM

## Development

- pnpm
- Docker
- Docker Compose

---

# Quick Start

## Requirements

- Node.js >= 22
- pnpm
- PostgreSQL

---

## Installation

```bash
pnpm install
```

---

## Environment

```bash
cp .env.example .env.local
```

Fill every required environment variable before starting development.

---

## Development

```bash
pnpm dev
```

---

## Production Build

```bash
pnpm build
```

---

## Type Check

```bash
pnpm typecheck
```

---

## Lint

```bash
pnpm lint
```

---

# Project Structure

```
src/
config/
drizzle/
public/
locales/
docs/

package.json
next.config.ts
tsconfig.json
```

The project structure may evolve, but the architecture should remain clean, modular, and maintainable.

---

# Documentation

All documentation belongs inside:

```
docs/
```

Recommended structure:

```
docs/

README.md

architecture/

modules/

audit/

verification/

reports/

sprint/

release/

adr/

deployment/

archive/
```

Documentation must never be created in the project root.

---

# Development Rules

These rules apply to every contributor, including AI coding assistants.

---

## Source Code First

Source code is the Single Source of Truth.

Documentation must always reflect the latest implementation.

Never modify source code to match outdated documentation.

Always update documentation to match the implementation.

---

## Analyze Before Modify

Before changing anything:

- Read the related source code.
- Read the related services.
- Read the repositories.
- Read the database schema.
- Read the current documentation.
- Understand the module.

Never modify code without understanding the existing implementation.

---

## Existing Implementation First

Before implementing any feature:

Determine whether the feature already exists.

If it exists:

- Improve it.
- Refactor it.
- Extend it.

Never create a parallel implementation unless explicitly instructed.

---

## Reuse Before Create

Always reuse existing:

- Components
- Services
- Repository
- Hooks
- Utilities
- Database Schema

before creating new ones.

---

## Refactor Before Rewrite

Never replace an entire module if a refactor is sufficient.

Prefer:

Improve

↓

Refactor

↓

Optimize

instead of:

Delete

↓

Rewrite

↓

Duplicate

---

## Project Health First

Before implementing new functionality, evaluate:

1. Architecture
2. Database
3. Environment
4. Synchronization
5. Existing UI
6. Existing Services
7. Existing Documentation

Only introduce new functionality when the existing implementation is healthy.

---

## Documentation Policy

Documentation belongs only inside:

```
docs/
```

Never create Markdown files in the project root.

Always update existing documentation before creating a new one.

Archive obsolete documentation instead of deleting it.

---

## Environment Policy

Never hardcode:

- localhost
- API URLs
- Secrets
- Database connections
- Callback URLs

Always use environment variables.

The application must always remain production-ready.

---

## Database Policy

Database changes must:

- Use Drizzle migrations
- Preserve existing data
- Avoid duplicate schema
- Maintain synchronization
- Maintain backward compatibility whenever possible

---

## Localization Policy

All user-facing text must be localized.

Never hardcode visible strings.

Every new UI component must support localization.

---

## UI Policy

Improve existing pages before creating new pages.

Consistency is more valuable than adding features.

Every page should follow the same design system.

---

## Evolution Over Replacement

Tamer Studio is one continuously evolving product.

Do not treat every sprint as a new project.

Every sprint should strengthen the existing architecture.

Prefer incremental improvements over complete rewrites.

Maintain compatibility whenever possible.

---

# Development Workflow

Every implementation should follow this workflow.

```
Understand

↓

Audit

↓

Plan

↓

Implement

↓

Verify

↓

Update Documentation
```

Never skip the understanding phase.

---

# Project Lifecycle

Development should generally follow this order:

```
Architecture

↓

Database

↓

Environment

↓

Authentication

↓

Admin Dashboard

↓

Landing Builder

↓

Landing Page

↓

User Dashboard

↓

AI Studio

↓

Testing

↓

Release
```

Do not introduce large features before the underlying architecture is stable.

---

# Documentation Workflow

Every documentation update follows this order:

```
Read Source Code

↓

Validate Existing Documentation

↓

Update Existing Documentation

↓

Archive Obsolete Documents

↓

Update Documentation Index
```

Never generate documentation from assumptions.

---

# Quality Standards

Every implementation should satisfy the following:

- Clean Architecture
- Single Source of Truth
- Production Ready
- No Hardcoded Configuration
- Reusable Components
- Consistent UI
- Database Synchronization
- Localization Support
- Documentation Updated
- No Duplicate Implementation

---

# Current Focus

The current focus of Tamer Studio is:

1. Architecture Quality
2. Documentation Governance
3. Database Stability
4. Environment Consistency
5. UI/UX Consistency
6. AI Production Workflow
7. Production Readiness

Feature quantity is less important than overall product quality.

---

# License

Private Repository

Copyright © Tamer Studio.