# AI Creative Memory System - Memory Engine Design

## Memory Categories

The Creative Memory Engine supports 14 distinct memory categories, each serving a specific role in the creative workflow.

| Category | Table | ID Prefix | Description |
|----------|-------|-----------|-------------|
| General | `creative_memory` | `cmem` | Key-value memories with scoring and pinning |
| Brand | `creative_brand_profile` | `cbpf` | Brand identity profiles |
| Prompt | `creative_memory` (category=prompts) | `cmem` | Prompt usage history and patterns |
| Visual | `creative_visual_memory` | `cvis` | Visual style preferences |
| Story | `creative_story_memory` | `cstm` | Story and narrative context |
| Character | `creative_character_memory` | `ccrm` | Character definitions and relationships |
| Thumbnail | `creative_thumbnail_memory` | `cthm` | Thumbnail layout and style patterns |
| Caption | `creative_caption_memory` | `ccap` | Caption writing style and patterns |
| CTA | `creative_caption_memory` (ctaStyle) | `ccap` | Call-to-action style preferences |
| Publishing | `creative_publishing_memory` | `cpub` | Publishing schedule and platform preferences |
| Workflow | `creative_workflow_memory` | `cwfm` | Workflow automation and template preferences |
| Project | `creative_generation_memory` | `cgen` | Project-scoped generation history |
| Generation | `creative_generation_memory` | `cgen` | AI generation history with parameters |
| Platform | `creative_publishing_memory` (preferredPlatforms) | `cpub` | Platform-specific preferences |

---

## Memory Structure

### General Memory (creative_memory)

Each general memory entry follows a key-value structure with metadata:

```typescript
{
  id: string;           // Prefixed ID (e.g., "cmem_xxxx")
  userId: string;       // Owner identifier
  category: string;     // Memory category (100 char max)
  key: string;          // Unique key within category (200 char max)
  content?: string;     // Text content
  data: Record<string, unknown>;  // Structured JSON data
  source?: string;      // Origin module or event type
  score: number;        // Relevance score (0-100, default 50)
  isPinned: boolean;    // Whether memory is pinned (default false)
  isSystem: boolean;    // Whether memory is system-generated (default false)
  metadata: Record<string, unknown>;  // Additional metadata
  expiresAt?: Date;     // Optional expiration timestamp
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Key-Value Semantics

- **Key**: Unique identifier within a category, used for deduplication and upsert logic
- **Content**: Human-readable text representation
- **Data**: Machine-readable structured data (JSONB)
- **Score**: Relevance ranking (higher = more relevant)
- **Pinning**: User-managed pinning to override score-based ordering

---

## Memory Lifecycle

### 1. Creation

Memories are created through:

- **User actions**: Direct creation via API (brand profiles, visual memories, etc.)
- **Learning events**: Automatic creation when learning engine processes events
- **Import**: Bulk creation from imported data
- **System**: System-generated memories (e.g., initial defaults)

### 2. Scoring

Scores are managed by the Learning Engine:

| Event Type | Score Impact | Description |
|------------|-------------|-------------|
| Successful prompt | +5 per use | Prompt was used and produced good results |
| Failed prompt | -3 per use | Prompt did not produce desired results |
| Favorite action | +20 | User favorited an asset |
| Download action | +10 | User downloaded an asset |
| Publish action | +15 | User published an asset |
| Edit action | +5 | User edited an asset |
| Style preference | +confidence/10 | User expressed style preference |

Score bounds: 0 (minimum) to 100 (maximum)

### 3. Pinning

- Users can pin memories to override score-based ordering
- Pinned memories always appear in suggestions
- Pinning is managed via `isPinned` boolean field
- Pinned memories are not affected by score decay

### 4. Archival

- Memories with `expiresAt` set are eligible for archival
- System memories (`isSystem: true`) are preserved unless explicitly deleted
- Inactive memories (`isActive: false`) are excluded from context building

### 5. Cleanup

Configured via `creativeMemorySettings`:

| Setting | Default | Description |
|---------|---------|-------------|
| `autoCleanup` | `true` | Enable automatic cleanup of expired memories |
| `retentionDays` | `365` | Days before memories are eligible for cleanup |
| `maxMemories` | `10000` | Maximum memories per user |
| `maxLearningEvents` | `5000` | Maximum learning events per user |
| `categoryLimits` | `{}` | Per-category memory limits |
| `excludedCategories` | `[]` | Categories excluded from cleanup |

---

## Search and Retrieval

### Memory Listing

```typescript
listMemories(userId, filters?)
```

- **Filters**: category, search (content LIKE), pinnedOnly, page, limit
- **Ordering**: score DESC, createdAt DESC
- **Pagination**: page-based with max 100 per page
- **Returns**: `{ data, total, page, limit }`

### Memory Search

```typescript
searchMemories(userId, query, categories?)
```

- **Query**: SQL LIKE pattern match on content field
- **Categories**: Optional filter to specific categories
- **Ordering**: score DESC
- **Returns**: Array of matching memories

### Memory Retrieval by ID

```typescript
getMemory(id)
```

- Returns single memory or null
- No user-scoping check (caller responsible for authorization)

### Context Search

```typescript
searchContext(userId, query, options?)
```

- Cross-category search across all memory types
- Supports category filtering and result limiting (max 50)
- Ordered by score DESC, createdAt DESC

### Suggestions

```typescript
getSuggestions(userId, context)
```

- Returns up to 10 suggestions
- Prioritizes pinned memories (up to 10)
- Falls back to score-ordered memories if fewer than 5 pinned
- Optionally filtered by moduleType and category

---

## Memory ID Generation

All IDs are generated using the `generateId()` function with category-specific prefixes:

| Prefix | Table | Example |
|--------|-------|---------|
| `cmem` | creative_memory | `cmem_abc123` |
| `cbpf` | creative_brand_profile | `cbpf_def456` |
| `cpref` | creative_preference | `cpref_ghi789` |
| `cle` | creative_learning_event | `cle_jkl012` |
| `cvis` | creative_visual_memory | `cvis_mno345` |
| `cstm` | creative_story_memory | `cstm_pqr678` |
| `ccrm` | creative_character_memory | `ccrm_stu901` |
| `cthm` | creative_thumbnail_memory | `cthm_vwx234` |
| `ccap` | creative_caption_memory | `ccap_yza567` |
| `cwfm` | creative_workflow_memory | `cwfm_bcd890` |
| `cgen` | creative_generation_memory | `cgen_efg123` |
| `cpub` | creative_publishing_memory | `cpub_hij456` |
| `cset` | creative_memory_settings | `cset_klm789` |
