# AI Prompt Intelligence - Prompt Analyzer

## Overview

The Prompt Analyzer is a deterministic, rule-based quality analysis engine. It inspects prompt text against a set of structural and content heuristics and returns a normalized analysis report. It does not call an LLM; it runs entirely server-side with zero external dependencies, which makes it fast, predictable, and free to invoke.

- **File**: `src/core/prompt-intelligence/prompt-analyzer.service.ts`
- **Export**: `promptAnalyzerService` (singleton) and `PromptAnalyzerService`
- **Endpoints**: `POST /api/prompts/analyze`, `POST /api/prompts/testing/estimates`

---

## Analysis Result Structure

The analyzer returns a `PromptAnalysis` object:

```typescript
interface PromptAnalysis {
  qualityScore: number;      // 0 - 100
  length: number;            // character count
  wordCount: number;         // whitespace-delimited words
  clarity: number;           // 0 - 100
  structure: number;         // 0 - 100
  contextScore: number;      // 0 - 100
  ambiguityScore: number;    // 0 - 100
  estimatedTokens: number;   // ceil(length / 4)
  issues: string[];          // detected problems
  suggestions: string[];     // actionable improvements
  strengths: string[];       // positive findings
  hasVariables: boolean;     // contains {{…}} placeholders
  hasInjectionsNeeded: boolean; // context injection recommended
  riskLevel: "low" | "medium" | "high";
}
```

---

## Quality Scoring Algorithm

The composite `qualityScore` is a weighted average of four sub-scores:

```
qualityScore = round(clamp(
    clarity       * 0.40
  + structure     * 0.25
  + contextScore  * 0.15
  + ambiguityScore* 0.20
, 0, 100))
```

### Sub-score Calculation

#### Clarity

Eight binary checks determine `passedChecks`:

| # | Check | Regex |
| --- | --- | --- |
| 1 | `hasSubject` | `/(of|about|showing|featuring|with)/i` |
| 2 | `hasStyle` | `/(style|mood|atmosphere|aesthetic|look|feel)/i` |
| 3 | `hasContext` | `/(for|targeting|audience|platform|use.?case|purpose)/i` |
| 4 | `hasFormat` | `/(aspect.?ratio|resolution|16:9|9:16|4:3|size|dimension)/i` |
| 5 | `hasLighting` | `/(lighting|light|golden.?hour|soft.?light|dramatic)/i` |
| 6 | `hasCamera` | `/(camera|angle|shot|macro|wide.?shot|close.?up|len)/i` |
| 7 | `hasAction` | `/(showing|doing|wearing|holding|surrounded|in the)/i` |
| 8 | `hasPositiveDriver` | `/(cinematic|professional|high.?quality|detailed|vibrant|premium|elegant)/i` |

```
clarity = min(100, 40 + (passedChecks / 8) * 50)
```

Baseline is 40; each passed check adds up to ~6.25 points.

#### Structure

```
structure = min(100,
   30
 + (length > 50 ? 40 : 20)
 + (contains "," ? 20 : 0)
 + (contains "\n" ? 10 : 0))
```

Minimum 30, maximum 100. Longer prompts, comma-separated concepts, and multi-paragraph prompts score higher.

#### Context Score

```
contextScore = hasContext ? 80 : (hasSubject ? 60 : 30)
```

#### Ambiguity Score

```
ambiguityScore = max(0, 100 - issues.length * 12)
```

---

## Analysis Dimensions

| Dimension | Range | Meaning |
| --- | --- | --- |
| `clarity` | 0 - 100 | Subject, style, context, format, lighting, camera, action, and quality framing |
| `structure` | 0 - 100 | Length adequacy, punctuation use, multi-line organization |
| `contextScore` | 0 - 100 | Presence of purpose/audience/platform framing |
| `ambiguityScore` | 0 - 100 | Penalized by count of detected issues |

---

## Issue Detection

Issues are collected as human-readable strings with paired suggestions:

| Condition | Issue | Suggestion |
| --- | --- | --- |
| `length < 20` | "Prompt is too short to provide sufficient context." | "Add more detail about the subject, style, and desired outcome." |
| `length > 4000` | "Prompt exceeds 4000 characters and may exceed context limits." | "Consider condensing the prompt or splitting it into sections." |
| `wordCount < 10` | "Very few words provided; the model may lack direction." | (none) |
| No comma and `wordCount > 15` | (suggestion only) | "Consider using commas to separate distinct concepts and instructions." |
| `!hasSubject` | "The main subject is unclear." | "Clearly specify the main subject at the start of the prompt." |
| `!hasStyle` | "No visual or writing style is specified." | "Add a stylistic guide, e.g. 'cinematic style' or 'clean minimal style'." |
| `!hasPositiveDriver` | (suggestion only) | "Add descriptive quality modifiers like 'premium', 'detailed', or 'professional'." |
| Ambiguity regex match | "Some words are ambiguous and could be interpreted differently." | "Replace vague terms like 'nice' or 'thing' with concrete descriptions." |
| Unsafe regex match | "Prompt contains potentially unsafe content." | (none) |

Ambiguity pattern:

```
/(thing|stuff|nice|good|beautiful|great something|etc|whatever)/i
```

---

## Strengths

The analyzer also reports positive findings:

- "Good subject, style, and quality framing." (subject + positive driver + style)
- "Format and dimensions are specified." (`hasFormat`)
- "Lighting conditions are described." (`hasLighting`)
- "Camera and angle details are provided." (`hasCamera`)
- "Context and target audience are considered." (`hasContext`)
- "Subject action or position is described." (`hasAction`)

---

## Token Estimation

Token estimation is a heuristic based on character count:

```
estimatedTokens = ceil(length / 4)
```

This assumes roughly 4 characters per token for mixed English/creative prompts. It is used as an input to the testing service's credit estimate:

```
estimatedCredits = ceil(estimatedTokens * 0.02)
```

---

## Risk Level Detection

Risk is classified into three levels:

| Pattern | Risk Level |
| --- | --- |
| Unsafe regex match | `high` |
| Otherwise, missing `hasSubject` or `hasStyle` | `medium` |
| Default | `low` |

Unsafe content pattern:

```
/(nsfw|nude|gore|explicit|illegal|harm|intimate|unsafe)/i
```

---

## Variable Detection

- `hasVariables` is `true` when the prompt contains placeholder syntax `{{\s*[\w.]+\s*}}`
- `hasInjectionsNeeded` is set when `hasContext` is `false`, signaling that the Context Builder should inject brand/audience context

---

## Analytics Recording

The analyzer exposes two supporting analytics methods:

- `recordAnalytics(userId, { promptId, metricName, value, provider, model, dimensions })` — inserts a row into `promptAnalytics` (ID prefix `panl`)
- `getPromptStats(userId)` — returns `totalAnalytics` and a `byMetric` aggregation (average value and count per `metricName`)

These support quality-score tracking and provider-level metric aggregation used by the Analytics module.

---

## Usage Notes

- The analyzer runs synchronously on regex checks and is O(n) in prompt length
- Analysis is free of external LLM calls, so it can be safely invoked on every keystroke-facing action such as save or submit
- `estimatedTokens` deliberately underestimates for non-English text; the testing service treats it as an estimate only
