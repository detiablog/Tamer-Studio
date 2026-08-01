import { db } from "@/lib/db";
import {
  creativeMemory,
  creativeBrandProfile,
  creativePreference,
  creativeVisualMemory,
  creativeStoryMemory,
  creativeCharacterMemory,
  creativeThumbnailMemory,
  creativeCaptionMemory,
  creativeWorkflowMemory,
  creativePublishingMemory,
} from "@/lib/db/schema/creative-memory";
import { eq, and, desc, like, sql, inArray } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface CreativeContext {
  brandProfile: typeof creativeBrandProfile.$inferSelect | null;
  visualMemory: (typeof creativeVisualMemory.$inferSelect)[];
  storyMemories: (typeof creativeStoryMemory.$inferSelect)[];
  characterMemories: (typeof creativeCharacterMemory.$inferSelect)[];
  thumbnailMemory: (typeof creativeThumbnailMemory.$inferSelect)[];
  captionMemory: (typeof creativeCaptionMemory.$inferSelect)[];
  workflowMemory: (typeof creativeWorkflowMemory.$inferSelect)[];
  publishingMemory: typeof creativePublishingMemory.$inferSelect | null;
  preferences: (typeof creativePreference.$inferSelect)[];
  recentMemories: Record<string, (typeof creativeMemory.$inferSelect)[]>;
}

export class ContextBuilderService {
  async buildContext(
    userId: string,
    options?: { projectId?: string; moduleType?: string; categories?: string[] }
  ): Promise<CreativeContext> {
    const [brandProfile] = await db
      .select()
      .from(creativeBrandProfile)
      .where(and(eq(creativeBrandProfile.userId, userId), eq(creativeBrandProfile.isActive, true)))
      .orderBy(desc(creativeBrandProfile.updatedAt))
      .limit(1);

    const [publishingMemory] = await db
      .select()
      .from(creativePublishingMemory)
      .where(and(eq(creativePublishingMemory.userId, userId), eq(creativePublishingMemory.isActive, true)))
      .orderBy(desc(creativePublishingMemory.updatedAt))
      .limit(1);

    const visualCondition = options?.projectId
      ? and(eq(creativeVisualMemory.userId, userId), eq(creativeVisualMemory.isActive, true), eq(creativeVisualMemory.projectId, options.projectId))
      : and(eq(creativeVisualMemory.userId, userId), eq(creativeVisualMemory.isActive, true));

    const storyCondition = and(eq(creativeStoryMemory.userId, userId), eq(creativeStoryMemory.isActive, true));
    const characterCondition = and(eq(creativeCharacterMemory.userId, userId), eq(creativeCharacterMemory.isActive, true));

    const thumbnailCondition = options?.projectId
      ? and(eq(creativeThumbnailMemory.userId, userId), eq(creativeThumbnailMemory.isActive, true), eq(creativeThumbnailMemory.projectId, options.projectId))
      : and(eq(creativeThumbnailMemory.userId, userId), eq(creativeThumbnailMemory.isActive, true));

    const captionCondition = options?.projectId
      ? and(eq(creativeCaptionMemory.userId, userId), eq(creativeCaptionMemory.isActive, true), eq(creativeCaptionMemory.projectId, options.projectId))
      : and(eq(creativeCaptionMemory.userId, userId), eq(creativeCaptionMemory.isActive, true));

    const workflowCondition = options?.projectId
      ? and(eq(creativeWorkflowMemory.userId, userId), eq(creativeWorkflowMemory.isActive, true), eq(creativeWorkflowMemory.projectId, options.projectId))
      : and(eq(creativeWorkflowMemory.userId, userId), eq(creativeWorkflowMemory.isActive, true));

    const preferences = await db
      .select()
      .from(creativePreference)
      .where(eq(creativePreference.userId, userId))
      .orderBy(desc(creativePreference.confidence));

    const [visualMemory, storyMemories, characterMemories, thumbnailMemory, captionMemory, workflowMemory] =
      await Promise.all([
        db.select().from(creativeVisualMemory).where(visualCondition).orderBy(desc(creativeVisualMemory.updatedAt)),
        db.select().from(creativeStoryMemory).where(storyCondition).orderBy(desc(creativeStoryMemory.updatedAt)),
        db.select().from(creativeCharacterMemory).where(characterCondition).orderBy(desc(creativeCharacterMemory.updatedAt)),
        db.select().from(creativeThumbnailMemory).where(thumbnailCondition).orderBy(desc(creativeThumbnailMemory.updatedAt)),
        db.select().from(creativeCaptionMemory).where(captionCondition).orderBy(desc(creativeCaptionMemory.updatedAt)),
        db.select().from(creativeWorkflowMemory).where(workflowCondition).orderBy(desc(creativeWorkflowMemory.updatedAt)),
      ]);

    const categories = options?.categories || ["general", "prompt", "style", "reference"];
    const recentMemories: Record<string, (typeof creativeMemory.$inferSelect)[]> = {};

    const recentConditions = [
      eq(creativeMemory.userId, userId),
      inArray(creativeMemory.category, categories),
    ];
    if (options?.moduleType) {
      recentConditions.push(eq(creativeMemory.source, options.moduleType));
    }

    const recentResults = await db
      .select()
      .from(creativeMemory)
      .where(and(...recentConditions))
      .orderBy(desc(creativeMemory.score), desc(creativeMemory.createdAt))
      .limit(50);

    for (const mem of recentResults) {
      if (!recentMemories[mem.category]) {
        recentMemories[mem.category] = [];
      }
      recentMemories[mem.category].push(mem);
    }

    return {
      brandProfile: brandProfile || null,
      visualMemory,
      storyMemories,
      characterMemories,
      thumbnailMemory,
      captionMemory,
      workflowMemory,
      publishingMemory: publishingMemory || null,
      preferences,
      recentMemories,
    };
  }

