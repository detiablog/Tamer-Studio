# AI Creative Memory System - Database Design

## Overview

The AI Creative Memory system uses 13 PostgreSQL tables managed via Drizzle ORM. All tables are user-scoped via a `userId` column. No cross-table foreign keys are used (denormalized for query performance). JSONB columns provide flexible nested data structures.

**Schema File**: `src/lib/db/schema/creative-memory.ts`

---

## Table Schemas

### 1. creative_memory

General-purpose key-value memory store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cmem`) |
| `user_id` | text | No | - | Owner identifier |
| `category` | varchar(100) | No | - | Memory category |
| `key` | varchar(200) | No | - | Unique key within category |
| `content` | text | Yes | null | Text content |
| `data` | jsonb | No | `{}` | Structured data |
| `source` | varchar(100) | Yes | null | Origin module/event |
| `score` | integer | Yes | 50 | Relevance score (0-100) |
| `is_pinned` | boolean | No | false | Pinned flag |
| `is_system` | boolean | No | false | System-generated flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `expires_at` | timestamp | Yes | null | Expiration timestamp |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_memory_user_idx` on `user_id`
- `creative_memory_category_idx` on `category`
- `creative_memory_key_idx` on `key`
- `creative_memory_score_idx` on `score`

---

### 2. creative_brand_profile

Brand identity profiles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cbpf`) |
| `user_id` | text | No | - | Owner identifier |
| `name` | varchar(200) | No | - | Brand name |
| `logo` | text | Yes | null | Logo URL/data |
| `primary_colors` | jsonb | No | `[]` | Primary colors |
| `secondary_colors` | jsonb | No | `[]` | Secondary colors |
| `typography` | varchar(200) | Yes | null | Font families |
| `watermark` | text | Yes | null | Watermark image/text |
| `voice` | varchar(100) | Yes | null | Brand voice |
| `tone` | varchar(100) | Yes | null | Brand tone |
| `audience` | text | Yes | null | Target audience |
| `preferred_cta` | text | Yes | null | CTA style |
| `preferred_platforms` | jsonb | No | `[]` | Target platforms |
| `keywords` | jsonb | No | `[]` | Brand keywords |
| `rules` | jsonb | No | `[]` | Brand rules |
| `brand_style_guide` | jsonb | No | `{}` | Extended style guide |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_brand_user_idx` on `user_id`

---

### 3. creative_preference

User preferences with confidence scoring.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cpref`) |
| `user_id` | text | No | - | Owner identifier |
| `category` | varchar(100) | No | - | Preference category |
| `key` | varchar(200) | No | - | Unique key within category |
| `value` | text | No | - | Preference value |
| `confidence` | integer | No | 50 | Confidence score (0-100) |
| `source` | varchar(100) | Yes | null | Inference source |
| `is_editable` | boolean | No | true | Editable flag |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_pref_user_idx` on `user_id`
- `creative_pref_category_idx` on `category`

**Constraints**:
- `creative_pref_user_key_unique` on `(user_id, key)`

---

### 4. creative_learning_event

