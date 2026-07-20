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

- **Intent First** – Users describe what they want in natural language.
- **Production First** – Every workflow is centered around production, not individual AI tools.
- **Context is King** – AI decisions are driven by structured context instead of isolated prompts.
- **Human in Control** – AI assists; users make the final decisions.
- **Reproducible** – Every production can be re-run, audited, and reproduced.

---

## Technology Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (base-nova)
- next-themes (dark mode)
- Better Auth
- Drizzle ORM
- Sonner (toasts)

### Backend

- Next.js App Router API Routes
- Better Auth (email/password)
- Drizzle ORM + PostgreSQL

### Package Manager

- pnpm

---

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 11.15.0
- PostgreSQL database

### Installation

```bash
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication route group (login, register, etc.)
│   ├── (dashboard)/       # Dashboard route group (protected pages)
│   ├── (marketing)/       # Marketing route group (public pages)
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui primitives
│   ├── auth/              # Auth guards and permission components
│   ├── admin/             # Admin shell and data table
│   ├── workspace/         # Workspace-specific components
│   ├── project/           # Project-specific components
│   ├── production/        # Production-specific components
│   └── ai/                # AI platform components
├── features/              # Feature modules with business logic
│   ├── auth/              # Authentication feature (forms, schemas, services)
│   ├── workspace/         # Workspace feature (store, list)
│   ├── project/           # Project feature (store, list)
│   ├── production/        # Production feature (store, list)
│   └── ai/                # AI platform feature (store, dashboard)
├── lib/                   # Shared utilities and configurations
│   ├── auth/              # Auth client, server auth, permissions
│   ├── db/                # Database client and schema
│   └── utils.ts           # cn() utility
├── hooks/                 # Custom React hooks
└── proxy.ts               # Route proxy for auth protection
```

---

## Architecture

Tamer Studio follows a feature-based architecture:

- **Presentation Layer**: Next.js App Router pages and React components
- **Application Layer**: Feature modules in `src/features/` containing business logic
- **Infrastructure Layer**: Database (Drizzle ORM), Auth (Better Auth), external services

Business logic never depends directly on infrastructure concerns.

---

## Authentication

- Uses Better Auth with email/password
- Client components import from `lib/auth/auth-client.ts`
- Server components/actions import from `lib/auth/auth.ts`
- Role-based access control with granular permissions
- Route protection via `proxy.ts` (Next.js 16)

---

## License

Private Repository

Copyright © Tamer Studio.
