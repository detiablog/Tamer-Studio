# AI Prompt Intelligence - Prompt Optimizer

## Overview

The Prompt Optimizer applies deterministic text transformations to improve prompt quality. It works entirely with string rules and the Analyzer for scoring; no LLM is used. The result is a side-by-side before/after comparison with a measurable improvement delta.

- **File**: `src/core/prompt-intelligence/prompt-optimizer.service.ts`
- **Export**: `promptOptimizerService` (singleton)
- **Endpoint**: `POST /api/prompts/optimize`

---

## Optimization Result Structure

```typescript
interface OptimizationResult {
  original: string;      // trimmed original prompt
  optimized: string;     // optimized prompt
  changes: string[];     // human-readable list of applied changes
  scoreBefore: number;   // analyzer qualityScore of original
  scoreAfter: number;    // analyzer qualityScore of optimized
  improvement: number;   // scoreAfter - scoreBefore
}
```

---

## Optimization Strategy

The optimizer applies steps in a fixed order, recording a `changes` entry whenever the text actually changes:

1. Trim surrounding whitespace
2. Fix punctuation and spacing (`fixPunctuation`)
3. Capitalize the first letter (`capitalizeFirst`)
4. Add sentence termination (trailing period) if missing
5. Inject a type-specific style adjective (`addStyleAdjective`)
6. Ensure subject clarity guidance (`ensureSubjectClarity`)
7. Re-run the analyzer on the optimized text to compute `scoreBefore`, `scoreAfter`, and `improvement`

```
original
   |
   v
 [trim]
   |
   v [fixPunctuation] -> changes: "Fixed punctuation and spacing."
   v [capitalizeFirst] -> changes: "Capitalized the first letter."
   v [add "."] -> changes: "Added sentence termination."
   v [addStyleAdjective] -> changes: "Added a stylistic quality modifier."
   v [ensureSubjectClarity] -> changes: "Added subject clarity guidance."
   |
   v
 promptAnalyzerService.analyze(optimized)
   |
   v
 { original, optimized, changes, scoreBefore, scoreAfter, improvement }
```

---

## Punctuation Fixing

`fixPunctuation(text)` applies three regex normalization passes:

| Rule | Replacement |
| --- | --- |
| Collapse 2+ spaces into one | `/\s{2,}/g` → `" "` |
| Remove space before punctuation | `/\s+([,.;:!?])/g` → `"$1"` |
| Collapse repeated commas | `/,{2,}/g` → `","` |
| Collapse runs of 4+ periods into an ellipsis | `/\.{4,}/g` → `"..."` |

If the result differs from the trimmed input, the change `"Fixed punctuation and spacing."` is recorded.

---

## Capitalization

`capitalizeFirst(text)` uppercases the first character:

```typescript
return text.charAt(0).toUpperCase() + text.slice(1);
```

When applied, the change `"Capitalized the first letter."` is recorded.

---

## Sentence Termination

If the prompt does not end with `.` or a newline, a trailing period is appended and `"Added sentence termination."` is recorded:

```typescript
if (!/\.$/.test(optimized) && !optimized.endsWith("\n")) {
  optimized = optimized + ".";
}
```

---

## Style Adjective Injection

`addStyleAdjective(text, type)` skips injection when the text already contains a style word:

```
/(cinematic|professional|high.?quality|detailed|vibrant|premium|elegant|clean|minimal)/i
```

Otherwise it prepends an adjective phrase based on the prompt type:

| Type | Injected Adjective |
| --- | --- |
| `image` | `Detailed, high-quality` |
| `video` | `Cinematic, professionally produced` |
| `affiliate` | `Persuasive, conversion-focused` |
| `drama` | `Emotionally engaging, dramatic` |
| `story` | `Vivid, narrative-driven` |
| `marketing` | `Compelling, brand-aligned` |
| `seo` | `Search-optimized, keyword-rich` |
| any other (incl. default `custom`) | `High-quality` |

Injection lowers the first letter of the original text to keep the phrase grammatical:

```
`${adjective} ${text.charAt(0).toLowerCase()}${text.slice(1)}`
```

When applied, the change `"Added a stylistic quality modifier."` is recorded.

---

## Subject Clarity

`ensureSubjectClarity(text)` verifies that the prompt contains a subject indicator:

```
/(of|about|showing|featuring|with|depicting|portraying)/i
```

Notes on current behavior:

- If the text already contains a subject indicator, it is returned unchanged
- If the text has fewer than 5 words, it is returned unchanged (too terse to transform)
- Otherwise the text is returned unchanged in the current implementation

This method is the designated extension point for future subject-clarification heuristics. It is still invoked in the optimization pipeline and would record `"Added subject clarity guidance."` when a transformation is implemented.

---

## Original vs Optimized Comparison

The optimizer always returns both texts plus scoring metadata:

- `scoreBefore` — analyzer quality score of the trimmed original
- `scoreAfter` — analyzer quality score of the optimized text
- `improvement` — `scoreAfter - scoreBefore`

Example response:

```json
{
  "success": true,
  "data": {
    "original": "a cat sitting on a chair",
    "optimized": "Detailed, high-quality A cat sitting on a chair.",
    "changes": [
      "Capitalized the first letter.",
      "Added sentence termination.",
      "Added a stylistic quality modifier."
    ],
    "scoreBefore": 58,
    "scoreAfter": 66,
    "improvement": 8
  }
}
```

Note: because scoring is deterministic, the `improvement` reflects structural gains from the transformed text and may be zero when transformations do not affect the analyzer's heuristics.

---

## Usage in the Studio

The Prompt Studio optimization tab calls the endpoint and renders:

- Original prompt (left pane)
- Optimized prompt (right pane), extracted via `optimization.content || optimization.optimized || optimization.prompt`
- **Copy Optimized** — writes the optimized text to the clipboard
- **Save to My Prompts** — opens the create-prompt form prefilled with the optimized content