Recorded learning events.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cle`) |
| `user_id` | text | No | - | Owner identifier |
| `event_type` | varchar(100) | No | - | Event type |
| `category` | varchar(100) | Yes | null | Event category |
| `entity_id` | text | Yes | null | Related entity ID |
| `entity_type` | varchar(50) | Yes | null | Related entity type |
| `data` | jsonb | No | `{}` | Event-specific data |
| `source` | varchar(100) | Yes | null | Event origin |
| `created_at` | timestamp | No | now() | Event timestamp |

**Indexes**:
- `creative_learning_user_idx` on `user_id`
- `creative_learning_type_idx` on `event_type`
- `creative_learning_created_idx` on `created_at`

---

### 5. creative_visual_memory

Visual style preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cvis`) |
| `user_id` | text | No | - | Owner identifier |
| `project_id` | text | Yes | null | Project association |
| `name` | varchar(200) | No | - | Style name |
| `color_palette` | jsonb | No | `[]` | Color palette |
| `composition` | varchar(100) | Yes | null | Composition style |
| `lighting` | varchar(100) | Yes | null | Lighting style |
| `camera_angle` | varchar(100) | Yes | null | Camera angle |
| `lens_style` | varchar(100) | Yes | null | Lens style |
| `aspect_ratio` | varchar(50) | Yes | null | Aspect ratio |
| `background_style` | varchar(100) | Yes | null | Background style |
| `character_position` | varchar(100) | Yes | null | Character position |
| `depth_of_field` | varchar(100) | Yes | null | Depth of field |
| `mood` | varchar(100) | Yes | null | Mood |
| `contrast` | varchar(100) | Yes | null | Contrast |
| `visual_identity` | jsonb | No | `{}` | Visual identity data |
| `preferred_models` | jsonb | No | `[]` | Preferred AI models |
| `preferred_resolution` | varchar(50) | Yes | null | Preferred resolution |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_visual_user_idx` on `user_id`
- `creative_visual_project_idx` on `project_id`

---

### 6. creative_story_memory

Story and narrative context.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cstm`) |
| `user_id` | text | No | - | Owner identifier |
| `story_id` | text | Yes | null | Story association |
| `name` | varchar(200) | No | - | Story name |
| `story_bible` | jsonb | No | `{}` | Story bible data |
| `universe` | jsonb | No | `{}` | Universe data |
| `timeline` | jsonb | No | `{}` | Timeline data |
| `dialogue_style` | jsonb | No | `{}` | Dialogue style |
| `episode_structure` | jsonb | No | `{}` | Episode structure |
| `scene_pattern` | jsonb | No | `{}` | Scene pattern |
| `story_rules` | jsonb | No | `[]` | Story rules |
| `genre_preferences` | jsonb | No | `[]` | Genre preferences |
| `ending_style` | varchar(100) | Yes | null | Ending style |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_story_user_idx` on `user_id`
- `creative_story_story_idx` on `story_id`

---

### 7. creative_character_memory

Character definitions and relationships.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`ccrm`) |
| `user_id` | text | No | - | Owner identifier |
| `character_id` | text | Yes | null | Character association |
| `name` | varchar(200) | No | - | Character name |
| `appearance` | jsonb | No | `{}` | Appearance data |
| `outfits` | jsonb | No | `[]` | Outfit definitions |
| `expressions` | jsonb | No | `[]` | Expression list |
| `accessories` | jsonb | No | `[]` | Accessory list |
| `voice` | varchar(100) | Yes | null | Voice description |
| `relationships` | jsonb | No | `[]` | Character relationships |
| `personality` | jsonb | No | `{}` | Personality traits |
| `speech_pattern` | jsonb | No | `{}` | Speech pattern |
| `visual_references` | jsonb | No | `[]` | Visual reference URLs |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_char_user_idx` on `user_id`
- `creative_char_char_idx` on `character_id`

---

### 8. creative_thumbnail_memory

Thumbnail layout and style patterns.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cthm`) |
| `user_id` | text | No | - | Owner identifier |
| `project_id` | text | Yes | null | Project association |
| `name` | varchar(200) | No | - | Template name |
| `layout` | jsonb | No | `{}` | Layout definition |
| `text_position` | varchar(100) | Yes | null | Text position |
| `color_style` | varchar(100) | Yes | null | Color style |
| `subject_placement` | varchar(100) | Yes | null | Subject placement |
| `brand_elements` | jsonb | No | `{}` | Brand element data |
| `successful_variants` | jsonb | No | `[]` | Successful variants |
| `ctr_history` | jsonb | No | `[]` | CTR history |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_thumb_user_idx` on `user_id`

---

### 9. creative_caption_memory

