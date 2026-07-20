# Tamer Studio Engineering Playbook

Version: 1.0
Status: LOCKED
Owner: Tamer Desa

---

# 1. Project Overview

Project Name

Tamer Studio

Mission

Build an AI-first production platform that manages ideas, projects, media generation, production pipelines and publishing.

This repository is intended for long-term development.

Maintainability is more important than writing quick code.

---

# 2. Technology Stack

Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

Backend

- Better Auth
- PostgreSQL
- Drizzle ORM

Package Manager

pnpm

---

# 3. Architecture

THIS ARCHITECTURE IS LOCKED.

Never modify unless explicitly instructed.

src/

app/

components/

config/

features/

lib/

services/

types/

---

Authentication

src/features/auth/

components/

hooks/

schemas/

---

Database

src/lib/db/

client.ts

schema/

---

Authentication Core

src/lib/auth/

auth.ts

auth-client.ts

---

# 4. Engineering Principles

Before writing code

Read the repository.

Understand current implementation.

Search existing code.

Never assume.

Never duplicate.

Reuse before creating.

---

# 5. Coding Rules

Always

Use TypeScript.

Use async/await.

Keep functions small.

Keep components small.

Use composition.

Prefer readability.

Follow SOLID.

---

# 6. Import Rules

Client Components

ONLY import

authClient

from

src/lib/auth/auth-client.ts

Never import auth.ts.

Server

ONLY import

auth

from

src/lib/auth/auth.ts

---

# 7. Better Auth Rules

Always use Better Auth official APIs.

Never create custom auth.

Never implement custom session management.

---

# 8. Database Rules

Always use Drizzle ORM.

Never duplicate schema.

Never write raw SQL unless requested.

Reuse existing schema.

---

# 9. UI Rules

Reuse shadcn/ui.

Keep design consistent.

Use Tailwind.

Avoid inline styles.

---

# 10. File Modification Rules

Before creating files

Search whether similar file already exists.

If it exists

Reuse it.

Do not duplicate.

Do not move files.

Do not rename folders.

Do not change architecture.

---

# 11. Definition of Done

A feature is complete only if:

- code compiles
- no TypeScript errors
- lint passes
- build passes
- feature works
- acceptance criteria satisfied

---

# 12. Output Format

After every task provide

1.

Modified Files

2.

Reason

3.

Testing Steps

4.

Git Commit Message

5.

Potential Risks

---

# 13. Communication Rules

Do not explain basic programming concepts.

Focus on implementation.

If requirements are ambiguous

Ask before coding.

Do not guess.

---

# 14. Quality Rules

Prefer minimal changes.

Avoid unnecessary refactoring.

Never modify unrelated files.

Keep backward compatibility.

---

# 15. Git Rules

Use Conventional Commits.

Examples

feat(auth):

fix(auth):

refactor(auth):

docs:

test:

---

# 16. Completion Checklist

Before finishing verify

Repository builds.

Feature works.

No duplicated code.

No duplicated components.

No architecture changes.

No unnecessary files created.

Everything follows this playbook.