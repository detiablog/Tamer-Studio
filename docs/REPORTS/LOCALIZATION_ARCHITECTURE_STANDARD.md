# LOCALIZATION_ARCHITECTURE_STANDARD

Version: 1.0

Status: LOCKED

Authority

MASTER_ARCHITECTURE_BLUEPRINT.md

References

APPLICATION_LAYER_STANDARD.md

INFRASTRUCTURE_ARCHITECTURE_STANDARD.md

IMPLEMENTATION_GOVERNANCE.md

---

# Purpose

This document defines the permanent Localization Architecture Standard for Tamer Studio.

Localization is a platform.

Localization is the single source of truth for

Language

Locale

Currency

Timezone

Formatting

Translation

No module may implement its own localization solution.

---

# Architecture

Browser

↓

Locale Detection

↓

Localization Runtime

↓

Translation Runtime

↓

Application

↓

UI

Every feature must consume this runtime.

---

# Core Principles

Localization must be

Centralized

Reusable

Consistent

Framework-independent whenever practical

Automatically validated

Automatically synchronized

Backward compatible

No duplicated localization logic.

---

# Ownership

Localization owns

Language

Locale

Currency

Timezone

Formatting

Translation Runtime

Translation Cache

Translation Validation

Translation Synchronization

Plural Rules

Interpolation

Fallback Language

Localization Middleware

Localization does NOT own

Business Logic

Repositories

Services

Database Queries

SEO

CMS Business Rules

Authentication

Authorization

Routing Decisions

---

# Localization Runtime

All user-facing text must pass through Translation Runtime.

Never bypass Localization Runtime.

Never read translation files directly inside application modules.

Correct

Component

↓

Translation Runtime

↓

Localization Runtime

↓

Translation Source

Forbidden

Component

↓

JSON File

---

# Translation Source

Source of truth

Current

Localization Runtime

Future

CMS Localization

Applications must never depend directly on JSON dictionaries.

---

# Supported Languages

Languages must be registered centrally.

Every supported language must contain

Identical Key Structure

Adding a new language must not require application code changes.

---

# Translation Keys

Translation keys are immutable identifiers.

Good

auth.login.title

dashboard.header.title

billing.invoice.download

Avoid

login

title

button

welcome1

Never generate inconsistent key structures.

---

# Namespace Rules

Namespaces must represent application domains.

Examples

common

auth

dashboard

workspace

settings

billing

profile

admin

marketing

landing

error

Namespaces must never overlap.

Duplicate namespaces are forbidden.

---

# Synchronization Standard

Whenever a translation key is

Created

Renamed

Moved

Deleted

AI MUST automatically

Update every supported language

Preserve identical hierarchy

Detect missing keys

Detect orphan keys

Detect duplicate keys

Fail validation if synchronization fails

No manual synchronization.

---

# Validation Standard

Validation must automatically detect

Missing Keys

Duplicate Keys

Unused Keys

Broken ICU Syntax

Invalid Placeholders

Invalid Namespace

Invalid Key Naming

Validation failures block completion.

---

# Hardcoded Text Policy

User-facing text must never be hardcoded.

Forbidden

<button>Save</button>

Allowed

t("common.save")

Exceptions

Debug logs

Developer tools

Internal comments

Test fixtures

---

# Locale Detection

Priority

User Preference

↓

Workspace Preference

↓

Organization Preference

↓

Cookie

↓

Accept-Language

↓

Default Locale

GeoIP may be added later.

Locale detection must remain centralized.

---

# Currency Standard

Currency is independent from language.

Examples

English + IDR

English + USD

Indonesia + USD

Currency must be resolved by Currency Runtime.

No module may determine currency independently.

---

# Formatting Standard

Formatting Runtime owns

Date

Time

Currency

Number

Relative Time

Timezone

All formatting must use Localization Runtime.

---

# Translation Cache

Translation Cache owns

Dictionary Cache

Namespace Cache

Cache Invalidation

Hot Reload

Statistics

Application modules must never cache translations themselves.

---

# CMS Integration

CMS must be localization-aware.

Editable content must support

Multiple Languages

Fallback Language

Translation Status

Publish Status

Localization metadata belongs to CMS.

Translation logic belongs to Localization Platform.

---

# Admin Translation Management

Administration may

Search Keys

Edit Translation

Publish

Rollback

Validate

View Missing Keys

View Duplicate Keys

Future versions may include

Version History

Approval Workflow

Audit Timeline

---

# Middleware Rules

Localization Middleware may

Resolve Locale

Resolve Currency

Resolve Timezone

Resolve Formatting

Populate RequestContext

Localization Middleware must never

Authorize Users

Perform Business Validation

Query Repositories

---

# API Rules

APIs must return

Translation Keys

or

Already Localized Responses

Do not return mixed localization strategies.

Maintain consistency across all APIs.

---

# Dependency Rules

Allowed

Application

↓

Localization

Infrastructure

↓

Localization

CMS

↓

Localization

Forbidden

Localization

↓

Repository

Localization

↓

Database

Localization

↓

Business Services

Localization

↓

SEO Runtime

Localization

↓

UI Components

Localization remains independent.

---

# AI Development Rules

Whenever AI creates

Page

Component

Dialog

Form

Email

Notification

Toast

Validation Message

AI MUST

Create translation key

Update every supported language

Validate synchronization

Use Translation Runtime

Remove hardcoded strings

Fail implementation if synchronization fails.

---

# Testing Standard

Localization must be tested for

Locale Detection

Fallback Language

Translation Lookup

Formatting

Currency

Timezone

Synchronization

Validation

Cache

No feature is complete without localization tests.

---

# Documentation Standard

Every new namespace must document

Purpose

Owner

Supported Keys

Dependencies

Migration Notes

No undocumented namespace may be added.

---

# Architecture Decision Records

ADR required when changing

Localization Runtime

Translation Runtime

Translation Source

Synchronization Tool

Validation Rules

Locale Detection

Formatting Runtime

Currency Runtime

Translation Cache

Namespace Structure

---

# Code Review Checklist

Before merging verify

✓ No hardcoded user-facing text

✓ Translation Runtime used

✓ All languages synchronized

✓ Validation passes

✓ Namespace correct

✓ ICU valid

✓ Placeholders valid

✓ Cache preserved

✓ Tests updated

✓ Documentation updated

---

# Definition of Done

Localization is compliant when

Every feature consumes Localization Runtime.

Every language shares identical key structure.

No duplicated localization exists.

No hardcoded user-facing text exists.

Synchronization succeeds.

Validation succeeds.

Architecture remains compliant.

---

# Governance Lock

This document is LOCKED.

Localization Architecture may only change through

1. Architecture Review

2. ADR Approval

3. Blueprint Compliance Review

No implementation may violate this standard.