# Tamer Studio AI Constitution

Version: 1.0
Status: LOCKED

---

# Project Identity

Project Name:
Tamer Studio

Mission:
Build an AI-first production platform for content creation.

---

# Technology Stack

Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

Backend

- Better Auth
- Drizzle ORM
- PostgreSQL

State

- React Hooks

Package Manager

- pnpm

---

# Architecture

THIS STRUCTURE IS LOCKED.

Never change it unless explicitly requested.

src/

    app/
    components/
    config/
    features/
    lib/
    services/
    types/

---

Authentication Module

src/features/auth/

components/

hooks/

schemas/

---

Database

src/lib/db/

client.ts

index.ts

schema/

---

Auth

src/lib/auth/

auth.ts

auth-client.ts

---

# Rules

DO NOT

- rename folders
- move files
- create duplicate components
- create duplicate hooks
- create duplicate schemas
- replace existing architecture

Reuse existing code whenever possible.

---

# Coding Rules

Always:

Use TypeScript.

Use App Router.

Use async/await.

Keep components small.

Avoid duplicated logic.

Follow SOLID.

---

# Import Rules

Client Components

ONLY import

authClient

from

src/lib/auth/auth-client.ts

Never import

auth.ts

inside Client Components.

Server

ONLY import

auth

from

src/lib/auth/auth.ts

---

# Better Auth Rules

Use Better Auth official API.

Never implement custom authentication.

Use existing authClient.

Use existing auth.ts.

---

# Database Rules

Use Drizzle ORM.

Never write raw SQL unless requested.

Never duplicate schema.

Always reuse schema.

---

# UI Rules

Reuse shadcn/ui.

Keep UI consistent.

No inline styles.

Use Tailwind.

---

# Refactor Rules

Refactor only if requested.

Never change folder structure.

Never rename components.

Never change imports unnecessarily.

---

# Commit Style

feat:

fix:

refactor:

docs:

style:

test:

---

# Output Rules

Before writing code:

Understand repository.

Search existing implementation.

Reuse before creating.

At the end always output:

Modified files

Reason

Testing steps

Git commit