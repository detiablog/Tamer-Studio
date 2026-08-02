# State Management Audit

**Date:** 2026-08-03
**Scope:** React Context, providers, stores, caching, server/client state

---

## State Management Patterns

### 1. Zustand Stores (Feature Level)

Located in `src/features/*/`:

| Store | File | State |
|-------|------|-------|
| `ai.store.ts` | `features/ai/` | AI platform state |
| `production.store.ts` | `features/production/` | Production list state |
| `project.store.ts` | `features/project/` | Project list state |
| `workspace.store.ts` | `features/workspace/` | Workspace list state |
| `publishing.store.ts` | `features/publishing/` | Publishing state |
| `templates.store.ts` | `features/templates/` | Templates state |

**Assessment:** Zustand is used sparingly — only 6 stores for a project with 89 core modules. Most state is managed through:
- Server Components (Next.js App Router)
- SWR for client-side data fetching
- React Context for global providers

### 2. React Providers (Global State)

| Provider | Location | State |
|----------|----------|-------|
| `ThemeProvider` | `components/providers/` | Theme (dark/light) |
| `LocalizationProvider` | `providers/localization/` | Locale, translations |
| `CurrencyProvider` | `providers/currency/` | Currency, formatting |
| `EventHubProvider` | `components/providers/` | Event system bootstrap |
| `HtmlLangUpdater` | `components/providers/` | Document lang attribute |
| `OnboardingProvider` | `components/onboarding/` | Onboarding state |

**Provider Stack (Root Layout):**
```
ThemeProvider
  └─ LocalizationProvider
       └─ CurrencyProvider
            └─ {children}
```

### 3. Server-Side State

| Pattern | Implementation |
|---------|----------------|
| Server Components | `page.tsx` files fetch data directly |
| Server Actions | None used (all API routes) |
| Cookies | `tamer_locale`, `tamer_workspace_id` read in dashboard layout |
| Session | `getServerSession()` in dashboard layout for auth guard |

### 4. Client-Side Data Fetching

| Library | Usage |
|---------|-------|
| SWR | Primary client-side data fetching |
| Fetch | Direct fetch in some components |

### 5. Cache Layer

| Cache | Location | Purpose |
|-------|----------|---------|
| `core/cache/` | Server | Full-featured (memory + Redis) |
| `lib/cache.ts` | Server | Simple in-memory |
| SWR cache | Client | Client-side data cache |

---

## State Ownership Issues

### Issue 1: Dual Cache Systems

Two overlapping cache implementations exist:
- `src/core/cache/` — Sophisticated with Redis, LRU, tags, stats
- `src/lib/cache.ts` — Simple Map with TTL

Both are actively used by different modules, creating two sources of truth for caching.

### Issue 2: Inconsistent Store Usage

Zustand stores exist for 6 features, but most features use no client-side store. The pattern is inconsistent:
- `features/ai/` has a store + 2 components
- `features/workspace/` has a store + 1 component
- `features/templates/` has a store but NO components
- `features/publishing/` has a store but NO components

### Issue 3: Auth State Location

Auth state is managed by:
- `core/auth/` — Server-side session management
- `features/auth/` — Client-side hooks (`use-login.ts`, `use-register.ts`)
- `components/auth/` — Permission hooks (`use-permissions.ts`, `use-admin-permissions.ts`)

Three locations for auth-related state/hooks.

### Issue 4: Provider Split

Global providers are split between:
- `src/providers/` — Currency, Localization
- `src/components/providers/` — Theme, Events, HtmlLang

No clear reason for the split.

### Issue 5: Event Hub Bootstrap

`EventHubProvider.tsx` is a `"use client"` component that calls `initializeEventHub()` — a server-side function. This creates a boundary violation where client code initializes server infrastructure.

---

## Hydration Concerns

| Concern | Status |
|---------|--------|
| Server/Client mismatch | Mitigated by `page.tsx` + `pageClient.tsx` pattern |
| Cookie-based state | Read on server, passed to client via props |
| SWR revalidation | Handles stale data gracefully |
| Event hub initialization | Potential SSR issue with `EventHubProvider` |

---

## Recommendations

### P1 — High
1. **Unify cache implementations** — Consolidate `lib/cache.ts` into `core/cache/`
2. **Consolidate providers** — Move all providers to `src/providers/`
3. **Extract `generateId` from email** — Move to `core/foundation/` to break dependency

### P2 — Medium
4. **Complete Zustand adoption** — Either use stores consistently or remove them
5. **Move auth hooks** — Consolidate all auth hooks in `features/auth/hooks/`
6. **Fix EventHubProvider** — Move server-side initialization to server component

### P3 — Low
7. **Add provider barrel** — Single `src/providers/index.ts` exporting all providers

---

## Score

| Dimension | Score |
|-----------|-------|
| State organization | 5/10 |
| State consistency | 4/10 |
| Hydration safety | 7/10 |
| Cache strategy | 5/10 |
| **Overall** | **5.3/10** |