  async buildPromptContext(userId: string, moduleType: string): Promise<CreativeContext> {
    const [brandProfile] = await db
      .select()
      .from(creativeBrandProfile)
      .where(and(eq(creativeBrandProfile.userId, userId), eq(creativeBrandProfile.isActive, true)))
      .orderBy(desc(creativeBrandProfile.updatedAt))
      .limit(1);

    const preferences = await db
      .select()
      .from(creativePreference)
      .where(eq(creativePreference.userId, userId))
      .orderBy(desc(creativePreference.confidence))
      .limit(20);

    const recentMemories = await db
      .select()
      .from(creativeMemory)
      .where(and(eq(creativeMemory.userId, userId), eq(creativeMemory.source, moduleType)))
      .orderBy(desc(creativeMemory.score), desc(creativeMemory.createdAt))
      .limit(10);

    const recentByCategory: Record<string, (typeof creativeMemory.$inferSelect)[]> = {};
    for (const mem of recentMemories) {
      if (!recentByCategory[mem.category]) {
        recentByCategory[mem.category] = [];
      }
      recentByCategory[mem.category].push(mem);
    }

    return {
      brandProfile: brandProfile || null,
      visualMemory: [],
      storyMemories: [],
      characterMemories: [],
      thumbnailMemory: [],
      captionMemory: [],
      workflowMemory: [],
      publishingMemory: null,
      preferences,
      recentMemories: recentByCategory,
    };
  }

