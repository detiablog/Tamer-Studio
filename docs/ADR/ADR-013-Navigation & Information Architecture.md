# ADR-013 — Navigation & Information Architecture

**Status**: Accepted

**Version**: 1.0

**Date**: 2026-07

**Owner**: Tamer Studio Architecture Team

**Supersedes**: None

**Related ADR**

- ADR-000 — Architecture Principles
- ADR-007 — Platform Core
- ADR-009 — Security Standards
- ADR-011 — AI Platform Core

---

# 1. Purpose

This ADR defines the official Navigation & Information Architecture of Tamer Studio.

Navigation is considered part of the platform architecture rather than a visual user interface component.

Every navigation item represents a complete application module with its own lifecycle, permissions, routing, dashboard, services, and documentation.

This document establishes a single architectural standard for navigation across:

- Admin Platform
- User Platform
- Future Mobile Applications
- Public Portal
- AI Coding Agents
- Internal Developer Teams

---

# 2. Vision

Tamer Studio follows a **Module-First Architecture**.

Users do not navigate between pages.

Users navigate between business modules.

Each module owns:

- Navigation
- Route
- Layout
- Dashboard
- Permission
- Metadata
- Components
- Services
- Tests
- Documentation

Navigation is therefore an architectural concern.

---

# 3. Goals

This architecture exists to achieve the following goals.

## Consistency

Every module behaves identically.

---

## Discoverability

Users should immediately understand where functionality belongs.

---

## Scalability

The navigation system must support hundreds of modules without redesign.

---

## Maintainability

Navigation changes should only require updating one source.

---

## AI Generation

AI Coding Agents must be able to generate complete modules directly from the Navigation Registry.

---

## Security

Permissions must be tied to navigation.

A user should never see a menu they cannot access.

---

## Extensibility

Future plugin modules must automatically integrate into the navigation hierarchy.

---

# 4. Architecture Principles

## Principle 1

Navigation is Architecture.

It is not presentation.

---

## Principle 2

Every menu is a module.

Never create navigation items that are not backed by an application module.

---

## Principle 3

Every module owns its route.

No route may belong to multiple modules.

---

## Principle 4

Every parent module has an Overview Dashboard.

Parent pages are not empty containers.

---

## Principle 5

Navigation is generated.

Never hardcode navigation in UI components.

---

## Principle 6

Navigation Registry is the Single Source of Truth.

Sidebar

Breadcrumb

Search

Quick Actions

Permissions

Metadata

must originate from the Navigation Registry.

---

## Principle 7

No dead links.

Every navigation item must point to an implemented module.

Placeholder pages are prohibited.

---

## Principle 8

Permission drives visibility.

Menus are filtered through the Permission Engine.

---

## Principle 9

Navigation must remain platform independent.

The same registry should support:

- Web
- Mobile
- Desktop
- API Documentation
- AI Generator

---

# 5. Navigation Hierarchy

The platform follows this hierarchy.

Application

↓

Navigation Registry

↓

Navigation Tree

↓

Module

↓

Dashboard

↓

Child Modules

↓

Components

↓

Services

↓

Repository

↓

Database

---

# 6. Information Architecture

The platform contains two primary navigation systems.

## Admin Platform

Platform Operations Center

Responsible for operating Tamer Studio.

Contains:

Overview

Users

Workspace

AI Platform

Assets

Jobs

Workflow

Commerce

Support

Monitoring

Security

Configuration

---

## User Platform

Creator Workspace

Responsible for content production.

Contains:

Dashboard

Workspace

Projects

AI Studio

Assets

Workflow

Marketplace

Billing

Analytics

Notifications

Settings

---

# 7. Module Hierarchy

Each module consists of three levels.

Level 1

Platform

↓

Level 2

Module

↓

Level 3

Submodule

Example

Configuration

↓

Storage

↓

Cloudflare R2

---

# 8. Parent Module Standard

Every parent module MUST contain:

Overview Dashboard

Module Description

Quick Actions

Statistics

Recent Activity

Navigation Cards

Child Navigation

Search

Permission Validation

Status Indicators

Recent Changes

Health Information (where applicable)

Parent modules must never directly expose implementation details.

Their primary responsibility is orchestration and navigation.

---

# 9. Child Module Standard

Each child module is independently deployable.

Each child module owns:

Route

Permission

Metadata

Loading UI

Error UI

Components

Services

Tests

Documentation

No child module may rely on another child module's implementation.

---

# 10. Navigation Registry

