# AI Prompt Intelligence - Context Builder

## Overview

The Context Builder enriches a user prompt with personalization data before it reaches the AI Runtime. It resolves `{{variable}}` placeholders (explicit, stored, and default) and prepends a Creative Memory context summary so that generated output is consistent with the user's brand, style, story, and publishing preferences.

- **File**: `src/core/prompt-intelligence/prompt-context-builder.service.ts`
- **Export**: `promptContextBuilderService` (singleton)
- **Dependency**: `contextBuilderService` from `src/core/creative-memory/context-builder.service.ts`
- **Endpoint**: `POST /api/prompts/enrich`

---

## Enrichment Result Structure

```typescript
interface EnrichedPrompt {
  prompt: string;                 // final enriched prompt
  injectedContext: string[];      // human-readable tags of injected context
  resolvedVariables: Record<string, string>; // variables actually substituted
  metadata: {
    extractedKeys: string[];      // variable keys found in the prompt
    hadCreativeContext: boolean;  // whether a memory summary was prepended
  };
}
```

---

## Context Injection Sources

### 1. Creative Memory

The Context Builder calls:

```typescript
const context = await contextBuilderService.buildPromptContext(userId, moduleType);
const creativeSummary = contextBuilderService.getContextSummary(context);
```

`moduleType` defaults to `"general"` and can be passed as `moduleType` on the request (for example `image`, `video`, `affiliate`, `drama`, `story`, `seo`, `marketing`).

`getContextSummary` produces a multi-section text block with:

| Section | Source |
| --- | --- |
| `[Brand Identity]` | Active `creativeBrandProfile` (name, voice, tone, audience, primary/secondary colors, typography, CTA style, platforms, keywords, rules) |
| `[Visual Style]` | Top 3 `creativeVisualMemory` entries (colors, composition, lighting, camera angle, mood, aspect ratio, preferred models) |
| `[Story Context]` | Top 3 `creativeStoryMemory` entries (genres, ending style, story rules) |
| `[Characters]` | Top 5 `creativeCharacterMemory` entries (voice, expressions, accessories) |
| `[Thumbnail Style]` | Top 3 `creativeThumbnailMemory` entries (text position, color style, subject placement) |
| `[Caption Style]` | Top 3 `creativeCaptionMemory` entries (writing style, length, emoji usage, CTA, hashtags) |
| `[Workflow]` | Top 3 `creativeWorkflowMemory` entries (favorite templates, generation order) |
| `[Publishing]` | Active `creativePublishingMemory` (platforms, frequency, timezone) |
| `[User Preferences]` | Top confidence `creativePreference` entries (`category/key: value (confidence: N%)`) |
| `[Recent Activity]` | Recent `creativeMemory` entries grouped by category (counts only) |

If `creativeSummary` is non-empty, `"Creative memory brand/style context injected"` is recorded in `injectedContext` and the summary is prepended:

```
finalPrompt = `${creativeSummary}\n\n${resolvedPrompt}`
```

Deterministic memory ordering: brand profile and publishing memory are selected by `updatedAt` descending; memory lists are ordered by `updatedAt`; preferences by `confidence` descending; recent memories by `score` then `createdAt`.

### 2. Story Engine

- `storyId` (optional) records `Story: {storyId}` into `injectedContext`
- Story, character, and thumbnail memories (with `isActive = true`) are pulled from Creative Memory and appear in the summary when the module has narrative content

### 3. Brand Profile

- The active brand profile is always the strongest signal in the summary; it is fetched first with `isActive = true` ordered by `updatedAt` desc

### 4. Project

- `projectId` (optional) records `Project: {projectId}` into `injectedContext`
- Creative Context Builder uses `projectId` to scope visual, thumbnail, caption, and workflow memory queries to the specific project

### 5. Platform

- Platform targeting is represented through:
  - `creativePreference` / `creativePublishingMemory` platform fields in the summary
  - The `platform` variable, resolved through the Variable System (default: empty string)

---

## Context Enrichment Flow

```
                      enrichPrompt(userId, prompt, options)
                                  |
                                  v
                Step 1: Explicit variables                      .--------------.
      options.variables provided?          yes ---------------> | renderVariables|
                                  |                             | explicit map   |
                                  v                             +-------+--------+
                Step 2: Stored variables                                 |
      extractVariables(resolved)                     (merge explicit)
              |                                              |
              v                                              v
      resolveVariableValues(userId, keys) --> merged vars --> renderVariables
                                  |                             
                                  v                             
                Step 3: Project / Story references
      projectId -> "Project: <id>" in injectedContext
      storyId   -> "Story: <id>"  in injectedContext
                                  |
                                  v
                Step 4: Creative Memory
      buildPromptContext(userId, moduleType)
              |        |
              |        +--> getContextSummary(context)
              |                         |
              |                 non-empty? --> prepend, record
              v
                Step 5: Compose EnrichedPrompt
      { prompt: summary + resolved,
        injectedContext, resolvedVariables, metadata }
```

---

## Variable Resolution Sequence

1. **Explicit variables** — if `options.variables` is provided, they are rendered first and merged into `resolvedVariables`
2. **Stored variables** — remaining placeholders are extracted with `extractVariables`; on any match, `resolveVariableValues(userId, keys)` loads the user's stored `promptVariables` rows, merges with the explicit map, and re-renders
3. **Defaults** — any placeholder still unresolved falls back to `DEFAULT_VARIABLES` inside `renderVariables`
4. Unresolvable placeholders remain in place (kept verbatim) and do not abort enrichment

Precedence: explicit request variables > stored user variables > `DEFAULT_VARIABLES`.

---

## Creative Memory Integration

- The module type routes to the correct Creative Memory subset via `buildPromptContext(userId, moduleType)`
- `buildPromptContext` returns brand profile, top-20 preferences, and up to 10 recent memories filtered by `source = moduleType`, ordered by score then recency
- The sanitized, human-readable summary is generated by `getContextSummary` and prepended as plain text, separated by a blank line
- On any failure inside the Creative Memory call, enrichment degrades gracefully: the error is caught, `creativeSummary` stays empty, and the prompt is returned with variables resolved only

---

## Example

Request:

```json
{
  "prompt": "Create a promotional {{cta}} banner about {{product_name}} for our {{target_audience}} using premium colors.",
  "moduleType": "marketing",
  "projectId": "prj_xxx",
  "storyId": "sto_yyy",
  "variables": { "cta": "Shop now" }
}
```

Result:

```json
{
  "success": true,
  "data": {
    "prompt": "[Brand Identity]\nName: Aurora Skincare\n...\n\n[User Preferences]\nvisual/color_palette: soft pastels (confidence: 92%)\n\nCreate a promotional Shop now banner about Product for our Young professionals using premium colors.",
    "injectedContext": [
      "Creative memory brand/style context injected",
      "Project: prj_xxx",
      "Story: sto_yyy"
    ],
    "resolvedVariables": {
      "cta": "Shop now",
      "product_name": "Product",
      "target_audience": "Young professionals"
    },
    "metadata": {
      "extractedKeys": ["cta", "product_name", "target_audience"],
      "hadCreativeContext": true
    }
  }
}
```
