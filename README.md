# Tamer Studio

> **From Intent to Production.**

AI-powered Production Operating System that transforms ideas into production-ready content.

---

## Vision

Build the operating system for AI-powered content production.

Tamer Studio enables creators and businesses to generate high-quality affiliate and drama content through an intelligent production workflow.

---

## Mission

Turn natural language intent into production-ready media using an extensible AI workflow engine.

---

## Core Principles

* **Intent First** – Users describe what they want in natural language.
* **Production First** – Every workflow is centered around production, not individual AI tools.
* **Context is King** – AI decisions are driven by structured context instead of isolated prompts.
* **Human in Control** – AI assists; users make the final decisions.
* **Reproducible** – Every production can be re-run, audited, and reproduced.

---

# Production Flow

```text
Intent
   │
   ▼
Specification
   │
   ▼
Production
   │
   ▼
Run
   │
   ▼
Task Pipeline
   │
   ▼
Media
   │
   ▼
Export
```

---

# Production Types (MVP)

* Affiliate Production
* Drama Production

Both production types share the same AI engine while providing different user experiences.

---

# Domain Model

```
Workspace
    │
    ▼
Project
    │
    ▼
Production
    │
    ▼
Run
    │
    ▼
Task
    │
    ▼
Media
```

Supporting Domains

* Wallet
* Authentication
* Administration

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* Next.js App Router
* Server Actions

## Database

* PostgreSQL

## Storage

* Cloudflare R2

## Queue

* Trigger.dev

## Authentication

* Better Auth

## Payment

* iPaymu

## AI Gateway

Provider-independent architecture supporting multiple AI services.

Examples:

* OpenAI
* Google
* Anthropic
* BytePlus
* Kling
* OpenRouter

---

# Repository Structure

```
docs/
.ai/

src/
├── app/
├── domains/
├── core/
├── infrastructure/
├── shared/
└── styles/
```

---

# Documentation

| Document          | Description                       |
| ----------------- | --------------------------------- |
| 01_PRODUCT_PRD    | Product vision and business goals |
| 02_DOMAIN_MODEL   | Business domain model             |
| 03_USER_JOURNEY   | End-to-end workflow               |
| 04_MVP_BACKLOG    | MVP roadmap                       |
| 05_EVENT_STORMING | Business events and commands      |
| 06_GLOSSARY       | Ubiquitous Language               |

---

# Architecture

Tamer Studio follows a layered architecture.

```
Presentation

↓

Application

↓

Domain

↓

Infrastructure
```

Business logic never depends directly on infrastructure.

---

# AI Engine

The AI Engine is provider-independent.

```
Intent

↓

Specification

↓

AI Gateway

↓

Capability

↓

Provider

↓

Media
```

Providers can be added or replaced without changing business logic.

---

# Development Status

Current Phase

**Foundation**

Completed

* Product Definition
* Domain Model
* User Journey
* MVP Backlog
* Event Storming
* Ubiquitous Language

Next Milestone

* Conceptual ERD
* Logical ERD
* Physical Database Schema
* MVP Implementation

---

# Design Philosophy

Tamer Studio is designed as an **AI Production Operating System**, not as a traditional CRUD application.

The system is built around production workflows where a single Production can be executed multiple times through independent Runs.

Each Run maintains its own Tasks, Media, Events, and execution history, making every production reproducible and auditable.

---

# License

Private Repository

Copyright © Tamer Studio.
