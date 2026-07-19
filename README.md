# Tamer Studio

> **From Intent to Production.**

Tamer Studio adalah AI Production Platform yang membantu creator menghasilkan video affiliate dan video drama menggunakan Artificial Intelligence melalui workflow produksi yang sederhana, konsisten, dan dapat direproduksi.

---

# Vision

Menjadi AI Production Operating System terbaik bagi creator untuk memproduksi konten berkualitas tinggi tanpa harus memahami prompt engineering atau workflow AI yang rumit.

---

# Mission

Menyederhanakan proses produksi konten dengan membiarkan creator fokus pada tujuan (Intent), sementara Tamer Studio mengelola seluruh proses produksi menggunakan AI.

---

# Core Principles

## Intent First

Creator menyampaikan tujuan.

AI menerjemahkan tujuan tersebut menjadi proses produksi.

---

## Production First

Tamer Studio bukan AI Generator.

Tamer Studio adalah Production Platform.

---

## Context is King

AI selalu bekerja menggunakan konteks yang lengkap.

---

## Human in Control

Creator selalu memiliki keputusan akhir.

---

## Everything Reproducible

Semua produksi dapat direproduksi menggunakan Snapshot.

---

# Product Scope

Tamer Studio v1 hanya memiliki dua workflow.

* Affiliate Production
* Drama Production

Di luar dua workflow tersebut tidak termasuk dalam ruang lingkup versi pertama.

---

# High Level Architecture

```text
User

↓

Production

↓

AI Orchestrator

↓

Gateway Manager

↓

Provider Adapter

↓

AI Provider

↓

Assets

↓

Export
```

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod

## Backend

* Next.js App Router
* Server Actions
* Route Handlers

## Database

* PostgreSQL
* Drizzle ORM

## Queue

* Trigger.dev

## Storage

* Cloudflare R2

## Authentication

* Better Auth

## Payments

* iPaymu

## AI

* Gateway Adapter
* Kilo Gateway
* OpenRouter
* Direct Providers

---

# Core Modules

* Workspace
* Production
* Asset
* AI
* Wallet
* Product
* Talent
* Story
* Admin

---

# Repository Structure

```text
tamer-studio/

.ai/
docs/
src/
tests/

package.json
README.md
```

---

# Development Strategy

Tamer Studio menggunakan pendekatan:

* Documentation First Development
* Vertical Slice Architecture
* Modular Monolith
* Event Driven Workflow
* Feature Flag Ready

---

# Coding Principles

* Production adalah pusat workflow.
* Business Logic tidak boleh berada di UI.
* Semua perubahan Production dilakukan melalui Use Case.
* Semua AI Provider menggunakan Adapter.
* Semua konfigurasi berasal dari Admin.
* Semua operasi AI harus idempotent.

---

# Milestones

## Sprint 0

Repository Foundation

## Sprint 1

Documentation

## Sprint 2

Database

## Sprint 3

Production Engine

## Sprint 4

Frontend

## Sprint 5

AI Integration

## Sprint 6

Payment

## Sprint 7

Release

---

# Long-Term Goal

Membangun AI Production Platform yang dapat berkembang menjadi:

* Web Application
* Mobile Application
* Desktop Application
* Public API
* SDK

dengan satu Production Engine yang konsisten di seluruh platform.

---

# License

Private Repository

Copyright © Tamer Studio.
