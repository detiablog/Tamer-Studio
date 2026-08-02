# Tamer Studio Documentation

> **From Intent to Production.**

Documentation organizes **product knowledge**, not file locations.

> **Source Code is the Single Source of Truth.**

Documentation explains the implementation.

The root `README.md` defines project philosophy.

This document defines documentation navigation.

---

# Getting Started

1. **Project** — What Tamer Studio is
2. **Architecture** — How the platform is built
3. **Modules** — The business capabilities
4. **Development** — How contributors work
5. **Sprints** — What is being worked on

---

# Project

What Tamer Studio is.

| Topic | Link |
|-------|------|
| Product Overview | [../README.md](../README.md) |
| Product & Brand | [PRODUCT.md](PRODUCT.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |

---

# Architecture

How the platform is built.

| Topic | Link |
|-------|------|
| Architecture Hub | [architecture/](architecture/) |
| Platform Architecture | [PLATFORM/](PLATFORM/) |

---

# Modules

The business capabilities.

| Module | Description | Source |
|--------|-------------|--------|
| **Authentication** | Login, registration, roles, permissions, sessions | `src/core/auth/` |
| **AI Studio** | Image, video, workflows, providers, gateway | `src/core/ai/` |
| **CMS & Content** | Pages, sections, components, media, publishing | `src/core/cms/` |
| **Landing & Homepage** | Landing builder, homepage composition, SEO | `src/core/landing/` |
| **Administration** | Admin dashboard, system config, monitoring | `src/core/admin/` |
| **User Workspace** | Projects, media, history, settings | `src/core/workspace/` |
| **Billing & Commerce** | Credits, subscriptions, payments, invoices | `src/core/billing/` |
| **Localization** | Languages, translations, currencies | `src/core/localization/` |

---

# Development

How contributors work.

| Topic | Link |
|-------|------|
| Developer Hub | [DEVELOPER/](DEVELOPER/) |
| Standards | [STANDARTS/](STANDARTS/) |

---

# Quality

Reviews and readiness.

| Topic | Link |
|-------|------|
| Quality Hub | [QUALITY/](QUALITY/) |

---

# Active Development

Current engineering work.

| Topic | Link |
|-------|------|
| Reports | [REPORTS/](REPORTS/) |
| Audit Reports | [audit/](audit/) |

---

# Sprints

Sprint documentation and history.

| Topic | Link |
|-------|------|
| Sprint Index | [sprints/](sprints/) |

---

# Architecture Decisions

Why important technical decisions were made.

| Topic | Link |
|-------|------|
| ADR Index | [ADR/](ADR/) |

---

# Archive

Historical documentation. Read-only.

| Topic | Link |
|-------|------|
| Archive | [archive/](archive/) |
| Archived Reports | [archive/root-reports/](archive/root-reports/) |
| Sprint Archive | [archive/sprint-docs/](archive/sprint-docs/) |
| Legacy Archive | [99_ARCHIVE/](99_ARCHIVE/) |

---

# Rules

- **Source Code First** — Source code is the Single Source of Truth
- **Explain Implementation** — Documentation explains what exists
- **No Root Markdown** — Never create Markdown in the project root
- **Update Before Create** — Always update existing documentation first
- **Archive Before Delete** — Never permanently delete documentation
- **One Module One Home** — Each module has one documentation location
- **No Duplication** — Never duplicate content across files

Full policy: [documentation-policy.md](documentation-policy.md)

---

# Navigation

**New Developer:** Project README → Architecture → Modules → Development → Sprints → Source Code

**Existing Developer:** Sprints → Quality → Architecture Changes → Implementation

**AI Assistant:** Root README → This Document → Architecture → Module → Source Code → Update Docs

---

# Philosophy

Documentation makes Tamer Studio **understandable**, **maintainable**, and **scalable**.

Fewer documents with higher quality.

Knowledge that is discoverable, not buried.
