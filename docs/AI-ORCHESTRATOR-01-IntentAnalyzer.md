# AI Orchestrator - Intent Analyzer

## Overview

The Intent Analyzer classifies natural language user input into one of 10 predefined intent types, recommends relevant AI modules, suggests pipeline templates, and extracts structured parameters from the input text.

- Source: `src/core/orchestrator/intent-analyzer.service.ts`
- API: `POST /api/orchestrator/analyze`

## Intent Detection Algorithm

The Intent Analyzer uses a keyword-matching algorithm:

1. **Normalize Input**: Convert input to lowercase
2. **Score Each Intent**: For each intent type, count how many of its keywords appear in the input
3. **Calculate Confidence**: `confidence = matchingKeywords / totalKeywordsForIntent`
4. **Select Best Match**: The intent with the highest confidence score wins
5. **Cap Confidence**: Final confidence is capped at 95% (`Math.min(bestConfidence * 100, 95)`)
6. **Return "unknown"**: If no keywords match, the intent is "unknown" with 0% confidence

### Algorithm Pseudocode

```
function analyzeIntent(input, userId):
    lowerInput = input.toLowerCase()
    bestIntent = "unknown"
    bestConfidence = 0

    for each (intent, keywords) in intentKeywords:
        matches = keywords.filter(kw => lowerInput.includes(kw)).length
        confidence = matches / keywords.length
        if confidence > bestConfidence:
            bestConfidence = confidence
            bestIntent = intent

    templates = DB.select(orchestratorTemplate)
        .where(type == bestIntent AND isActive == true)
        .orderBy(usageCount DESC)
        .limit(1)

    return {
        intent: bestIntent,
        confidence: min(bestConfidence * 100, 95),
        suggestedTemplateId: templates[0]?.id,
        extractedParameters: extractParameters(lowerInput),
        recommendedModules: getRecommendedModules(bestIntent)
    }
```

## Supported Intent Types

| Intent Type            | Keywords                                                                                  |
|------------------------|-------------------------------------------------------------------------------------------|
| `affiliate_campaign`   | affiliate, product, promotion, campaign, sell, marketing, conversion                      |
| `drama_series`         | drama, series, episode, story arc, character development, soap opera                      |
| `product_images`       | product image, photo, picture, visual, mockup, product shot                               |
| `marketing_assets`     | marketing, ad, banner, poster, flyer, social media                                        |
| `video_creation`       | video, reel, short, tiktok, youtube, clip, animation                                      |
| `content_repurpose`    | repurpose, reuse, adapt, convert, transform, remake                                       |
| `optimize_content`     | optimize, improve, enhance, boost, better, a/b test                                       |
| `publish_campaign`     | publish, post, schedule, upload, share, distribute                                        |
| `story_creation`       | story, narrative, write, fiction, book, novel, script                                      |
| `thumbnail_generation` | thumbnail, cover, preview, headline image                                                 |

## Keyword Matching

### Matching Rules

- All matching is case-insensitive (input is lowercased before comparison)
- Keywords are matched as substrings within the input using `String.includes()`
- Each keyword is compared independently; no phrase matching is performed
- A keyword like "product image" will match "I need a product image for my store" but also "product image editing"

### Confidence Calculation

- Each intent type has 6-7 keywords
- Confidence = (number of matched keywords) / (total keywords for that intent)
- Final confidence = min(confidence * 100, 95) as a percentage
- Example: If 3 out of 7 keywords for `affiliate_campaign` match, confidence = 3/7 * 100 = 42.8%

### Limitations

- The algorithm does not use NLP or semantic analysis
- Multi-word keywords like "product image" are matched as substrings
- Ambiguous inputs with keywords from multiple intents are resolved by highest score
- The "unknown" intent has an empty keyword list and can never score above 0

## Template Suggestion

After determining the intent type, the analyzer queries the database for active templates:

```typescript
const templates = await db
  .select()
  .from(orchestratorTemplate)
  .where(and(
    eq(orchestratorTemplate.isActive, true),
    eq(orchestratorTemplate.type, bestIntent)
  ))
  .orderBy(desc(orchestratorTemplate.usageCount))
  .limit(1);
```

- Templates are filtered by `isActive = true` and `type` matching the detected intent
- The most-used template (by `usageCount`) is returned as the suggestion
- If no template exists for the intent, `suggestedTemplateId` is `undefined`

## Parameter Extraction

The `extractParameters` method uses regex to extract structured data from input:

### Platform Detection

```typescript
const platformMatch = input.match(/(tiktok|instagram|youtube|facebook|twitter|x|linkedin)/i);
if (platformMatch) params.platform = platformMatch[1].toLowerCase();
```

Supported platforms: tiktok, instagram, youtube, facebook, twitter, x, linkedin

### Count and Content Type Extraction

```typescript
const countMatch = input.match(/(\d+)\s*(image|video|post|episode|scene)/i);
if (countMatch) params.count = parseInt(countMatch[1]);
if (countMatch) params.contentType = countMatch[2].toLowerCase();
```

Examples:
- "Create 5 images" -> `{ count: 5, contentType: "image" }`
- "Make 3 videos for tiktok" -> `{ platform: "tiktok", count: 3, contentType: "video" }`
- "Write 10 episodes" -> `{ count: 10, contentType: "episode" }`

### Output Format

```typescript
interface IntentResult {
  intent: IntentType;
  confidence: number;              // 0-95 (percentage)
  suggestedTemplateId?: string;    // ID of most-used matching template
  extractedParameters: Record<string, unknown>;  // platform, count, contentType
  recommendedModules: string[];    // Module IDs for the detected intent
}
```

## Intent Labels

Human-readable labels for each intent type:

| Intent Type            | Label                    |
|------------------------|--------------------------|
| `affiliate_campaign`   | Affiliate Campaign       |
| `drama_series`         | Drama Series             |
| `product_images`       | Product Images           |
| `marketing_assets`     | Marketing Assets         |
| `video_creation`       | Video Creation           |
| `content_repurpose`    | Content Repurposing      |
| `optimize_content`     | Content Optimization     |
| `publish_campaign`     | Publish Campaign         |
| `story_creation`       | Story Creation           |
| `thumbnail_generation` | Thumbnail Generation     |
| `unknown`              | Unknown Intent           |
