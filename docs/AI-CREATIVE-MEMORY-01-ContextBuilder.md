# AI Creative Memory System - Context Builder

## Context Assembly

The Context Builder is responsible for assembling a comprehensive creative context from all memory types and presenting it in a format suitable for AI prompt injection.

### CreativeContext Interface

```typescript
interface CreativeContext {
  brandProfile: BrandProfile | null;
  visualMemory: VisualMemory[];
  storyMemories: StoryMemory[];
  characterMemories: CharacterMemory[];
  thumbnailMemory: ThumbnailMemory[];
  captionMemory: CaptionMemory[];
  workflowMemory: WorkflowMemory[];
  publishingMemory: PublishingMemory | null;
  preferences: Preference[];
  recentMemories: Record<string, Memory[]>;
}
```

### Assembly Process

The `buildContext()` method assembles context in this order:

1. **Brand Profile**: Load the single active brand profile
2. **Publishing Memory**: Load the single active publishing memory
3. **Visual Memories**: Load active visual memories (filtered by project if specified)
4. **Story Memories**: Load all active story memories
5. **Character Memories**: Load all active character memories
6. **Thumbnail Memories**: Load active thumbnail memories (filtered by project if specified)
7. **Caption Memories**: Load active caption memories (filtered by project if specified)
8. **Workflow Memories**: Load active workflow memories (filtered by project if specified)
9. **Preferences**: Load all user preferences ordered by confidence
10. **Recent Memories**: Load recent memories by category and source

### Context Assembly Options

```typescript
buildContext(userId: string, options?: {
  projectId?: string;    // Filter by project
  moduleType?: string;   // Filter recent memories by source module
  categories?: string[]; // Filter recent memories by category
})
```

### Prompt Context (Lightweight)

For quick context needs, `buildPromptContext()` provides a lightweight version:

- Loads only brand profile, top 20 preferences, and 10 recent memories
- Does not load visual, story, character, thumbnail, caption, or workflow memories
- Suitable for modules that need minimal context

```typescript
buildPromptContext(userId: string, moduleType: string)
```

---

## Context Summary Generation

The `getContextSummary()` method converts a `CreativeContext` into a structured text summary suitable for AI prompt injection.

### Summary Sections

Each section is formatted as a labeled block:

#### [Brand Identity]

```
Name: {brand.name}
Voice: {brand.voice}
Tone: {brand.tone}
Audience: {brand.audience}
Primary Colors: {brand.primaryColors.join(", ")}
Secondary Colors: {brand.secondaryColors.join(", ")}
Typography: {brand.typography}
CTA Style: {brand.preferredCta}
Platforms: {brand.preferredPlatforms.join(", ")}
Keywords: {brand.keywords.join(", ")}
Rules:
  - {rule1}
  - {rule2}
```

#### [Visual Style]

Up to 3 visual memories, each formatted as:

```
Style: {visual.name}
Colors: {visual.colorPalette.join(", ")}
Composition: {visual.composition}
Lighting: {visual.lighting}
Camera: {visual.cameraAngle}
Mood: {visual.mood}
Aspect Ratio: {visual.aspectRatio}
Models: {visual.preferredModels.join(", ")}
```

Multiple entries separated by `---`.

#### [Story Context]

Up to 3 story memories:

```
Story: {story.name}
Genres: {story.genrePreferences.join(", ")}
Ending Style: {story.endingStyle}
Rules:
  - {rule1}
```

#### [Characters]

Up to 5 character memories:

```
Character: {character.name}
Voice: {character.voice}
Expressions: {character.expressions.join(", ")}
Accessories: {character.accessories.join(", ")}
```

#### [Thumbnail Style]

Up to 3 thumbnail memories:

```
Thumbnail: {thumbnail.name}
Text Position: {thumbnail.textPosition}
Color Style: {thumbnail.colorStyle}
Subject: {thumbnail.subjectPlacement}
```

#### [Caption Style]

Up to 3 caption memories:

```
Caption: {caption.name}
Writing Style: {caption.writingStyle}
Length: {caption.preferredLength}
Emoji: {caption.emojiUsage}
CTA: {caption.ctaStyle}
Hashtags: {caption.hashtags.join(", ")}
```

#### [Workflow]

Up to 3 workflow memories:

```
Workflow: {workflow.name}
Templates: {workflow.favoriteTemplates.join(", ")}
Order: {workflow.generationOrder.join(" -> ")}
```

#### [Publishing]

```
Platforms: {publishing.preferredPlatforms.join(", ")}
Frequency: {publishing.postingFrequency}
Timezone: {publishing.timezone}
```

#### [User Preferences]

All preferences formatted as:

```
{category}/{key}: {value} (confidence: {confidence}%)
```

#### [Recent Activity]

Summary counts by category:

```
{category}: {count} memories
```

---

## Suggestion Engine

The suggestion engine provides relevant memories based on context:

```typescript
getSuggestions(userId: string, context: {
  moduleType?: string;
  category?: string;
})
```

### Suggestion Logic

1. **Pinned first**: Load pinned memories matching context (up to 10)
2. **Fallback**: If fewer than 5 pinned, fill remaining with score-ordered memories
3. **Return**: Combined list of pinned + fallback (max 10)

### Use Cases

- **Module startup**: Show relevant memories when user opens a module
- **Prompt assist**: Suggest relevant prompts and styles
- **Quick access**: Provide pinned memories for fast access

---

## Search Across All Memory Types

The search functionality queries the general `creativeMemory` table across categories:

```typescript
searchContext(userId: string, query: string, options?: {
  categories?: string[];
  limit?: number;  // Default 20, max 50
})
```

### Search Behavior

- Uses SQL LIKE pattern: `%query%` on the `content` field
- Optionally filtered by category array
- Results ordered by score DESC, then createdAt DESC
- No full-text search indexing (uses LIKE for simplicity)

### API Endpoint

```
GET /api/memory/search?q={query}&categories={cat1,cat2}&limit={limit}
```
