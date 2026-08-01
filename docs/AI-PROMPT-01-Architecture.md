# AI Prompt Intelligence System - Overall Architecture

## System Overview and Purpose

The Prompt Intelligence System is a centralized prompt management, analysis, and optimization layer for Tamer Studio. It provides a single workspace where users can author, organize, analyze, optimize, validate, version, test, and track prompts across all AI modules. The system wraps prompts with context from the Creative Memory System, resolves user-defined variables, and records runtime usage history so that prompt quality and cost can be measured and continuously improved.

### Core Objectives

1. **Prompt Quality**: Provide deterministic quality scoring and actionable improvement suggestions
2. **Reusability**: Maintain a persistent, searchable library of prompts, templates, collections, and variables
3. **Context Awareness**: Enrich prompts with brand, style, story, project, and platform context from Creative Memory
4. **Repeatability**: Version every prompt and support rollback and side-by-side comparison
5. **Cost Control**: Estimate tokens and credits before running tests and record actual usage in history
6. **Measurement**: Track quality scores, usage counts, and provider-level execution statistics

---

## Architecture Diagram

```
+----------------------+
|   User (Dashboard)   |
|  /(dashboard)/prompts|
+----------+-----------+
           |
           | REST + userAuthentication()
           v
+----------+----------------------+
|  API Layer (/api/prompts/*)     |
|  27 REST endpoints              |
+----------+----------------------+
           |
           v
+--------------------- DX Bubble ---------------------+
|                                                     |
|  +------------------+     +--------------------+   |
|  | Prompt Library    |     | Prompt Templates    |   |
|  | Service           |     | Service            |   |
|  +---------+---------+     +---------+----------+   |
|  +------------------+     +--------------------+   |
|  | Variable System   |     | Versioning          |   |
|  | Service           |     | (library service)   |   |
|  +---------+---------+     +---------+----------+   |
|                                                     |
|  +------------------+     +--------------------+   |
|  | Prompt Analyzer   |     | Prompt Optimizer    |   |
|  | Service           |     | Service            |   |
|  +---------+---------+     +---------+----------+   |
|                                                     |
|  +------------------+     +--------------------+   |
|  | Prompt Validator  |     | Context Builder     |   |
|  | Service           |     | Service            |   |
|  +---------+---------+     +---------+----------+   |
|                                                     |
|  +------------------+     +--------------------+   |
|  | Testing Service   |     | Settings Service    |   |
|  +---------+---------+     +---------+----------+   |
|                                                     |
|  +------------------+     +--------------------+   |
|  | History Service   |     | Analytics Service   |   |
|  |                   |     | (analyzer)         |   |
|  +---------+---------+     +---------+----------+   |
|                                                     |
+----------------------------+------------------------+
                             |
                             v
                  +---------------------+
                  |  PostgreSQL DB       |
                  |  (9 tables)          |
                  +---------------------+

  Context sources (external):

  +---------------------+      +----------------------+
  | Creative Memory     |      | Story Engine         |
  | Context Builder     |      | (storyId reference)  |
  +----------+----------+      +----------+-----------+
             |                            |
             v                            v
+---------------------+      +----------------------+
| Brand Profile       |      | Project              |
| (creative context)  |      | (projectId reference)|
+----------+----------+      +----------+-----------+
                                       |
                                       v
                            +----------------------+
                            | Platform metadata    |
                            | (injected headers)   |
                            +----------------------+

                            AI Runtime consumption

+---------------------+
| AI Runtime          |
| (AI modules: Image, |
|  Video, Affiliate,  |
|  Drama, Story, SEO, |
|  Marketing, Chat)   |
+----------+----------+
           |
           v
+---------------------+
| Provider Registry   |
| (OpenAI, Anthropic, |
|  Google, ...)       |
+---------------------+
```

---

## Core Components

### 1. Prompt Library Service

- **File**: `src/core/prompt-intelligence/prompt-library.service.ts`
- **Responsibility**: CRUD for user prompts, collections, favorites, pins, archives, and library statistics
- **Key Methods**: `listPrompts()`, `createPrompt()`, `getPrompt()`, `updatePrompt()`, `deletePrompt()`, `toggleFavorite()`, `togglePin()`, `toggleArchive()`, `incrementUseCount()`, `listCollections()`, `createCollection()`, `updateCollection()`, `deleteCollection()`, `createVersion()`, `listVersions()`, `getVersion()`, `rollbackVersion()`, `getStats()`
- **ID Prefixes**: `pprm` (prompts), `pcol` (collections), `pver` (versions)

### 2. Prompt Templates Service

