# Tamer Studio - Project Context

> Single Source of Truth for AI Development

Version: 1.0
Status: LOCKED

---

# 1. Project Overview

## Project Name

Tamer Studio

## Mission

Tamer Studio is an AI-first production platform that helps creators manage the entire content lifecycle—from idea generation, project organization, media creation, production workflow, to publishing—in a single application.

Every implementation should prioritize maintainability, scalability, and developer experience.

---

# 2. AI Working Rules

Before writing any code:

1. Read the entire repository.
2. Understand the current implementation.
3. Search for reusable code.
4. Reuse before creating.
5. Modify the minimum number of files required.

Never assume a file does not exist.

---

# 3. Project Structure (LOCKED)

Never rename or move folders unless explicitly instructed.

src/
├── app/
├── components/
├── config/
├── features/
├── lib/
├── services/
└── types/

Feature modules are located inside:

src/features/

Authentication lives in:

src/features/auth/

---

# 4. Technology Stack

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

Package Manager

- pnpm

---

# 5. Architecture Principles

Use Feature-Based Architecture.

Business logic belongs inside features.

Shared utilities belong inside lib.

Reusable UI belongs inside components.

Avoid duplicate logic.

---

# 6. Coding Standards

Always:

- TypeScript
- async/await
- Strong typing
- Small reusable functions
- Composition over duplication

Avoid:

- any
- dead code
- duplicated utilities

---

# 7. Authentication Rules

Authentication uses Better Auth.

Do not implement custom authentication.

Client Components only import:

lib/auth/auth-client.ts

Server Components only import:

lib/auth/auth.ts

---

# 8. Database Rules

Use Drizzle ORM.

Never duplicate schema.

Reuse existing tables.

Do not write raw SQL unless required.

---

# 9. UI Rules

Reuse existing components.

Use shadcn/ui.

Use Tailwind.

Maintain design consistency.

---

# 10. File Modification Rules

Before creating a file:

Search the repository.

If a similar implementation exists,

extend it instead of creating a new one.

---

# 11. Git Rules

Use Conventional Commits.

Examples:

feat(auth):

fix(workspace):

refactor(project):

docs:

---

# 12. Definition of Done

A task is complete only when:

- Build passes
- No TypeScript errors
- No lint errors
- Feature works
- Acceptance criteria are met

---

# 13. AI Response Format

After implementation always provide:

1. Summary
2. Modified files
3. Reason for changes
4. Testing steps
5. Suggested commit message