Navigation Registry is the only authoritative source for navigation.

The registry defines:

Module ID

Title

Description

Route

Icon

Order

Permission

Feature Flag

Children

Search Metadata

Dashboard Support

Quick Action Support

Visibility Rules

The UI must never hardcode these values.

---

# 11. Dashboard Philosophy

Every parent route represents a dashboard.

Dashboard responsibilities:

Introduce the module

Display health

Display summaries

Expose quick actions

Provide navigation

Surface recent activity

Offer entry points into child modules

A dashboard must never function as an empty redirect page.

---

# 12. Route Convention

Routes follow the hierarchy.

Example

/admin/configuration

/admin/configuration/general

/admin/configuration/storage

/admin/configuration/email

/admin/configuration/integrations

Each route belongs to exactly one module.

---

# 13. Breadcrumb Architecture

Breadcrumbs are automatically generated.

Never hardcode breadcrumbs.

Example

Dashboard

>

Configuration

>

Storage

Breadcrumbs originate from the Navigation Registry.

---

# 14. Search Integration

Global Search must use the Navigation Registry.

Every searchable module exposes:

Title

Description

Keywords

Permission

Route

Search results must respect permissions.

---

# 15. Permission Integration

Navigation integrates directly with the Permission Engine.

Navigation

↓

Permission Map

↓

Role

↓

Workspace

↓

Feature Flag

↓

Visible Navigation

A module without permission is invisible.

---

# 16. Feature Flags

Navigation supports feature flags.

Hidden modules remain registered.

Visibility depends upon:

Feature Flag

License

Subscription

Workspace

Environment

Experimental Status

---

# 17. Responsive Navigation

Navigation must support:

Desktop Sidebar

Tablet Navigation

Mobile Drawer

Command Palette

Search Navigation

Quick Navigation

All originate from the Navigation Registry.

---

# 18. Accessibility

Navigation must comply with WCAG.

Requirements:

Keyboard Navigation

Focus Management

ARIA Labels

Screen Reader Support

Visible Focus Indicators

Logical Navigation Order

---

# 19. AI Coding Integration

AI Coding Agents must never invent navigation.

Instead, AI reads the Navigation Registry.

From a registered module AI generates:

Route

Layout

Dashboard

Breadcrumb

Metadata

Permission

Loading

Error

Empty State

Responsive Layout

Tests

Documentation

Navigation Registry is therefore considered an architectural contract between the platform and AI Coding Agents.

---

# 20. Prohibited Practices

The following are prohibited.

Hardcoded sidebar menus

Hardcoded breadcrumbs

Hardcoded permissions

Placeholder pages

Empty parent dashboards

Dead links

Duplicate routes

Duplicate modules

Duplicate navigation trees

UI-controlled permissions

Orphan pages

---

# 21. Future Extensions

The architecture is designed to support:

Plugin Marketplace

Third-party Modules

Enterprise Extensions

Module Store

Micro Frontends

AI-generated Modules

Multi-tenant Navigation

White-label Platforms

Native Mobile Applications

---

# 22. Architecture Validation

A Navigation Architecture implementation is valid only if:

✓ Every menu represents a module

✓ Every module has a route

✓ Every parent has a dashboard

✓ Every child has its own page

✓ Navigation Registry is the single source of truth

✓ Breadcrumbs are generated

✓ Permissions are registry-driven

✓ Feature flags are supported

✓ Responsive navigation is supported

✓ Accessibility requirements are met

✓ AI Coding Agents can generate modules from the registry

---

# 23. Consequences

## Positive

- Consistent navigation across the platform.
- Faster feature development.
- Easier onboarding for developers.
- AI Coding Agents can generate modules automatically.
- Simplified maintenance.
- Clear separation of concerns.
- Scalable to hundreds of modules.

## Trade-offs

- Initial implementation requires more planning.
- Navigation Registry becomes critical infrastructure.
- All modules must follow the architecture, even for small features.

These trade-offs are accepted because they provide long-term consistency, maintainability, and scalability.

---

# 24. Definition of Done

This ADR is considered implemented when:

- Navigation Registry is the single source of truth.
- All navigation is generated from the registry.
- Parent modules implement overview dashboards.
- Child modules implement independent routes.
- Permissions are integrated with navigation.
- Breadcrumbs are generated automatically.
- AI Coding Agents consume the registry without additional configuration.
- No placeholder pages exist.
- No dead links exist.
- Navigation architecture is adopted across Admin and User platforms.