Caption writing style and patterns.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`ccap`) |
| `user_id` | text | No | - | Owner identifier |
| `project_id` | text | Yes | null | Project association |
| `name` | varchar(200) | No | - | Template name |
| `writing_style` | varchar(100) | Yes | null | Writing style |
| `preferred_length` | varchar(50) | Yes | null | Preferred length |
| `emoji_usage` | varchar(50) | Yes | null | Emoji usage pattern |
| `cta_style` | varchar(100) | Yes | null | CTA style |
| `hashtags` | jsonb | No | `[]` | Hashtag list |
| `platform_variations` | jsonb | No | `{}` | Platform-specific variations |
| `best_performing` | jsonb | No | `[]` | Best performing captions |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_caption_user_idx` on `user_id`

---

### 10. creative_workflow_memory

Workflow automation and template preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cwfm`) |
| `user_id` | text | No | - | Owner identifier |
| `project_id` | text | Yes | null | Project association |
| `name` | varchar(200) | No | - | Workflow name |
| `frequently_used` | jsonb | No | `[]` | Frequently used items |
| `favorite_templates` | jsonb | No | `[]` | Favorite template IDs |
| `automation_rules` | jsonb | No | `[]` | Automation rules |
| `generation_order` | jsonb | No | `[]` | Generation step order |
| `rendering_preferences` | jsonb | No | `{}` | Rendering preferences |
| `publishing_flow` | jsonb | No | `{}` | Publishing flow config |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_workflow_user_idx` on `user_id`

---

### 11. creative_generation_memory

AI generation history with parameters.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cgen`) |
| `user_id` | text | No | - | Owner identifier |
| `project_id` | text | Yes | null | Project association |
| `module_type` | varchar(100) | No | - | AI module type |
| `prompt` | text | Yes | null | Generation prompt |
| `negative_prompt` | text | Yes | null | Negative prompt |
| `parameters` | jsonb | No | `{}` | Generation parameters |
| `result` | jsonb | No | `{}` | Generation result |
| `is_favorite` | boolean | No | false | Favorite flag |
| `performance` | jsonb | No | `{}` | Performance metrics |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_gen_user_idx` on `user_id`
- `creative_gen_module_idx` on `module_type`
- `creative_gen_project_idx` on `project_id`

---

### 12. creative_publishing_memory

Publishing schedule and platform preferences.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cpub`) |
| `user_id` | text | No | - | Owner identifier |
| `preferred_platforms` | jsonb | No | `[]` | Target platforms |
| `posting_time` | jsonb | No | `{}` | Preferred posting times |
| `posting_frequency` | varchar(100) | Yes | null | Posting frequency |
| `scheduling_pattern` | jsonb | No | `{}` | Scheduling pattern |
| `campaign_timing` | jsonb | No | `{}` | Campaign timing |
| `timezone` | varchar(50) | Yes | null | User timezone |
| `publishing_strategy` | jsonb | No | `{}` | Publishing strategy |
| `is_active` | boolean | No | true | Active flag |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_pub_user_idx` on `user_id`

---

### 13. creative_memory_settings

User settings for the creative memory system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text (PK) | No | - | Prefixed ID (`cset`) |
| `user_id` | text | No | - | Owner identifier |
| `learning_enabled` | boolean | No | true | Learning master switch |
| `learning_paused` | boolean | No | false | Pause learning |
| `max_memories` | integer | Yes | 10000 | Memory limit |
| `max_learning_events` | integer | Yes | 5000 | Event limit |
| `auto_cleanup` | boolean | No | true | Auto cleanup flag |
| `retention_days` | integer | Yes | 365 | Retention period |
| `category_limits` | jsonb | No | `{}` | Per-category limits |
| `excluded_categories` | jsonb | No | `[]` | Excluded categories |
| `metadata` | jsonb | No | `{}` | Additional metadata |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Indexes**:
- `creative_settings_user_idx` on `user_id`

**Constraints**:
- `creative_settings_user_unique` on `user_id` (one record per user)

---

## Drizzle Migration Approach

### Schema Definition

All tables are defined in a single schema file:

```typescript
// src/lib/db/schema/creative-memory.ts
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique } from "drizzle-orm/pg-core";

export const creativeMemory = pgTable("creative_memory", {
  // ... columns
}, (table) => [
  index("creative_memory_user_idx").on(table.userId),
  // ... indexes
]);
```

### Migration Generation

```bash
npx drizzle-kit generate
```

### Migration Application

```bash
npx drizzle-kit push
# or
npx drizzle-kit migrate
```

### Relation Definitions

Relations are defined but currently empty (no cross-table FKs):

```typescript
export const creativeMemoryRelations = relations(creativeMemory, ({ one }) => ({}));
```

### Naming Conventions

- **Table names**: `snake_case` with `creative_` prefix
- **Column names**: `snake_case`
- **Index names**: `{table_prefix}_{column}_idx`
- **Constraint names**: `{table_prefix}_{constraint_type}`
