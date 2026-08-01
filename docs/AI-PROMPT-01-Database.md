# AI Prompt Intelligence - Database Design

## Overview

The Prompt Intelligence system uses nine PostgreSQL tables defined with Drizzle ORM in `src/lib/db/schema/prompt-intelligence.ts` and exported from `src/lib/db/schema/index.ts`. All tables use text primary keys generated with the `generateId(prefix)` helper producing `{prefix}_{timestamp36}_{randomhex}`.

### Tables

| # | Table | Purpose |
| --- | --- | --- |
| 1 | `prompt_library` | User prompts |
| 2 | `prompt_templates` | Global system prompt catalog |
| 3 | `prompt_variables` | User-defined placeholder values |
| 4 | `prompt_versions` | Immutable prompt snapshots |
| 5 | `prompt_history` | Prompt execution records |
| 6 | `prompt_collections` | Prompt folders |
| 7 | `prompt_tests` | Test run records |
| 8 | `prompt_analytics` | Numeric metric time-series |
| 9 | `prompt_settings` | Per-user preferences |

### ID Prefixes

| Table | Prefix |
| --- | --- |
| `prompt_library` | `pprm` |
| `prompt_templates` | `ptmpl` |
| `prompt_variables` | `pvar` |
| `prompt_versions` | `pver` |
| `prompt_history` | `phist` |
| `prompt_collections` | `pcol` |
| `prompt_tests` | `ptest` |
| `prompt_analytics` | `panl` |
| `prompt_settings` | `pset` |

---

## Table Schemas

### 1. prompt_library

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL |
| `name` | varchar(200) | NOT NULL |
| `description` | text | NULL |
| `content` | text | NOT NULL |
| `type` | varchar(100) | NOT NULL, default `custom` |
| `category` | varchar(100) | NULL |
| `tags` | jsonb | NOT NULL, default `[]` (`string[]`) |
| `variables` | jsonb | NOT NULL, default `[]` (`string[]`) |
| `is_favorite` | boolean | NOT NULL, default `false` |
| `is_pinned` | boolean | NOT NULL, default `false` |
| `is_archived` | boolean | NOT NULL, default `false` |
| `is_public` | boolean | NOT NULL, default `false` |
| `quality_score` | integer | NOT NULL, default `0` |
| `use_count` | integer | NOT NULL, default `0` |
| `version_number` | integer | NOT NULL, default `1` |
| `collection_id` | text | NULL (FK to `prompt_collections.id`) |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |
| `updated_at` | timestamp | NOT NULL, default `now()`, auto-update |

### 2. prompt_templates

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `name` | varchar(200) | NOT NULL |
| `description` | text | NULL |
| `content` | text | NOT NULL |
| `type` | varchar(100) | NOT NULL |
| `category` | varchar(100) | NULL |
| `variables` | jsonb | NOT NULL, default `[]` |
| `tags` | jsonb | NOT NULL, default `[]` |
| `is_system` | boolean | NOT NULL, default `false` |
| `is_active` | boolean | NOT NULL, default `true` |
| `usage_count` | integer | NOT NULL, default `0` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |
| `updated_at` | timestamp | NOT NULL, default `now()`, auto-update |

### 3. prompt_variables

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL |
| `name` | varchar(100) | NOT NULL |
| `key` | varchar(100) | NOT NULL |
| `value` | text | NOT NULL |
| `description` | text | NULL |
| `category` | varchar(100) | NULL |
| `is_default` | boolean | NOT NULL, default `false` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |
| `updated_at` | timestamp | NOT NULL, default `now()`, auto-update |

### 4. prompt_versions

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `prompt_id` | text | NOT NULL |
| `user_id` | text | NOT NULL |
| `version_number` | integer | NOT NULL |
| `content` | text | NOT NULL |
| `changes` | text | NULL |
| `quality_score` | integer | NOT NULL, default `0` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |

### 5. prompt_history

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL |
| `prompt_id` | text | NULL |
| `version_number` | integer | NULL |
| `resolved_prompt` | text | NOT NULL |
| `provider` | varchar(100) | NULL |
| `model` | varchar(200) | NULL |
| `credits_used` | integer | NOT NULL, default `0` |
| `execution_time_ms` | integer | NOT NULL, default `0` |
| `result_reference` | text | NULL |
| `project_reference` | text | NULL |
| `status` | varchar(50) | NOT NULL, default `completed` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |

### 6. prompt_collections

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL |
| `name` | varchar(200) | NOT NULL |
| `description` | text | NULL |
| `color` | varchar(50) | NULL |
| `is_pinned` | boolean | NOT NULL, default `false` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |
| `updated_at` | timestamp | NOT NULL, default `now()`, auto-update |