  getContextSummary(context: CreativeContext): string {
    const sections: string[] = [];

    if (context.brandProfile) {
      const b = context.brandProfile;
      const lines = [`Name: ${b.name}`];
      if (b.voice) lines.push(`Voice: ${b.voice}`);
      if (b.tone) lines.push(`Tone: ${b.tone}`);
      if (b.audience) lines.push(`Audience: ${b.audience}`);
      if (b.primaryColors?.length) lines.push(`Primary Colors: ${b.primaryColors.join(", ")}`);
      if (b.secondaryColors?.length) lines.push(`Secondary Colors: ${b.secondaryColors.join(", ")}`);
      if (b.typography) lines.push(`Typography: ${b.typography}`);
      if (b.preferredCta) lines.push(`CTA Style: ${b.preferredCta}`);
      if (b.preferredPlatforms?.length) lines.push(`Platforms: ${b.preferredPlatforms.join(", ")}`);
      if (b.keywords?.length) lines.push(`Keywords: ${b.keywords.join(", ")}`);
      if (b.rules?.length) lines.push(`Rules:\n${b.rules.map(r => `  - ${r}`).join("\n")}`);
      sections.push(`[Brand Identity]\n${lines.join("\n")}`);
    }

    if (context.visualMemory.length > 0) {
      const lines: string[] = [];
      for (const v of context.visualMemory.slice(0, 3)) {
        const parts = [`Style: ${v.name}`];
        if (v.colorPalette?.length) parts.push(`Colors: ${v.colorPalette.join(", ")}`);
        if (v.composition) parts.push(`Composition: ${v.composition}`);
        if (v.lighting) parts.push(`Lighting: ${v.lighting}`);
        if (v.cameraAngle) parts.push(`Camera: ${v.cameraAngle}`);
        if (v.mood) parts.push(`Mood: ${v.mood}`);
        if (v.aspectRatio) parts.push(`Aspect Ratio: ${v.aspectRatio}`);
        if (v.preferredModels?.length) parts.push(`Models: ${v.preferredModels.join(", ")}`);
        lines.push(parts.join("\n"));
      }
      sections.push(`[Visual Style]\n${lines.join("\n---\n")}`);
    }

    if (context.storyMemories.length > 0) {
      const lines: string[] = [];
      for (const s of context.storyMemories.slice(0, 3)) {
        const parts = [`Story: ${s.name}`];
        if (s.genrePreferences?.length) parts.push(`Genres: ${s.genrePreferences.join(", ")}`);
        if (s.endingStyle) parts.push(`Ending Style: ${s.endingStyle}`);
        if (s.storyRules?.length) parts.push(`Rules:\n${s.storyRules.map(r => `  - ${r}`).join("\n")}`);
        lines.push(parts.join("\n"));
      }
      sections.push(`[Story Context]\n${lines.join("\n---\n")}`);
    }

    if (context.characterMemories.length > 0) {
      const lines: string[] = [];
      for (const c of context.characterMemories.slice(0, 5)) {
        const parts = [`Character: ${c.name}`];
        if (c.voice) parts.push(`Voice: ${c.voice}`);
        if (c.expressions?.length) parts.push(`Expressions: ${c.expressions.join(", ")}`);
        if (c.accessories?.length) parts.push(`Accessories: ${c.accessories.join(", ")}`);
        lines.push(parts.join("\n"));
      }
      sections.push(`[Characters]\n${lines.join("\n---\n")}`);
    }

    if (context.thumbnailMemory.length > 0) {
      const lines: string[] = [];
      for (const t of context.thumbnailMemory.slice(0, 3)) {
        const parts = [`Thumbnail: ${t.name}`];
        if (t.textPosition) parts.push(`Text Position: ${t.textPosition}`);
        if (t.colorStyle) parts.push(`Color Style: ${t.colorStyle}`);
        if (t.subjectPlacement) parts.push(`Subject: ${t.subjectPlacement}`);
        lines.push(parts.join("\n"));
      }
      sections.push(`[Thumbnail Style]\n${lines.join("\n---\n")}`);
    }

    if (context.captionMemory.length > 0) {
      const lines: string[] = [];
      for (const c of context.captionMemory.slice(0, 3)) {
        const parts = [`Caption: ${c.name}`];
        if (c.writingStyle) parts.push(`Writing Style: ${c.writingStyle}`);
        if (c.preferredLength) parts.push(`Length: ${c.preferredLength}`);
        if (c.emojiUsage) parts.push(`Emoji: ${c.emojiUsage}`);
        if (c.ctaStyle) parts.push(`CTA: ${c.ctaStyle}`);
        if (c.hashtags?.length) parts.push(`Hashtags: ${c.hashtags.join(", ")}`);
        lines.push(parts.join("\n"));
      }
      sections.push(`[Caption Style]\n${lines.join("\n---\n")}`);
    }

    if (context.workflowMemory.length > 0) {
      const lines: string[] = [];
      for (const w of context.workflowMemory.slice(0, 3)) {
        const parts = [`Workflow: ${w.name}`];
        if (w.favoriteTemplates?.length) parts.push(`Templates: ${w.favoriteTemplates.join(", ")}`);
        if (w.generationOrder?.length) parts.push(`Order: ${w.generationOrder.join(" → ")}`);
        lines.push(parts.join("\n"));
      }
      sections.push(`[Workflow]\n${lines.join("\n---\n")}`);
    }

    if (context.publishingMemory) {
      const p = context.publishingMemory;
      const lines: string[] = [];
      if (p.preferredPlatforms?.length) lines.push(`Platforms: ${p.preferredPlatforms.join(", ")}`);
      if (p.postingFrequency) lines.push(`Frequency: ${p.postingFrequency}`);
      if (p.timezone) lines.push(`Timezone: ${p.timezone}`);
      sections.push(`[Publishing]\n${lines.join("\n")}`);
    }

    if (context.preferences.length > 0) {
      const lines = context.preferences.map(p => `${p.category}/${p.key}: ${p.value} (confidence: ${p.confidence}%)`);
      sections.push(`[User Preferences]\n${lines.join("\n")}`);
    }

    if (Object.keys(context.recentMemories).length > 0) {
      const lines: string[] = [];
      for (const [cat, memories] of Object.entries(context.recentMemories)) {
        lines.push(`${cat}: ${memories.length} memories`);
      }
      sections.push(`[Recent Activity]\n${lines.join("\n")}`);
    }

    return sections.join("\n\n");
  }

