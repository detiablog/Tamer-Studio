# AI Prompt Intelligence - Prompt Studio

## Overview

The Prompt Studio is the user-facing dashboard for the Prompt Intelligence system. It is implemented as a single-page client component (`src/app/(dashboard)/prompts/pageClient.tsx`) backed by a tabbed interface. It provides a unified workspace for creating, organizing, analyzing, optimizing, testing, versioning, and tracking prompts.

- **Route**: `/(dashboard)/prompts`
- **Component**: `src/app/(dashboard)/prompts/pageClient.tsx` / `page.tsx`
- **Data Fetching**: SWR with the `fetcher` helper (wraps `fetch` and parses JSON)
- **UI Primitives**: `DashboardCard`, `PageHeader`, `Button`, `Badge`, `Input` from `src/components/ui/*`

---

## Dashboard Modules (Tabs)

The studio exposes ten tab modules, each mapped to an icon:

| Tab Key | Purpose |
| --- | --- |
| `dashboard` | Overview statistics and quick actions |
| `prompts` | User prompt library CRUD, search, filter, favorite, pin, archive |
| `templates` | Global prompt template catalog and duplication |
| `collections` | User collection organization |
| `variables` | User variable management (`{{key}}` placeholders) |
| `versions` | Version listing, detail view, and rollback |
| `testing` | Prompt Test Lab: estimation and test runs |
| `optimization` | Prompt analysis and optimization workbench |
| `history` | Prompt execution history |
| `analytics` | Usage, credit, token, and provider analytics |

Tab definitions:

```typescript
const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "prompts", icon: FileText },
  { key: "templates", icon: LayoutTemplate },
  { key: "collections", icon: Folder },
  { key: "variables", icon: Variable },
  { key: "versions", icon: GitBranch },
  { key: "testing", icon: FlaskConical },
  { key: "optimization", icon: Sparkles },
  { key: "history", icon: History },
  { key: "analytics", icon: BarChart3 },
];
```

---

## Dashboard Module

The `dashboard` tab shows six statistic cards and two preview lists:

- **Total Prompts** (`stats.totalPrompts`)
- **Favorites** (`stats.favorites`)
- **Collections** (`stats.collections`)
- **Total Variables** (`stats.totalVariables`)
- **Tests** (`stats.totalTests`)
- **Versions** (`stats.totalVersions`)

Below the cards:

- **Recent Prompts**: First five prompts with favorite/pinned badges
- **Collections**: First five collections with prompt counts
- **Quick Actions**: New Prompt, Templates, Testing, Optimization, Refresh

---

## Prompt Library Structure

The prompt list (`prompts` tab) is powered by `GET /api/prompts` with optional query filters:

- `search` — matches prompt `name` or `content` (SQL `LIKE`)
- `type` — exact type filter
- `category` — exact category filter
- `collectionId` — filter by collection
- `isFavorite`, `isPinned`, `isArchived` — boolean filters
- `page`, `limit` — pagination (limit capped at 100)

### Prompt Fields

| Field | Description |
| --- | --- |
| `id` | Primary key, prefix `pprm` |
| `name` | Display name (required) |
| `description` | Optional description |
| `content` | Prompt body (required) |
| `type` | Prompt type, default `custom` |
| `category` | Optional category |
| `tags` | Array of tag strings |
| `variables` | Array of variable keys used |
| `isFavorite` | Favorite flag |
| `isPinned` | Pinned flag (sorts to top) |
| `isArchived` | Archived flag |
| `isPublic` | Public visibility flag |
| `qualityScore` | Last known analyzer quality score |
| `useCount` | Incremented on each use |
| `versionNumber` | Current version number |
| `collectionId` | Owning collection (FK) |

### Actions From the UI

- **Create / Edit / Delete** prompts (`POST /api/prompts`, `PUT/DELETE /api/prompts/[id]`)
- **Favorite / Pin** toggles (`POST /api/prompts/[id]/favorite|pin|archive`)
- **Detail view** opens a modal rendering all fields

### Filtering Constants

```typescript
const PROMPT_TYPES = ["all", "text", "code", "image", "video", "audio", "chat", "custom"];
const PROMPT_CATEGORIES = ["all", "general", "content", "coding", "creative", "business", "education", "marketing"];
```

---

## Prompt Types

The studio supports the following prompt types (from `PROMPT_TYPES`, excluding `all` for creation):

