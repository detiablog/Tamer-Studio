# Navigation Registry Specification

Version: 1.0

Status: Active

Owner: Tamer Studio

Last Updated: YYYY-MM-DD

---

# Related Documents

- ARCHITECTURE.md
- ENGINEERING_PLAYBOOK.md
- DEVELOPMENT.md
- MODULE_DEVELOPMENT_STANDARD.md
- MODULE_MANIFEST_SPEC.md
- PERMISSION_SYSTEM_SPEC.md
- ADR-013 — Navigation & Information Architecture

---

# 1. Purpose

This document defines the canonical Navigation Registry for Tamer Studio.

The Navigation Registry is the single source of truth for all navigable resources within the platform.

It provides a centralized model consumed by the user interface, runtime services, AI tooling, plugins, and future platform extensions.

Navigation definitions must never be duplicated across modules.

---

# 2. Scope

The Navigation Registry applies to:

- Admin Panel
- User Panel
- Dashboard
- Sidebar
- Breadcrumb
- Command Palette
- Search
- Mobile Navigation
- Plugin Navigation
- AI Assistant
- Documentation
- Future Applications

Every navigable destination must be registered.

---

# 3. Philosophy

Navigation is platform infrastructure.

Business Capability

↓

Module

↓

Manifest

↓

Navigation Registry

↓

Platform UI

↓

User Experience

Navigation exists independently of visual components.

UI renders Navigation.

Navigation does not render UI.

---

# 4. Core Principles

The Navigation Registry follows these principles.

Single Source of Truth

↓

Manifest Driven

↓

Permission Aware

↓

Feature Flag Aware

↓

Searchable

↓

Composable

↓

Extensible

↓

AI Readable

---

# 5. Navigation Architecture

Business Module

↓

Module Manifest

↓

Navigation Registry

↓

Consumers

↓

Sidebar

Breadcrumb

Dashboard

Search

Command Palette

Plugin

AI Assistant

Documentation

Every consumer reads from the same registry.

---

# 6. Navigation Entity

Every navigation item represents one logical destination.

Each item contains:

- identity
- hierarchy
- route
- metadata
- permissions
- visibility
- ordering

Navigation items are immutable during runtime except through approved registration mechanisms.

---

# 7. Navigation Schema

Conceptual schema

{
  "id": "...",
  "module": "...",
  "parent": "...",
  "title": "...",
  "description": "...",
  "route": "...",
  "icon": "...",
  "order": 0,
  "permission": "...",
  "featureFlag": "...",
  "hidden": false,
  "searchable": true,
  "favorite": true,
  "tags": [],
  "breadcrumbs": [],
  "metadata": {}
}

Schema extensions must preserve backward compatibility.

---

# 8. Navigation Identity

Every navigation item MUST have:

- globally unique id
- stable route
- module ownership
- immutable identity

Examples

dashboard

wallet

wallet-history

affiliate-center

IDs should use kebab-case.

---

# 9. Navigation Hierarchy

Navigation supports parent-child relationships.

Dashboard

↓

Wallet

↓

History

↓

Transactions

↓

Transaction Detail

Hierarchy should remain acyclic.

Circular navigation is prohibited.

---

# 10. Route Binding

Every navigation item references exactly one canonical route.

Example

/admin/wallet

/admin/wallet/history

/admin/wallet/history/[id]

Routes must not be duplicated.

---

# 11. Permission Integration

Navigation integrates with the Permission System.

Visibility depends on authorization.

Example

wallet.view

If permission evaluation fails:

Navigation is not rendered.

Permissions should never be checked directly inside UI components.

---

# 12. Feature Flag Integration

Navigation integrates with Feature Flags.

Disabled features remain registered.

Visibility depends on runtime evaluation.

Feature Flags should not modify the Navigation Registry.

---

# 13. Metadata

Navigation metadata includes:

- icon
- description
- category
- keywords
- badge
- tooltip
- color
- analytics id

Metadata improves discoverability.

---

# 14. Breadcrumb Integration

Breadcrumbs are generated automatically.

Dashboard

↓

Wallet

↓

History

↓

Transaction

Breadcrumbs should never be hardcoded.

---

# 15. Search Integration

Navigation powers platform search.

Search indexes:

- title
- description
- keywords
- aliases
- tags

Search results link directly to Navigation items.

---

# 16. Command Palette Integration

Command Palette consumes Navigation Registry.

Examples

Go to Wallet

Open Affiliate

Create Product

Generate Image

The palette should never define commands independently from Navigation.

---

# 17. Dashboard Integration

Dashboard cards reference Navigation items.

Quick Actions

↓

Navigation

↓

Route

↓

Execution

Dashboard should not duplicate navigation configuration.

---

# 18. AI Consumption Rules

AI Coding Agents consume Navigation Registry to understand:

- available modules
- page hierarchy
- routes
- dashboard organization
- navigation groups
- search behavior

AI should generate navigation entries instead of manually editing UI components.

---

# 19. Runtime Consumption

The Navigation Registry is consumed by:

- Sidebar
- Dashboard
- Breadcrumb
- Search
- Command Palette
- Plugin Runtime
- Mobile Navigation
- Documentation Generator
- Analytics
- AI Runtime

Consumers should never maintain duplicate navigation definitions.

---

# 20. Plugin Integration

Plugins register navigation through the Navigation Registry.

Plugin

↓

Manifest

↓

Navigation Registration

↓

Registry

↓

Platform UI

Plugins must never directly modify navigation components.

---

# 21. Validation Rules

A valid Navigation Registry satisfies:

✓ Unique IDs

✓ Unique Routes

✓ Parent Exists

✓ No Circular References

✓ Valid Permissions

✓ Valid Feature Flags

✓ Valid Ordering

✓ Manifest Ownership

Validation failures block registration.

---

# 22. Future Extensions

The Navigation Registry supports future capabilities:

- Favorites
- Recent Pages
- Pinned Navigation
- Workspace Navigation
- Multi-Tenant Navigation
- Mobile Apps
- AI Navigation Suggestions
- Voice Commands
- Command Macros
- Documentation Explorer

---

# 23. Validation Checklist

Before approval:

□ IDs unique

□ Routes unique

□ Parent valid

□ Permissions registered

□ Feature Flags registered

□ Breadcrumb valid

□ Search metadata complete

□ Ordering validated

□ Runtime integration complete

---

# 24. Definition of Done

Navigation Registry is complete when:

✓ Runtime consumes navigation

✓ Sidebar generated

✓ Dashboard generated

✓ Breadcrumb generated

✓ Search generated

✓ Command Palette generated

✓ AI tooling integrated

✓ Documentation updated

✓ Validation passes

---

# Final Principles

The Navigation Registry is not a sidebar configuration.

It is the canonical navigation model of the platform.

Every navigable destination must originate from the Navigation Registry.

All platform consumers—including UI, runtime services, plugins, search, dashboards, and AI tooling—must derive navigation from this single source of truth.

This architecture eliminates duplication, improves consistency, simplifies automation, and enables the platform to scale without fragmenting navigation logic.