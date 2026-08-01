# AI Creative Memory System - Overall Architecture

## System Overview and Purpose

The AI Creative Memory System is a persistent, intelligent memory layer for Tamer Studio's AI-powered creative modules. It enables the platform to learn from user behavior, remember creative preferences, and maintain contextual continuity across sessions. The system stores brand profiles, visual styles, story elements, character definitions, workflow preferences, publishing strategies, and learning events -- then injects this context into AI prompts to deliver personalized, consistent creative output.

### Core Objectives

1. **Personalization**: Learn user preferences across prompts, styles, assets, and workflows
2. **Brand Consistency**: Enforce brand identity rules across all creative outputs
3. **Contextual Continuity**: Maintain creative context across sessions and modules
4. **Privacy Control**: Give users full control over learning, retention, and data lifecycle

---

## Architecture Diagram

```
+---------------------+
|    User Activity     |
| (prompts, edits,    |
|  favorites, publish)|
+----------+----------+
           |
           v
+----------+----------+
|  Learning Engine     |
| (event recording,   |
|  preference infer)  |
+----------+----------+
           |
           v
+----------+----------+     +-------------------+
|  Creative Memory    |<--->|  PostgreSQL DB     |
|  Service (CRUD)     |     | (13 tables)       |
+----------+----------+     +-------------------+
           |
           v
+----------+----------+
|  Preference Engine  |
| (confidence score,  |
|  auto-inference)    |
+----------+----------+
           |
           v
+----------+----------+
|  Style Engine       |
| (visual, thumbnail, |
|  caption memories)  |
+----------+----------+
           |
           v
+----------+----------+
|  Context Builder    |
| (assemble context,  |
|  generate summary)  |
+----------+----------+
           |
           v
+----------+----------+
|    AI Runtime       |
| (module prompts,    |
|  context injection) |
+----------+----------+
           |
           v
+----------+----------+
|    AI Modules       |
| (Image, Video,      |
|  Affiliate, Drama,  |
|  Story, Project)    |
+----------+----------+
           |
           v
+----------+----------+
|    Analytics        |
| (stats, learning    |
|  metrics)           |
+----------+----------+
           |
           v
+----------+----------+
| Continuous Learning |
| (feedback loop,     |
|  preference update) |
+---------------------+
```

---

## Core Components

### 1. Creative Memory Service

- **File**: `src/core/creative-memory/creative-memory.service.ts`
- **Responsibility**: Central CRUD operations for all memory types
- **ID Prefixes**: `cmem` (memories), `cbpf` (brand profiles), `cpref` (preferences), `cle` (learning events), `cstm` (stories), `ccrm` (characters), `cwfm` (workflows), `cgen` (generations), `cpub` (publishing), `cset` (settings)

### 2. Learning Engine Service

- **File**: `src/core/creative-memory/learning-engine.service.ts`
- **Responsibility**: Records user events, infers preferences from behavioral patterns
- **Key Methods**: `processEvent()`, `recordPromptUsage()`, `recordAssetPreference()`, `recordStylePreference()`, `inferPreferences()`

### 3. Style Engine Service

- **File**: `src/core/creative-memory/style-engine.service.ts`
- **Responsibility**: Manages visual, thumbnail, and caption memory types
- **Key Methods**: CRUD for visual/thumbnail/caption memories, `getStyleStats()`, `getActiveVisualStyle()`

### 4. Context Builder Service

- **File**: `src/core/creative-memory/context-builder.service.ts`
- **Responsibility**: Assembles creative context from all memory types, generates AI-ready summaries
- **Key Methods**: `buildContext()`, `buildPromptContext()`, `getContextSummary()`, `getSuggestions()`, `searchContext()`

---

## Data Flow

### Primary Flow

```
User Activity (prompt, edit, favorite, download, publish)
    |
    v
Learning Engine -> Records Event -> Infer Preferences
    |
    v
Creative Memory Service -> Persist to Database
    |
    v
Preference Engine -> Update Confidence Scores
    |
    v
Style Engine -> Update Visual/Thumbnail/Caption Memories
    |
    v
Context Builder -> Assemble Context -> Generate Summary
    |
    v
AI Runtime -> Inject Context into Prompts
    |
    v
AI Modules -> Generate Personalized Output
    |
    v
Analytics -> Track Usage Metrics
    |
    v
Continuous Learning -> Feed Back to Learning Engine
```

### Context Injection Flow

When a user invokes an AI module:

1. **Context Builder** queries all relevant memory tables
2. **Brand Profile** (active) is loaded for brand consistency
3. **Visual/Story/Character/Thumbnail/Caption** memories are loaded
4. **Preferences** are loaded, ordered by confidence
5. **Recent memories** are loaded by category and source
6. **Summary** is generated as structured text
7. **Summary** is injected into the AI prompt as system context

---

## Integration Points

### AI Image Studio

- Consumes visual memory (color palette, composition, lighting, camera angle)
- Uses brand profile for color consistency and watermark application
- Records generation memories with prompts and parameters

### AI Video Studio