### 7. prompt_tests

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL |
| `prompt_id` | text | NULL |
| `version_number` | integer | NULL |
| `test_name` | varchar(200) | NOT NULL |
| `resolved_prompt` | text | NOT NULL |
| `provider` | varchar(100) | NULL |
| `model` | varchar(200) | NULL |
| `estimated_tokens` | integer | NOT NULL, default `0` |
| `estimated_credits` | integer | NOT NULL, default `0` |
| `actual_credits` | integer | NOT NULL, default `0` |
| `execution_time_ms` | integer | NOT NULL, default `0` |
| `result` | jsonb | NOT NULL, default `{}` |
| `status` | varchar(50) | NOT NULL, default `pending` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |

### 8. prompt_analytics

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL |
| `prompt_id` | text | NULL |
| `metric_name` | varchar(100) | NOT NULL |
| `value` | real | NOT NULL |
| `provider` | varchar(100) | NULL |
| `model` | varchar(200) | NULL |
| `dimensions` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |

### 9. prompt_settings

| Column | Type | Constraints / Default |
| --- | --- | --- |
| `id` | text | PK |
| `user_id` | text | NOT NULL, UNIQUE |
| `auto_optimize` | boolean | NOT NULL, default `true` |
| `auto_inject_context` | boolean | NOT NULL, default `true` |
| `auto_validate` | boolean | NOT NULL, default `true` |
| `default_type` | varchar(50) | NOT NULL, default `custom` |
| `max_prompt_length` | integer | NOT NULL, default `4000` |
| `show_quality_score` | boolean | NOT NULL, default `true` |
| `notification_enabled` | boolean | NOT NULL, default `true` |
| `metadata` | jsonb | NOT NULL, default `{}` |
| `created_at` | timestamp | NOT NULL, default `now()` |
| `updated_at` | timestamp | NOT NULL, default `now()`, auto-update |

---

## Indexes

| Index | Table | Columns |
| --- | --- | --- |
| `prompt_library_user_idx` | `prompt_library` | `user_id` |
| `prompt_library_type_idx` | `prompt_library` | `type` |
| `prompt_library_category_idx` | `prompt_library` | `category` |
| `prompt_library_favorite_idx` | `prompt_library` | `user_id`, `is_favorite` |
| `prompt_template_type_idx` | `prompt_templates` | `type` |
| `prompt_template_category_idx` | `prompt_templates` | `category` |
| `prompt_var_user_idx` | `prompt_variables` | `user_id` |
| `prompt_var_user_key_unique` | `prompt_variables` | `user_id`, `key` (UNIQUE) |
| `prompt_ver_prompt_idx` | `prompt_versions` | `prompt_id` |
| `prompt_ver_user_idx` | `prompt_versions` | `user_id` |
| `prompt_hist_user_idx` | `prompt_history` | `user_id` |
| `prompt_hist_prompt_idx` | `prompt_history` | `prompt_id` |
| `prompt_hist_created_idx` | `prompt_history` | `created_at` |
| `prompt_collection_user_idx` | `prompt_collections` | `user_id` |
| `prompt_test_user_idx` | `prompt_tests` | `user_id` |
| `prompt_test_prompt_idx` | `prompt_tests` | `prompt_id` |
| `prompt_analytics_user_idx` | `prompt_analytics` | `user_id` |
| `prompt_analytics_prompt_idx` | `prompt_analytics` | `prompt_id` |

`prompt_settings` has no secondary indexes; its `user_id` column is declared UNIQUE.

---

## Relations

Drizzle relations are defined in the same schema file:

```typescript
promptLibraryRelations = relations(promptLibrary, ({ one }) => ({
  collection: one(promptCollections, {
    fields: [promptLibrary.collectionId],
    references: [promptCollections.id],
  }),
}));

promptCollectionsRelations = relations(promptCollections, ({ many }) => ({
  prompts: many(promptLibrary),
}));
```

### Entity Relationship

```
prompt_collections 1 ──── * prompt_library (collection_id)
prompt_library     1 ──── * prompt_versions (prompt_id)
prompt_library     1 ──── * prompt_history  (prompt_id, version_number)
prompt_library     1 ──── * prompt_tests    (prompt_id, version_number)
prompt_library     1 ──── * prompt_analytics(prompt_id)
```

The remaining relations objects (`promptTemplatesRelations`, `promptVariablesRelations`, `promptVersionsRelations`, `promptHistoryRelations`, `promptTestsRelations`, `promptAnalyticsRelations`, `promptSettingsRelations`) are declared with empty definitions, ready for future wiring.

### Notes on Referential Integrity

- `prompt_settings.user_id` is UNIQUE, enabling natural-per-user upsert semantics
- `prompt_variables` enforces `(user_id, key)` uniqueness
- No `ON DELETE CASCADE` is declared at the database level; cascades (e.g., prompt delete clearing versions, collection delete detaching prompts) are handled in the service layer
- All FK-style columns (`collection_id`, `prompt_id`, `version_number`) are nullable to support orphan-free soft deletion and version-less records

---

## Data Volume Considerations

- `prompt_history` and `prompt_analytics` are the high-volume tables (append-mostly)
- Both carry `user_id` + `created_at` indexes to support the analytics aggregation queries
- `prompt_versions` grows one row per content update and is indexed by `prompt_id`
