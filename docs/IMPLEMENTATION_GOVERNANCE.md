# IMPLEMENTATION_GOVERNANCE.md

Version: 1.0

Status: LOCKED

---

# Purpose

This document defines how implementation work must be executed.

The architecture is defined by:

- MASTER_ARCHITECTURE_BLUEPRINT.md

The implementation order is defined by:

- SPRINT_CMS-01_MILESTONE_A5_EXECUTION_PLAN.md

This document defines:

HOW implementation must be performed.

It is the implementation contract for every future sprint.

---

# Priority

When conflicts occur:

1. MASTER_ARCHITECTURE_BLUEPRINT.md

2. IMPLEMENTATION_GOVERNANCE.md

3. Sprint Documents

4. AI Suggestions

The Blueprint always wins.

---

# Core Principles

Every implementation must follow:

Refactor Before Replace

Reuse Before Create

Single Source of Truth

Configuration over Hardcode

Backward Compatibility

Incremental Migration

One Responsibility per Sprint

Small Review Surface

Documentation First

Architecture First

---

# AI Implementation Rules

Before writing code AI MUST search for:

Existing Components

Existing Hooks

Existing Services

Existing Repositories

Existing APIs

Existing Database Tables

Existing Migrations

Existing Translation Keys

Existing Utilities

Existing Types

If an implementation already exists:

Reuse it.

Do not recreate it.

---

# Duplicate Prevention

AI must never create:

Duplicate Components

Duplicate Services

Duplicate Repositories

Duplicate APIs

Duplicate Utilities

Duplicate Database Tables

Duplicate Translation Keys

Duplicate Types

Duplicate Business Logic

Duplicate Business Data

When duplication is detected:

Stop.

Reuse or refactor.

---

# Sprint Rules

Each sprint has exactly ONE responsibility.

Allowed:

One architectural domain.

Examples:

Repository

Service

Localization

Navigation

CMS

SEO

Performance

Not Allowed:

Repository + Localization

CMS + SEO

Homepage + Database

Infrastructure + CMS

Large mixed implementation.

---

# Definition of Ready

Before implementation starts:

Blueprint approved.

Execution Plan approved.

Sprint scope approved.

Dependencies completed.

Acceptance Criteria defined.

Definition of Done defined.

Rollback strategy available.

Review checklist available.

---

# Implementation Workflow

Every sprint follows:

Planning

↓

Implementation

↓

Self Review

↓

Architecture Validation

↓

Regression Testing

↓

Documentation Update

↓

Approval

↓

Next Sprint

No sprint may skip any step.

---

# Self Review Checklist

Before considering implementation complete:

No duplicated code introduced.

No duplicated business logic.

No duplicated database tables.

No duplicated translation keys.

No hardcoded configuration.

No hardcoded navigation.

No unnecessary Client Components.

No new architecture violations.

No TypeScript errors introduced.

No ESLint errors introduced.

No broken tests.

---

# Architecture Validation

Every sprint must validate:

Single Source of Truth

Business Module Ownership

Website CMS Scope

Repository Pattern

Service Pattern

API Pattern

Localization Strategy

Navigation Strategy

SEO Strategy

Blueprint Compliance

---

# Regression Policy

Every sprint must verify:

Marketing Website

User Dashboard

Admin Panel

Landing Builder

Authentication

Localization

Subscription

Credits

Payment

Voucher

AI Providers

No existing functionality may regress.

---

# Breaking Change Policy

Breaking changes are forbidden unless explicitly approved.

Breaking changes include:

Database schema incompatible changes

API contract changes

Business module ownership changes

Localization format changes

Navigation structure changes

Authentication flow changes

Payment flow changes

If unavoidable:

Document

Review

Approve

Then implement

---

# Migration Policy

Every migration must be:

Incremental

Reversible

Documented

Validated

Tested

Rollback Ready

Never perform destructive migrations without rollback.

---

# Review Policy

Every sprint must generate:

Summary

Files Modified

Architecture Impact

Regression Impact

Remaining Technical Debt

Risks

Recommendations

Next Sprint Input

---

# Documentation Policy

Every implementation updates documentation when required.

Documentation is part of the Definition of Done.

---

# AI Reasoning Policy

AI reasoning must remain concise.

Avoid unnecessary long reasoning.

Focus only on implementation decisions.

Do not consume context with repetitive explanations.

---

# Localization Rules

Every UI change must include:

Translation Keys

English Translation

Indonesian Translation

No untranslated UI is allowed.

Never hardcode user-facing text.

---

# Database Rules

Business Modules own business data.

Website CMS owns presentation.

Never store business data inside CMS configuration.

Repository is the only database access layer.

Services never access the database directly.

Components never access the database.

---

# API Rules

API Routes:

Validation

↓

Service

↓

Repository

↓

Database

API Routes never contain business logic.

---

# Component Rules

Components must remain presentation-only.

Business logic belongs to Services.

Database logic belongs to Repositories.

Rendering logic belongs to Components.

---

# Pull Request Checklist

Every sprint must confirm:

Architecture respected

Blueprint respected

Governance respected

Execution Plan respected

No duplicated code

No duplicated business logic

No duplicated data

Localization complete

Documentation updated

Regression completed

---

# Definition of Done

A sprint is complete only when:

Implementation matches Blueprint.

Governance is respected.

Acceptance Criteria satisfied.

Regression testing passed.

Documentation updated.

Architecture validation passed.

No blocking issues remain.

---

# Stop Conditions

Implementation must stop immediately when:

Blueprint conflict detected.

Business ownership unclear.

Duplicate implementation detected.

Migration risk is unknown.

Regression cannot be validated.

Architecture violation introduced.

Resolve the issue before continuing.

---

# Governance Lock

This document is LOCKED.

Future implementation must comply with this governance.

Changes to this document require architecture review before approval.

This document becomes the authoritative implementation standard for Tamer Studio.