| # | Type | Description |
| --- | --- | --- |
| 1 | `text` | General text-generation prompts |
| 2 | `code` | Code generation or explanation prompts |
| 3 | `image` | Image generation prompts (also used by Image Studio) |
| 4 | `video` | Video generation prompts |
| 5 | `audio` | Audio/speech prompts |
| 6 | `chat` | Conversational prompts |
| 7 | `custom` | User-defined prompts (default type) |
| 8 | `affiliate` | Affiliate marketing prompts (optimizer maps to `Persuasive, conversion-focused`) |
| 9 | `drama` | Drama/storytelling scripts (optimizer maps to `Emotionally engaging, dramatic`) |
| 10 | `story` | Story/narrative prompts (optimizer maps to `Vivid, narrative-driven`) |
| 11 | `marketing` | Marketing copy prompts (optimizer maps to `Compelling, brand-aligned`) |
| 12 | `seo` | SEO content prompts (optimizer maps to `Search-optimized, keyword-rich`) |

Note: `affiliate`, `drama`, `story`, `marketing`, and `seo` are recognized as type keys by the Prompt Optimizer's type-adjective map (`src/core/prompt-intelligence/prompt-optimizer.service.ts`), in addition to the UI-defined `PROMPT_TYPES`.

---

## Collections and Organization

Collections group prompts into folders. They are rendered in the `collections` tab and referenced by `collectionId` on prompts.

### Collection Fields

- `id` (prefix `pcol`)
- `name` (required)
- `description` (optional)
- `color` (optional)
- `isPinned` — pins collection to the top of the list

### Collection Tags (UI)

```typescript
const COLLECTION_TAGS = ["all", "work", "personal", "project", "favorites"];
```

### Behavior

- Collections are user-scoped (`userId`)
- Prompt `collectionId` creates the relation `promptLibrary -> promptCollections`
- Deleting a collection detaches its prompts (`collectionId` set to `null`) before deleting the collection
- Deleting a prompt cascades deletion of its versions (in the service layer)

---

## Templates Module

The `templates` tab lists active system templates from `GET /api/prompts/templates`:

- Filtered by `type` and `search`
- Sorted by `usageCount` (most used first)
- Each template shows name, description, content, and tags
- **Duplicate to my prompts**: fetches the template by ID and creates a user prompt via `POST /api/prompts`

Templates are global (not user-scoped) and flagged with `isSystem` / `isActive`.

---

## Variables Module

The `variables` tab manages user-defined variables:

- Displayed with the `{{key}}` placeholder syntax
- Fields: `key`, `value`, `type` (text, number, boolean, list), `description`
- Supports local search by `key` or `value`
- Backed by `GET/POST /api/prompts/variables` and `PUT/DELETE /api/prompts/variables/[id]`

---

## Versions Module

The `versions` tab lets users:

1. Select a prompt (first 10 prompts by default)
2. Browse its versions (newest first)
3. View a version detail
4. Roll back to a non-current version (`POST /api/prompts/[id]/rollback`)

---

## Testing Module

The **Prompt Test Lab** (`testing` tab) provides:

- A prompt textarea
- **Estimate** — calls `POST /api/prompts/testing/estimates` to display estimated tokens, credits, and character count
- **Create Test Run** — registers a test via `POST /api/prompts/testing`
- **Compare Results** — collect multiple test runs into a comparison panel showing output, tokens, credits, and duration
- **Test history** — lists the most recent 20 test runs with status badges (`completed`, `running`/`pending`, `failed`/`error`)

---

## Optimization Module

The `optimization` tab is a two-pane workbench:

- **Analyze Prompt** — calls `POST /api/prompts/analyze`, rendering the quality score bar plus clarity/specificity/actionability bars and suggestions
- **Optimize Prompt** — calls `POST /api/prompts/optimize`, showing an original vs. optimized result
- Options to **Copy Optimized** and **Save to My Prompts**

---

## History Module

The `history` tab lists prompt execution history from `GET /api/prompts/history`, showing prompt name, status, provider, tokens, credits, model, and created timestamp. Supports local search by name/resolved prompt.

---

## Analytics Module

The `analytics` tab renders four aggregate cards and two breakdown lists:

- **Total Usage**, **Credits Used**, **Avg Tokens / Prompt**, **Success Rate**
- **Most Used Types** (`stats.byType`)
- **History by Provider** (`stats.byProvider`)
- **Recent Activity** (last 10 history items)

---

## Data Loading Summary

| Tab Data | SWR Endpoint |
| --- | --- |
| Dashboard stats | `GET /api/prompts/stats` |
| Prompts | `GET /api/prompts?search/type/category` |
| Templates | `GET /api/prompts/templates?type/search` |
| Collections | `GET /api/prompts/collections` |
| Variables | `GET /api/prompts/variables?search` |
| Versions | `GET /api/prompts/[id]/versions` |
| Testing | `GET /api/prompts/testing` |
| History | `GET /api/prompts/history?search` |
| Analytics/settings | `GET /api/prompts/settings` |