- Uses story memories for narrative structure
- Uses character memories for consistent character representation
- Records generation memories with video-specific parameters

### AI Affiliate Studio

- Uses caption memories for writing style and CTA patterns
- Uses publishing memory for platform preferences and scheduling
- Records generation memories for affiliate content

### AI Drama Studio

- Uses story memories for episode structure and scene patterns
- Uses character memories for dialogue style and personality
- Records generation memories for drama content

### AI Story Engine

- Uses story memories for universe, timeline, and story rules
- Uses character memories for relationships and speech patterns
- Records generation memories for story content

### AI Project Studio

- Uses workflow memories for generation order and automation rules
- Uses publishing memory for platform-specific publishing flows
- Records generation memories with project-level context

---

## Service Layer Architecture

```
src/core/creative-memory/
    index.ts                    # Public exports
    creative-memory.service.ts  # Central CRUD service
    learning-engine.service.ts  # Event recording and preference inference
    style-engine.service.ts     # Visual/thumbnail/caption management
    context-builder.service.ts  # Context assembly and summary generation
```

### Module Exports

```typescript
export {
  creativeMemoryService,
  CreativeMemoryService,
} from "./creative-memory.service";

export {
  contextBuilderService,
  ContextBuilderService,
} from "./context-builder.service";

export {
  learningEngineService,
  LearningEngineService,
} from "./learning-engine.service";

export {
  styleEngineService,
  StyleEngineService,
} from "./style-engine.service";
```

---

## Database Schema Overview

The system uses 13 PostgreSQL tables managed via Drizzle ORM:

| Table | Purpose | ID Prefix |
|-------|---------|-----------|
| `creative_memory` | General key-value memories | `cmem` |
| `creative_brand_profile` | Brand identity profiles | `cbpf` |
| `creative_preference` | User preferences with confidence | `cpref` |
| `creative_learning_event` | Recorded learning events | `cle` |
| `creative_visual_memory` | Visual style preferences | `cvis` |
| `creative_story_memory` | Story/narrative memories | `cstm` |
| `creative_character_memory` | Character definitions | `ccrm` |
| `creative_thumbnail_memory` | Thumbnail style patterns | `cthm` |
| `creative_caption_memory` | Caption writing patterns | `ccap` |
| `creative_workflow_memory` | Workflow preferences | `cwfm` |
| `creative_generation_memory` | Generation history | `cgen` |
| `creative_publishing_memory` | Publishing preferences | `cpub` |
| `creative_memory_settings` | User settings | `cset` |

### Key Relationships

- All tables are user-scoped via `userId` foreign key
- No cross-table foreign keys (denormalized for query performance)
- JSONB columns used for flexible nested data structures
- Unique constraint on `(userId, key)` in `creative_preference`
- Unique constraint on `userId` in `creative_memory_settings` (one settings record per user)

---

## File Structure

```
src/
  core/creative-memory/
    index.ts
    creative-memory.service.ts
    learning-engine.service.ts
    style-engine.service.ts
    context-builder.service.ts
  lib/db/schema/
    creative-memory.ts
  app/api/memory/
    route.ts                    # GET/POST general memories
    [id]/route.ts               # GET/PUT/DELETE specific memory
    brand/route.ts              # GET/POST brand profiles
    brand/[id]/route.ts         # GET/PUT/DELETE brand profile
    context/route.ts            # POST build context
    learning/route.ts           # GET/POST learning events
    preferences/route.ts        # GET/POST preferences
    preferences/[id]/route.ts   # GET/PUT/DELETE preference
    visual/route.ts             # GET/POST visual memories
    visual/[id]/route.ts        # GET/PUT/DELETE visual memory
    story/route.ts              # GET/POST story memories
    story/[id]/route.ts         # GET/PUT/DELETE story memory
    character/route.ts          # GET/POST character memories
    character/[id]/route.ts     # GET/PUT/DELETE character memory
    thumbnail/route.ts          # GET/POST thumbnail memories
    thumbnail/[id]/route.ts     # GET/PUT/DELETE thumbnail memory
    caption/route.ts            # GET/POST caption memories
    caption/[id]/route.ts       # GET/PUT/DELETE caption memory
    workflow/route.ts           # GET/POST workflow memories
    workflow/[id]/route.ts      # GET/PUT/DELETE workflow memory
    generation/route.ts         # GET/POST generation memories
    generation/[id]/route.ts    # GET/PUT/DELETE generation memory
    publishing/route.ts         # GET/POST/PUT publishing memory
    stats/route.ts              # GET memory statistics
    settings/route.ts           # GET/POST/PUT user settings
    search/route.ts             # GET search across memories
    suggestions/route.ts        # GET memory suggestions
    export/route.ts             # GET full export
    import/route.ts             # POST full import
    clear/route.ts              # POST clear memories
    admin/
      analytics/route.ts        # GET admin analytics
      rules/route.ts            # GET/POST learning rules
      clear/route.ts            # POST admin clear
      reset-learning/route.ts   # POST reset learning data
```
