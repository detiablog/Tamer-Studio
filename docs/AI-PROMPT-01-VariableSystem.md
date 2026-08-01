# AI Prompt Intelligence - Variable System

## Overview

The Variable System lets users define reusable placeholder values that are substituted into prompt text before execution. Variables are stored in `prompt_variables`, are scoped per user, and resolve with a strict precedence chain: explicit request variables, then stored user variables, then built-in defaults.

- **File**: `src/core/prompt-intelligence/prompt-variable.service.ts`
- **Export**: `promptVariableService` (singleton)
- **Endpoints**: `GET/POST /api/prompts/variables`, `PUT/DELETE /api/prompts/variables/[id]`, `POST /api/prompts/render`

---

## Variable Structure

A variable row in `prompt_variables`:

| Field | Type | Description |
| --- | --- | --- |
| `id` | text (PK) | Prefix `pvar` |
| `userId` | text | Owner user (required) |
| `name` | varchar(100) | Display name |
| `key` | varchar(100) | Placeholder key (must be unique per user) |
| `value` | text | Substitution value |
| `description` | text | Optional human description |
| `category` | varchar(100) | Optional grouping |
| `isDefault` | boolean | Marks built-in default variables |
| `metadata` | jsonb | Extension data |
| `createdAt` / `updatedAt` | timestamp | Timestamps |

Uniqueness is enforced with the composite unique index `prompt_var_user_key_unique (userId, key)`.

---

## Default Variables

`DEFAULT_VARIABLES` (from `prompt-variable.service.ts`) provide fallbacks for common placeholders when a user has not defined the variable:

| Key | Default Value |
| --- | --- |
| `brand_name` | `Tamer Studio` |
| `product_name` | `Product` |
| `target_audience` | `General audience` |
| `language` | `English` |
| `cta` | `Learn more` |
| `platform` | `` (empty) |
| `character_name` | `` (empty) |
| `story_theme` | `` (empty) |
| `thumbnail_style` | `` (empty) |

Empty-value defaults DO NOT substitute: a variable with an empty default is left unresolved rather than replaced with an empty string.

---

## Placeholder Syntax

Placeholders appear as double-mustache tags around a key:

```
{{key}}

{{ key }}          (whitespace inside is allowed)
{{section.key}}    (dotted keys are matched and extracted)
```

Key detection regex:

```
/\{\{\s*([\w.]+)\s*\}\}/g
```

Placeholders can be used inside prompt `content` text, template content, or the analyzer's variable detection.

---

## Variable Rendering

`renderVariables(prompt, variables)` performs two passes:

### Pass 1 — Resolvable substitution

For each placeholder, the value is resolved as:

```
value = variables[key] ?? DEFAULT_VARIABLES[key]
```

- If the value is defined and non-empty, it is substituted and the key is added to `used`
- Otherwise, the key is added to `unresolved` and the placeholder is left verbatim

### Pass 2 — Force substitution

A second pass replaces any remaining placeholder whose key exists in the supplied `variables` map, even if its value is empty:

```typescript
const final = rendered.replace(variablePattern, (match, key) =>
  variables[key] !== undefined ? variables[key] : match
);
```

### Return Value

```typescript
{
  rendered: string;       // prompt after substitution
  unresolved: string[];   // keys that could not be resolved
  used: string[];         // keys that were referenced in the prompt
}
```

---

## Variable Extraction

`extractVariables(prompt)` returns the unique list of placeholder keys in a prompt:

```typescript
const matches = [...new Set(prompt.match(/\{\{\s*([\w.]+)\s*\}\}/g) || [])];
return matches.map((m) => m.replace(/\{\{\s*|\s*\}\}/g, ""));
```

---

## Variable Resolution

### Batch resolution

`resolveVariableValues(userId, keys)` loads stored values in a single query:

```typescript
db.select()
  .from(promptVariables)
  .where(and(
    eq(promptVariables.userId, userId),
    sql`${promptVariables.key} IN (${sql.join(keys.map(k => sql`${k}`), sql`, `)})`
  ));
```

Returns a `Record<key, value>` for the matching keys only.

### Full resolution precedence (used by the Context Builder)

```
1. Explicit variables provided at request time  (highest)
2. Stored user variables (prompt_variables)     (middle)
3. DEFAULT_VARIABLES                            (lowest)
```

Anything still unresolved after all three layers is left in the prompt text verbatim and reported in `unresolved`.

---

## Variable CRUD

| Operation | Service Method | Endpoint |
| --- | --- | --- |
| List (search/category/paged) | `listVariables(userId, filters)` | `GET /api/prompts/variables` |
| Create | `createVariable(userId, data)` | `POST /api/prompts/variables` |
| Read | `getVariable(id)` | `(via list/detail)` |
| Update | `updateVariable(id, data)` | `PUT /api/prompts/variables/[id]` |
| Delete | `deleteVariable(id)` | `DELETE /api/prompts/variables/[id]` |
| Render ad hoc | `renderVariables(prompt, variables)` | `POST /api/prompts/render` |
| Stats | `getStats(userId)` | (dashboard aggregate) |

`listVariables` defaults to page 1, limit 50, with a maximum limit of 200.

---

## Rendering in the Context Builder

The Context Builder (`prompt-context-builder.service.ts`) uses the Variable System as follows:

1. If explicit variables are supplied, render them first
2. Extract remaining keys, load stored values with `resolveVariableValues`, merge, and render again
3. Return the resolved prompt, plus `resolvedVariables` and `extractedKeys` in metadata

---

## Example

Given stored variables for user `u1`:

```
product_name = "Aurora Glow Serum"
target_audience = "Young professionals"
```

Prompt:

```
Create a promotional banner about {{product_name}} for {{target_audience}}.
CTA: {{cta}} | Language: {{language}}
```

Rendered (via Context Builder, no explicit variables):

```
Create a promotional banner about Aurora Glow Serum for Young professionals.
CTA: Learn more | Language: English
```

- `used`: `["product_name", "target_audience", "cta", "language"]`
- `unresolved`: `[]`
- `brand_name` was not referenced; the `platform` placeholder would remain verbatim (empty default)