  async getSuggestions(
    userId: string,
    context: { moduleType?: string; category?: string }
  ): Promise<(typeof creativeMemory.$inferSelect)[]> {
    const conditions = [eq(creativeMemory.userId, userId)];

    if (context.category) {
      conditions.push(eq(creativeMemory.category, context.category));
    }

    if (context.moduleType) {
      conditions.push(eq(creativeMemory.source, context.moduleType));
    }

    conditions.push(eq(creativeMemory.isPinned, true));

    const pinned = await db
      .select()
      .from(creativeMemory)
      .where(and(...conditions))
      .orderBy(desc(creativeMemory.score))
      .limit(10);

    if (pinned.length >= 5) {
      return pinned;
    }

    const remaining = 10 - pinned.length;
    const fallbackConditions = [eq(creativeMemory.userId, userId)];
    if (context.category) {
      fallbackConditions.push(eq(creativeMemory.category, context.category));
    }
    if (context.moduleType) {
      fallbackConditions.push(eq(creativeMemory.source, context.moduleType));
    }

    const fallback = await db
      .select()
      .from(creativeMemory)
      .where(and(...fallbackConditions))
      .orderBy(desc(creativeMemory.score), desc(creativeMemory.createdAt))
      .limit(remaining);

    return [...pinned, ...fallback];
  }

  async searchContext(
    userId: string,
    query: string,
    options?: { categories?: string[]; limit?: number }
  ): Promise<(typeof creativeMemory.$inferSelect)[]> {
    const limit = Math.min(options?.limit || 20, 50);
    const conditions = [
      eq(creativeMemory.userId, userId),
      like(creativeMemory.content, `%${query}%`),
    ];

    if (options?.categories?.length) {
      conditions.push(inArray(creativeMemory.category, options.categories));
    }

    return db
      .select()
      .from(creativeMemory)
      .where(and(...conditions))
      .orderBy(desc(creativeMemory.score), desc(creativeMemory.createdAt))
      .limit(limit);
  }
}

export const contextBuilderService = new ContextBuilderService();
