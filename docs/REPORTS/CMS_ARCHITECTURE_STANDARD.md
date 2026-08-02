# CMS_ARCHITECTURE_STANDARD

Version: 1.0

Status: LOCKED

Authority

MASTER_ARCHITECTURE_BLUEPRINT.md

References

IMPLEMENTATION_GOVERNANCE.md

APPLICATION_LAYER_STANDARD.md

INFRASTRUCTURE_ARCHITECTURE_STANDARD.md

LOCALIZATION_ARCHITECTURE_STANDARD.md

---

# Purpose

This document defines the permanent CMS Architecture Standard for Tamer Studio.

The CMS Engine is the single source of truth for every editable content.

No module may implement its own content management system.

No page may bypass the CMS Engine.

---

# Architecture

Admin Panel

↓

CMS Engine

↓

Content Registry

↓

Page Registry

↓

Localization Platform

↓

Infrastructure

↓

Repository

↓

Database

All editable content must follow this architecture.

---

# Core Principles

CMS must be

Centralized

Reusable

Modular

Versioned

Permission-aware

Localization-aware

SEO-aware

Auditable

Extensible

No duplicated CMS implementation.

---

# CMS Ownership

CMS owns

Pages

Sections

Blocks

Components

Navigation Content

Landing Content

Homepage Content

Email Templates

Prompt Templates

Media Metadata

Version History

Publishing

Draft Workflow

Preview

Audit

Permissions

Content Scheduling

Soft Delete

Restore

CMS does NOT own

Business Logic

Repositories

Infrastructure

Authentication

Authorization Decisions

Localization Runtime

SEO Runtime

Payment

AI Runtime

Analytics

---

# Content Registry

Every editable content must be registered.

Supported content types

Page

Section

Block

Component

Media

Template

Navigation

Email Template

AI Prompt Template

Future content types must be registered before use.

No unregistered content may exist.

---

# Page Registry

Every page must contain

ID

Title

Slug

Status

Visibility

Permissions

Localization

SEO Metadata

Version

Author

Parent

Pages must never exist outside the registry.

---

# Component Library

Every reusable component must contain

Schema

Properties

Validation

Preview

Localization

Permissions

Category

Version

Deprecated Flag

Migration Strategy

Components must never be hardcoded into CMS.

---

# Section Standard

Every section must support

Drag & Drop

Sorting

Visibility

Locking

Configuration

Styles

Media

Localization

Validation

Sections must be reusable.

---

# Versioning Standard

Every editable content must support

Draft

Published

Archived

Scheduled

Version History

Rollback

Diff

Publishing must always create a version.

Version history must never be lost.

---

# Publishing Pipeline

Every publish operation must pass through

Schema Validation

↓

Localization Validation

↓

SEO Validation

↓

Asset Validation

↓

Broken Link Validation

↓

Permission Validation

↓

Publish

↓

Cache Invalidation

↓

Search Index Update

↓

Audit Log

Direct publishing is forbidden.

---

# Permission Standard

Permissions must support

Read

Write

Publish

Delete

Restore

Future capability-based permissions are recommended.

Permissions must be centralized.

---

# Audit Standard

Every CMS action must be logged.

Minimum actions

Create

Edit

Publish

Rollback

Delete

Restore

Every audit entry must contain

Content ID

Content Type

Author

Timestamp

Metadata

Audit logs must be immutable.

---

# Localization Integration

CMS must consume

Localization Runtime

Translation Runtime

LocalizedCMSContent

CMS must never implement its own localization logic.

---

# SEO Integration

CMS stores

SEO Title

Description

Canonical

Robots

OpenGraph

Twitter Card

Schema Metadata

SEO Runtime consumes CMS metadata.

CMS does not generate SEO.

---

# Media Integration

CMS must use centralized Media Library.

Supported media

Images

Videos

Documents

Folders

Media metadata belongs to CMS.

Storage belongs to Infrastructure.

---

# Navigation Integration

Navigation is CMS content.

Menus

Footer

Sidebar

Header

Breadcrumb

must all be editable through CMS.

No hardcoded navigation.

---

# Landing Integration

Landing Builder must consume CMS.

Landing Builder is NOT a CMS.

Landing Builder edits CMS content.

Landing Builder must not create parallel storage.

---

# Homepage Integration

Homepage content must come from CMS.

No homepage section may bypass CMS.

---

# Email Templates

Email templates must be editable.

Every template supports

Localization

Variables

Versioning

Preview

Publishing

---

# AI Prompt Templates

Prompt templates are CMS content.

Every prompt template supports

Localization

Variables

Versioning

Preview

Publishing

---

# API Standard

All CMS APIs must use

DTO Validation

Permission Middleware

Standard Response

Audit Logging

Localization Support

Pagination

Filtering

Sorting

No endpoint may bypass CMS Service.

---

# Dependency Rules

Allowed

Application

↓

CMS

Localization

↓

CMS

Infrastructure

↓

CMS

Forbidden

CMS

↓

Repository Direct Access

CMS

↓

Database Direct Access

CMS

↓

Localization Implementation

CMS

↓

SEO Runtime

CMS

↓

Infrastructure Implementation

---

# Hardcoded Content Policy

Editable content must never be hardcoded.

Forbidden

Landing text

Homepage text

Navigation labels

Pricing

FAQ

Testimonials

Email content

Prompt templates

Allowed

Static developer documentation

Internal comments

Test fixtures

---

# AI Development Rules

Whenever AI creates editable content

AI MUST

Register content

Register schema

Register permissions

Register localization

Register metadata

Register version

Register audit

Register publishing

Never bypass CMS.

---

# Testing Standard

CMS must be tested for

CRUD

Versioning

Publishing

Rollback

Localization

Permissions

Audit

API

Registry

Search

Media Integration

No CMS feature is complete without tests.

---

# Documentation Standard

Every new content type must document

Purpose

Schema

Dependencies

Permissions

Localization

Publishing

Migration

No undocumented content type may be added.

---

# Architecture Decision Records

ADR required when changing

CMS Core

Content Registry

Page Registry

Component Library

Publishing Pipeline

Versioning

Permission Model

Audit Model

Media Integration

Content Schema

---

# Code Review Checklist

Before merging verify

✓ No duplicate CMS

✓ No duplicate registry

✓ No duplicate publishing flow

✓ No duplicate versioning

✓ No hardcoded editable content

✓ Localization integrated

✓ SEO metadata present

✓ Permissions enforced

✓ Audit enabled

✓ Tests updated

✓ Documentation updated

---

# Definition of Done

CMS is compliant when

Every editable content is managed by the CMS Engine.

Every page is registered.

Every publish operation uses Publishing Pipeline.

Every content supports versioning.

Every content supports localization.

Every content supports permissions.

Every content supports audit.

No parallel CMS implementation exists.

Architecture remains compliant.

---

# Governance Lock

This document is LOCKED.

Changes to CMS Architecture require

1. Architecture Review

2. Architecture Decision Record (ADR)

3. Blueprint Compliance Review

No implementation may violate this standard.