- **File**: `src/core/prompt-intelligence/prompt-template.service.ts`
- **Responsibility**: Manages the global system prompt template catalog (active, system-owned templates)
- **Key Methods**: `listTemplates()`, `getTemplate()`, `createTemplate()`, `updateTemplate()`, `deleteTemplate()`, `incrementUsage()`, `getStats()`
- **ID Prefix**: `ptmpl`

### 3. Prompt Analyzer Service

- **File**: `src/core/prompt-intelligence/prompt-analyzer.service.ts`
- **Responsibility**: Deterministic quality analysis of prompt text (clarity, structure, context, ambiguity, token estimation, risk level) and analytics recording
- **Key Methods**: `analyze()`, `recordAnalytics()`, `getPromptStats()`
- **ID Prefix**: `panl`

### 4. Prompt Optimizer Service

- **File**: `src/core/prompt-intelligence/prompt-optimizer.service.ts`
- **Responsibility**: Deterministic text transformation for prompts (punctuation fixing, style adjective injection, capitalization, sentence termination)
- **Key Methods**: `optimize()`
- **Private Helpers**: `fixPunctuation()`, `capitalizeFirst()`, `addStyleAdjective()`, `ensureSubjectClarity()`

### 5. Prompt Validator Service

- **File**: `src/core/prompt-intelligence/prompt-validator.service.ts`
- **Responsibility**: Validates prompts for empty content, length limits, broken variables, unsafe content, and low quality
- **Key Methods**: `validate()`

### 6. Context Builder Service

- **File**: `src/core/prompt-intelligence/prompt-context-builder.service.ts`
- **Responsibility**: Resolves variables and injects context from Creative Memory into prompts
- **Key Methods**: `enrichPrompt()`
- **Dependency**: `contextBuilderService` from `src/core/creative-memory/context-builder.service.ts`

### 7. Variable System Service

- **File**: `src/core/prompt-intelligence/prompt-variable.service.ts`
- **Responsibility**: CRUD for user variables, rendering, extraction, and batch value resolution
- **Key Methods**: `listVariables()`, `createVariable()`, `getVariable()`, `updateVariable()`, `deleteVariable()`, `renderVariables()`, `extractVariables()`, `resolveVariableValues()`, `getStats()`
- **ID Prefix**: `pvar`

### 8. Versioning (Within Library Service)

- **Responsibility**: Snapshots prompt content on update, tracks version numbers, supports rollback
- **Key Methods**: `createVersion()`, `listVersions()`, `getVersion()`, `rollbackVersion()`

### 9. Testing Service

- **File**: `src/core/prompt-intelligence/prompt-testing.service.ts`
- **Responsibility**: Token/credit estimation and test run lifecycle
- **Key Methods**: `estimate()`, `listTests()`, `createTest()`, `getTest()`, `updateTest()`, `deleteTest()`, `getStats()`
- **ID Prefix**: `ptest`

### 10. History Service

- **File**: `src/core/prompt-intelligence/prompt-history.service.ts`
- **Responsibility**: Records prompt execution history, credits, execution time, provider/model, and aggregates stats
- **Key Methods**: `recordHistory()`, `listHistory()`, `getHistoryItem()`, `getStats()`
- **ID Prefix**: `phist`

### 11. Settings Service

- **File**: `src/core/prompt-intelligence/prompt-settings.service.ts`
- **Responsibility**: Per-user prompt intelligence preferences (auto-optimize, auto-inject-context, auto-validate, defaults)
- **Key Methods**: `getSettings()`, `upsertSettings()`
- **ID Prefix**: `pset`

---

## Data Flow

```
User Prompt
     |
     v
Prompt Intelligence (entry via /api/prompts/*)
     |
     +--> Prompt Analyzer
     |     (quality score, clarity, structure, context,
     |      ambiguity, estimatedTokens, riskLevel)
     |
     +--> Context Builder (enrich)
     |     (variable resolution + Creative Memory injection)
     |
     +--> Prompt Optimizer
     |     (punctuation fix, style adjective, subject clarity,
     |      before/after score comparison)
     |
     +--> Prompt Validator
     |     (EMPTY / TOO_LONG / BROKEN_VARIABLE / UNSAFE /
     |      LOW_QUALITY checks)
     |
     +--> Prompt Versioning
     |     (createVersion on content change, rollback)
     |
     +--> AI Runtime
     |     (module prompt consumption, provider execution)
     |
     +--> Analytics
           (history recording, quality score recording,
            provider/model usage aggregation)
```

### Detailed Pipeline

