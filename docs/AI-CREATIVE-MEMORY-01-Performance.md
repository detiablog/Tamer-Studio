# AI Creative Memory System - Performance Optimizations

## Database Indexes

### Index Strategy

The schema defines indexes on high-frequency query columns to optimize read performance.

| Table | Index Name | Column(s) | Purpose |
|-------|-----------|-----------|---------|
| `creative_memory` | `creative_memory_user_idx` | `user_id` | User-scoped queries |
| `creative_memory` | `creative_memory_category_idx` | `category` | Category filtering |
| `creative_memory` | `creative_memory_key_idx` | `key` | Key lookups |
| `creative_memory` | `creative_memory_score_idx` | `score` | Score-based ordering |
| `creative_preference` | `creative_pref_user_idx` | `user_id` | User-scoped queries |
| `creative_preference` | `creative_pref_category_idx` | `category` | Category filtering |
| `creative_learning_event` | `creative_learning_user_idx` | `user_id` | User-scoped queries |
| `creative_learning_event` | `creative_learning_type_idx` | `event_type` | Event type filtering |
| `creative_learning_event` | `creative_learning_created_idx` | `created_at` | Time-based ordering |
| `creative_visual_memory` | `creative_visual_user_idx` | `user_id` | User-scoped queries |
| `creative_visual_memory` | `creative_visual_project_idx` | `project_id` | Project filtering |
| `creative_story_memory` | `creative_story_user_idx` | `user_id` | User-scoped queries |
| `creative_story_memory` | `creative_story_story_idx` | `story_id` | Story lookups |
| `creative_character_memory` | `creative_char_user_idx` | `user_id` | User-scoped queries |
| `creative_character_memory` | `creative_char_char_idx` | `character_id` | Character lookups |
| `creative_thumbnail_memory` | `creative_thumb_user_idx` | `user_id` | User-scoped queries |
| `creative_caption_memory` | `creative_caption_user_idx` | `user_id` | User-scoped queries |
| `creative_workflow_memory` | `creative_workflow_user_idx` | `user_id` | User-scoped queries |
| `creative_generation_memory` | `creative_gen_user_idx` | `user_id` | User-scoped queries |
| `creative_generation_memory` | `creative_gen_module_idx` | `module_type` | Module type filtering |
| `creative_generation_memory` | `creative_gen_project_idx` | `project_id` | Project filtering |
| `creative_publishing_memory` | `creative_pub_user_idx` | `user_id` | User-scoped queries |
| `creative_memory_settings` | `creative_settings_user_idx` | `user_id` | User-scoped queries |

### Unique Constraints

| Table | Constraint | Columns | Purpose |
|-------|-----------|---------|---------|
| `creative_preference` | `creative_pref_user_key_unique` | `(user_id, key)` | One preference per key per user |
| `creative_memory_settings` | `creative_settings_user_unique` | `user_id` | One settings record per user |

### Missing Indexes (Potential Improvements)

| Table | Recommended Index | Purpose |
|-------|------------------|---------|
| `creative_memory` | `(user_id, category, score)` | Composite for filtered listing |
| `creative_learning_event` | `(user_id, event_type, created_at)` | Composite for event analysis |
| `creative_generation_memory` | `(user_id, module_type, created_at)` | Composite for generation history |

---

## Query Optimization

### Parallel Queries

The `ContextBuilderService.buildContext()` method executes multiple independent queries in parallel:

```typescript
const [visualMemory, storyMemories, characterMemories, thumbnailMemory, captionMemory, workflowMemory] =
  await Promise.all([
    db.select().from(creativeVisualMemory).where(visualCondition).orderBy(desc(creativeVisualMemory.updatedAt)),
    db.select().from(creativeStoryMemory).where(storyCondition).orderBy(desc(creativeStoryMemory.updatedAt)),
    db.select().from(creativeCharacterMemory).where(characterCondition).orderBy(desc(creativeCharacterMemory.updatedAt)),
    db.select().from(creativeThumbnailMemory).where(thumbnailCondition).orderBy(desc(creativeThumbnailMemory.updatedAt)),
    db.select().from(creativeCaptionMemory).where(captionCondition).orderBy(desc(creativeCaptionMemory.updatedAt)),
    db.select().from(creativeWorkflowMemory).where(workflowCondition).orderBy(desc(creativeWorkflowMemory.updatedAt)),
  ]);
```

### Pagination

All list endpoints support pagination to limit result sets:

```typescript
const page = filters?.page || 1;
const limit = Math.min(filters?.limit || 20, 100);
const offset = (page - 1) * limit;
```

### Count Queries

List endpoints execute count queries in parallel with data queries:

```typescript
const [data, total] = await Promise.all([
  db.select().from(creativeMemory).where(where).orderBy(...).limit(limit).offset(offset),
  db.select({ count: sql<number>`count(*)` }).from(creativeMemory).where(where),
]);
```

### Score-Based Ordering

Memories are ordered by score (descending) to surface the most relevant content first:

```typescript
.orderBy(desc(creativeMemory.score), desc(creativeMemory.createdAt))
```

---

## Context Caching Strategies

### Current Implementation

The current implementation does not include caching. Each context build query hits the database directly.

### Recommended Caching Approaches

#### 1. In-Memory Cache (Application Level)

Cache context results per user with a short TTL:

```typescript
const contextCache = new Map<string, { context: CreativeContext; expiry: number }>();

async buildContext(userId: string, options?) {
  const cacheKey = `${userId}:${options?.projectId || ''}:${options?.moduleType || ''}`;
  const cached = contextCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.context;
  }
  // ... build context from DB
  contextCache.set(cacheKey, { context, expiry: Date.now() + 60000 }); // 1 minute TTL
  return context;
}
```

#### 2. Redis Cache (Distributed)

For multi-instance deployments, use Redis:

```typescript
const redis = new Redis();
const CACHE_TTL = 60; // seconds

async buildContext(userId: string, options?) {
  const cacheKey = `creative-context:${userId}:${options?.projectId || ''}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  // ... build context from DB
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(context));
  return context;
}
```

#### 3. Database Query Result Cache

Use Drizzle's built-in query caching or PostgreSQL's prepared statements.

### Cache Invalidation

- Invalidate on memory creation/update/deletion
- Invalidate on brand profile changes
- Invalidate on preference updates
- TTL-based expiry as fallback

---

## Background Learning

### Current Implementation

Learning events are processed synchronously within the API request:

```typescript
async processEvent(userId, event) {
  // Record event
  await db.insert(creativeLearningEvent).values({ ... });
  // Infer preferences (potentially slow)
  await this.inferPreferences(userId);
  return { recorded: true, inferred: true, event };
}
```

### Recommended Background Processing

#### 1. Event Queue

Queue learning events for asynchronous processing:

```typescript
// In API handler
await eventQueue.add('learning-event', { userId, event });
return { recorded: true, inferred: false };

// In background worker
eventQueue.process('learning-event', async (job) => {
  await learningEngineService.processEvent(job.data.userId, job.data.event);
});
```

#### 2. Batch Processing

Aggregate events and process in batches:

```typescript
// Batch process every N events or every M seconds
const batchProcessor = new BatchProcessor({
  batchSize: 100,
  flushInterval: 5000,
  handler: async (events) => {
    for (const event of events) {
      await processEvent(event.userId, event);
    }
  }
});
```

#### 3. Webhook-Based

Trigger learning on specific events (favorite, publish) rather than all events.

### Benefits

- Reduced API response latency
- Better resource utilization
- Ability to batch database operations
- Fault tolerance (retry failed events)

---

## Lazy Loading

### Current Implementation

The Context Builder loads all memory types eagerly, even if some are not needed:

```typescript
const [visualMemory, storyMemories, characterMemories, thumbnailMemory, captionMemory, workflowMemory] =
  await Promise.all([
    db.select().from(creativeVisualMemory).where(visualCondition),
    db.select().from(creativeStoryMemory).where(storyCondition),
    // ... etc
  ]);
```

### Recommended Lazy Loading

#### 1. Module-Specific Loading

Only load memory types relevant to the requesting module:

```typescript
async buildContext(userId: string, options?) {
  const moduleRequirements = {
    image: ['brand', 'visual', 'preferences'],
    video: ['brand', 'story', 'character', 'preferences'],
    affiliate: ['brand', 'caption', 'publishing', 'preferences'],
    drama: ['brand', 'story', 'character', 'preferences'],
    story: ['brand', 'story', 'character', 'preferences'],
    project: ['brand', 'workflow', 'publishing', 'preferences'],
  };
  const required = moduleRequirements[options?.moduleType] || ['brand', 'preferences'];
  // Only load required memory types
}
```

#### 2. On-Demand Loading

Load additional context only when needed:

```typescript
async getVisualContext(userId: string) {
  if (!this.visualContextCache.has(userId)) {
    const visualMemory = await db.select().from(creativeVisualMemory)...
    this.visualContextCache.set(userId, visualMemory);
  }
  return this.visualContextCache.get(userId);
}
```

#### 3. Conditional Loading

Skip loading if related features are disabled:

```typescript
if (settings.excludedCategories.includes('visual')) {
  // Skip visual memory loading
}
```

### Benefits

- Reduced database queries for simple operations
- Lower memory usage per request
- Faster response times for module startup
- Reduced database connection pool pressure