1. A user enters a prompt in the Prompt Studio or an AI module calls the pipeline
2. Prompt Intelligence routes to the requested sub-system (analyze, optimize, validate, enrich, render, test)
3. If enrichment is used, the Context Builder resolves inline `{{variable}}` placeholders against explicit variables, stored user variables, and `DEFAULT_VARIABLES`, then prepends a Creative Memory context summary (brand identity, visual style, story content, characters, thumbnail/caption/workflow/publishing preferences)
4. The Validator can be invoked to block empty, unsafe, broken-variable, or low-quality prompts
5. The Optimizer produces a corrected variant with a before/after quality score and an `improvement` delta
6. The Versioning sub-system stores each content change as an immutable snapshot
7. The resolved prompt is sent to the AI Runtime for execution against a provider
8. History records the resolved prompt, provider, model, credits used, and execution time; Analytics records numeric metrics

---

## Integration Points

### AI Runtime

- Prompt Intelligence produces the final resolved prompt (`resolvedPrompt`) consumed by AI Runtime pipelines
- History and test records store the `provider` and `model` used at execution time
- Usage telemetry (tokens, credits, execution time) can be written back through `/api/prompts/history`

### Creative Memory System

- `src/core/prompt-intelligence/prompt-context-builder.service.ts` imports `contextBuilderService` from `src/core/creative-memory/context-builder.service.ts`
- `enrichPrompt()` calls `buildPromptContext(userId, moduleType)` and `getContextSummary(context)`, injecting the summary above the user prompt as `<creativeSummary>\n\n<resolvedPrompt>`
- Module types follow Creative Memory `source` conventions (image, video, affiliate, drama, story, etc.)

### Story Engine

- The Context Builder accepts `storyId` and records `Story: {storyId}` in `injectedContext`; metadata carries `hadCreativeContext`
- Story-specific creative memories (story, character, thumbnail) surface when present in the Creative Memory summary

### Brand Profile

- The active `creativeBrandProfile` is included in the Context Builder summary (name, voice, tone, audience, colors, typography, CTA, platforms, keywords, rules)

### Project Reference

- `projectId` is injected as `Project: {projectId}` context and forwarded to Creative Memory context queries
- History stores `projectReference` for cross-module traceability

### All AI Modules

| Module | Interaction |
| --- | --- |
| Image Studio | Uses prompt library via `src/app/api/image-studio/prompts/route.ts` (`listPromptLibrary`, `createPrompt`) |
| Video | Consumes resolved/optimized prompts from the library, associated with `video` type |
| Affiliate | Uses `affiliate` prompt type; optimizer injects `Persuasive, conversion-focused` adjective |
| Drama | Uses `drama` prompt type; optimizer injects `Emotionally engaging, dramatic` adjective |
| Story | Uses `story` prompt type and `storyId`/`story_theme` variables; optimizer injects `Vivid, narrative-driven` adjective |
| Marketing | Uses `marketing` prompt type; optimizer injects `Compelling, brand-aligned` adjective |
| SEO | Uses `seo` prompt type; optimizer injects `Search-optimized, keyword-rich` adjective |
| Code | Uses `code` prompt type from the library (`PROMPT_TYPES`) |
| Chat / Audio / Text | Library types available for filtering and reuse |

### Middleware

- Every endpoint runs `userAuthentication()` from `src/core/middleware/auth.middleware.ts`
- `userId` is always derived from the session, never accepted from the client body

---

## Technology Stack

- **Framework**: Next.js (App Router) with route handlers (`src/app/api/prompts/*`)
- **Database**: PostgreSQL via Drizzle ORM (`drizzle-orm/pg-core`)
- **Schema**: `src/lib/db/schema/prompt-intelligence.ts`
- **ID Generation**: `generateId(prefix)` from `src/modules/email/email.encryption.ts` producing `{prefix}_{timestamp36}_{randomhex}` strings
- **Frontend**: Client component `src/app/(dashboard)/prompts/pageClient.tsx` backed by SWR
- **Validation Response Mapper**: `successResponse` / `errorResponse` / `paginatedResponse` in `src/app/api/mappers/response.ts`
- **Error Handling**: `mapErrorToResponse` in `src/app/api/mappers/error-mapper.ts`

---

## Related Documentation

- Prompt Studio: `docs/AI-PROMPT-01-PromptStudio.md`
- Analyzer: `docs/AI-PROMPT-01-PromptAnalyzer.md`
- Optimizer: `docs/AI-PROMPT-01-PromptOptimizer.md`
- Context Builder: `docs/AI-PROMPT-01-ContextBuilder.md`
- Variable System: `docs/AI-PROMPT-01-VariableSystem.md`
- Versioning: `docs/AI-PROMPT-01-Versioning.md`
- Testing: `docs/AI-PROMPT-01-Testing.md`
- Analytics: `docs/AI-PROMPT-01-Analytics.md`
- Database: `docs/AI-PROMPT-01-Database.md`
- API: `docs/AI-PROMPT-01-API.md`
- Security: `docs/AI-PROMPT-01-Security.md`
- Performance: `docs/AI-PROMPT-01-Performance.md`
- Final Report: `docs/AI-PROMPT-01-Final-Report.md`
