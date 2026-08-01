import { db } from "@/lib/db";
import {
  creativeMemory,
  creativePreference,
  creativeLearningEvent,
  creativeMemorySettings,
  creativeGenerationMemory,
  creativeVisualMemory,
} from "@/lib/db/schema/creative-memory";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class LearningEngineService {
  async processEvent(
    userId: string,
    event: {
      eventType: string;
      category?: string;
      entityId?: string;
      entityType?: string;
      data?: Record<string, unknown>;
      source?: string;
    }
  ) {
    const settings = await this.checkSettings(userId);
    if (!settings.learningEnabled || settings.learningPaused) {
      return { recorded: false, inferred: false, reason: settings.learningPaused ? "paused" : "disabled" };
    }

    const eventId = generateId("cle");
    const recorded = await db
      .insert(creativeLearningEvent)
      .values({ ...event, id: eventId, userId })
      .returning()
      .then((r) => r[0]);

    await this.inferPreferences(userId);

    return { recorded: true, inferred: true, event: recorded };
  }

  async recordPromptUsage(
    userId: string,
    data: {
      prompt: string;
      moduleType: string;
      projectId?: string;
      wasSuccessful: boolean;
      rating?: number;
    }
  ) {
    const id = generateId("cle");
    await db.insert(creativeLearningEvent).values({
      id,
      userId,
      eventType: "prompt_usage",
      category: data.moduleType,
      data: {
        prompt: data.prompt,
        moduleType: data.moduleType,
        projectId: data.projectId,
        wasSuccessful: data.wasSuccessful,
        rating: data.rating,
      },
      source: "prompt_usage",
    });

    const score = data.wasSuccessful ? (data.rating ? Math.min(100, 50 + data.rating * 10) : 70) : 30;

    const existingMemory = await db
      .select()
      .from(creativeMemory)
      .where(and(eq(creativeMemory.userId, userId), eq(creativeMemory.category, "prompts"), eq(creativeMemory.key, `${data.moduleType}_${data.prompt.slice(0, 80)}`)))
      .limit(1);

    if (existingMemory.length > 0) {
      await db
        .update(creativeMemory)
        .set({ score: Math.min(100, (existingMemory[0].score ?? 50) + (score > 50 ? 5 : -3)), data: { ...existingMemory[0].data, lastUsed: new Date().toISOString(), usageCount: ((existingMemory[0].data as Record<string, unknown>)?.usageCount as number || 0) + 1 } })
        .where(eq(creativeMemory.id, existingMemory[0].id));
    } else {
      const memId = generateId("cmem");
      await db.insert(creativeMemory).values({
        id: memId,
        userId,
        category: "prompts",
        key: `${data.moduleType}_${data.prompt.slice(0, 80)}`,
        content: data.prompt,
        data: { moduleType: data.moduleType, wasSuccessful: data.wasSuccessful, rating: data.rating, usageCount: 1 },
        source: "prompt_usage",
        score,
      });
    }

    const prefKey = `prompt_style_${data.moduleType}`;
    const existingPref = await db
      .select()
      .from(creativePreference)
      .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
      .limit(1);

    const prefConfidence = Math.min(100, 50 + (existingPref.length > 0 ? (existingPref[0].confidence ?? 50) : 0) + (data.wasSuccessful ? 5 : -2));

    if (existingPref.length > 0) {
      await db
        .update(creativePreference)
        .set({ value: data.prompt, confidence: prefConfidence, source: "prompt_inference" })
        .where(eq(creativePreference.id, existingPref[0].id));
    } else {
      await db.insert(creativePreference).values({
        id: generateId("cpref"),
        userId,
        category: "prompts",
        key: prefKey,
        value: data.prompt,
        confidence: prefConfidence,
        source: "prompt_inference",
      });
    }

    return { eventId: id, memoryUpdated: true, preferenceUpdated: true };
  }

  async recordAssetPreference(
    userId: string,
    data: {
      assetId: string;
      assetType: string;
      action: "favorite" | "download" | "publish" | "edit";
      projectId?: string;
    }
  ) {
    const id = generateId("cle");
    await db.insert(creativeLearningEvent).values({
      id,
      userId,
      eventType: `asset_${data.action}`,
      category: data.assetType,
      entityId: data.assetId,
      entityType: "asset",
      data: { assetId: data.assetId, assetType: data.assetType, action: data.action, projectId: data.projectId },
      source: "asset_interaction",
    });

    const actionWeights: Record<string, number> = { favorite: 20, download: 10, publish: 15, edit: 5 };
    const weight = actionWeights[data.action] ?? 5;

    const prefKey = `asset_type_${data.assetType}`;
    const existingPref = await db
      .select()
      .from(creativePreference)
      .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
      .limit(1);

    const confidence = Math.min(100, (existingPref.length > 0 ? (existingPref[0].confidence ?? 50) : 50) + weight);

    if (existingPref.length > 0) {
      await db
        .update(creativePreference)
        .set({ value: data.assetType, confidence, source: "asset_inference" })
        .where(eq(creativePreference.id, existingPref[0].id));
    } else {
      await db.insert(creativePreference).values({
        id: generateId("cpref"),
        userId,
        category: "assets",
        key: prefKey,
        value: data.assetType,
        confidence,
        source: "asset_inference",
      });
    }

    return { eventId: id, preferenceUpdated: true };
  }

  async recordStylePreference(
    userId: string,
    data: {
      style: string;
      category: string;
      confidence?: number;
    }
  ) {
    const id = generateId("cle");
    await db.insert(creativeLearningEvent).values({
      id,
      userId,
      eventType: "style_preference",
      category: data.category,
      data: { style: data.style, category: data.category },
      source: "style_input",
    });

    const prefKey = `style_${data.category}`;
    const prefConfidence = data.confidence ?? 60;
    const existingPref = await db
      .select()
      .from(creativePreference)
      .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
      .limit(1);

    if (existingPref.length > 0) {
      const newConfidence = Math.min(100, (existingPref[0].confidence ?? 50) + Math.floor(prefConfidence / 10));
      await db
        .update(creativePreference)
        .set({ value: data.style, confidence: newConfidence, source: "style_inference" })
        .where(eq(creativePreference.id, existingPref[0].id));
    } else {
      await db.insert(creativePreference).values({
        id: generateId("cpref"),
        userId,
        category: "styles",
        key: prefKey,
        value: data.style,
        confidence: prefConfidence,
        source: "style_inference",
      });
    }

    return { eventId: id, preferenceUpdated: true };
  }

  async inferPreferences(userId: string) {
    const eventTypeCounts = await db
      .select({
        eventType: creativeLearningEvent.eventType,
        category: creativeLearningEvent.category,
        count: sql<number>`count(*)::int`,
      })
      .from(creativeLearningEvent)
      .where(eq(creativeLearningEvent.userId, userId))
      .groupBy(creativeLearningEvent.eventType, creativeLearningEvent.category);

    const totalEvents = eventTypeCounts.reduce((sum, row) => sum + row.count, 0);
    if (totalEvents === 0) return { inferred: 0 };

    const styleCounts = await db
      .select({
        value: sql<string>`(${creativeLearningEvent.data}->>'style')::text`,
        category: creativeLearningEvent.category,
        count: sql<number>`count(*)::int`,
      })
      .from(creativeLearningEvent)
      .where(and(eq(creativeLearningEvent.userId, userId), eq(creativeLearningEvent.eventType, "style_preference")))
      .groupBy(sql`(${creativeLearningEvent.data}->>'style')::text`, creativeLearningEvent.category)
      .orderBy(desc(sql<number>`count(*)::int`))
      .limit(50);

    const promptCounts = await db
      .select({
        value: sql<string>`(${creativeLearningEvent.data}->>'prompt')::text`,
        moduleType: sql<string>`(${creativeLearningEvent.data}->>'moduleType')::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(creativeLearningEvent)
      .where(and(eq(creativeLearningEvent.userId, userId), eq(creativeLearningEvent.eventType, "prompt_usage")))
      .groupBy(sql`(${creativeLearningEvent.data}->>'prompt')::text`, sql`(${creativeLearningEvent.data}->>'moduleType')::text`)
      .orderBy(desc(sql<number>`count(*)::int`))
      .limit(50);

    const assetCounts = await db
      .select({
        assetType: sql<string>`(${creativeLearningEvent.data}->>'assetType')::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(creativeLearningEvent)
      .where(and(eq(creativeLearningEvent.userId, userId), sql`${creativeLearningEvent.eventType} LIKE 'asset_%'`))
      .groupBy(sql`(${creativeLearningEvent.data}->>'assetType')::text`)
      .orderBy(desc(sql<number>`count(*)::int`))
      .limit(50);

    let inferred = 0;

    for (const row of eventTypeCounts) {
      if (!row.category) continue;
      const prefKey = `activity_${row.eventType}_${row.category}`;
      const confidence = Math.min(95, Math.floor((row.count / totalEvents) * 100) + 20);
      const value = `${row.eventType}:${row.category}:${row.count}`;

      const existing = await db
        .select()
        .from(creativePreference)
        .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(creativePreference)
          .set({ value, confidence, source: "auto_inference" })
          .where(eq(creativePreference.id, existing[0].id));
      } else {
        await db.insert(creativePreference).values({
          id: generateId("cpref"),
          userId,
          category: "activity",
          key: prefKey,
          value,
          confidence,
          source: "auto_inference",
          isEditable: false,
        });
      }
      inferred++;
    }

    for (const row of styleCounts) {
      if (!row.value || !row.category) continue;
      const prefKey = `style_${row.category}`;
      const confidence = Math.min(95, Math.floor((row.count / totalEvents) * 100) + 30);

      const existing = await db
        .select()
        .from(creativePreference)
        .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(creativePreference)
          .set({ value: row.value, confidence, source: "style_inference" })
          .where(eq(creativePreference.id, existing[0].id));
      } else {
        await db.insert(creativePreference).values({
          id: generateId("cpref"),
          userId,
          category: "styles",
          key: prefKey,
          value: row.value,
          confidence,
          source: "style_inference",
        });
      }
      inferred++;
    }

    for (const row of promptCounts) {
      if (!row.value || !row.moduleType) continue;
      const prefKey = `prompt_style_${row.moduleType}`;
      const confidence = Math.min(95, Math.floor((row.count / totalEvents) * 100) + 30);

      const existing = await db
        .select()
        .from(creativePreference)
        .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(creativePreference)
          .set({ value: row.value, confidence, source: "prompt_inference" })
          .where(eq(creativePreference.id, existing[0].id));
      } else {
        await db.insert(creativePreference).values({
          id: generateId("cpref"),
          userId,
          category: "prompts",
          key: prefKey,
          value: row.value,
          confidence,
          source: "prompt_inference",
        });
      }
      inferred++;
    }

    for (const row of assetCounts) {
      if (!row.assetType) continue;
      const prefKey = `asset_type_${row.assetType}`;
      const confidence = Math.min(95, Math.floor((row.count / totalEvents) * 100) + 30);

      const existing = await db
        .select()
        .from(creativePreference)
        .where(and(eq(creativePreference.userId, userId), eq(creativePreference.key, prefKey)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(creativePreference)
          .set({ value: row.assetType, confidence, source: "asset_inference" })
          .where(eq(creativePreference.id, existing[0].id));
      } else {
        await db.insert(creativePreference).values({
          id: generateId("cpref"),
          userId,
          category: "assets",
          key: prefKey,
          value: row.assetType,
          confidence,
          source: "asset_inference",
        });
      }
      inferred++;
    }

    return { inferred, totalEvents };
  }

  async getLearningStats(userId: string) {
    const [totalEvents] = await db
      .select({ count: count() })
      .from(creativeLearningEvent)
      .where(eq(creativeLearningEvent.userId, userId));

    const [totalPreferences] = await db
      .select({ count: count() })
      .from(creativePreference)
      .where(eq(creativePreference.userId, userId));

    const [totalMemories] = await db
      .select({ count: count() })
      .from(creativeMemory)
      .where(eq(creativeMemory.userId, userId));

    const eventTypeBreakdown = await db
      .select({
        eventType: creativeLearningEvent.eventType,
        count: sql<number>`count(*)::int`,
      })
      .from(creativeLearningEvent)
      .where(eq(creativeLearningEvent.userId, userId))
      .groupBy(creativeLearningEvent.eventType)
      .orderBy(desc(sql<number>`count(*)::int`));

    const categoryBreakdown = await db
      .select({
        category: creativePreference.category,
        count: count(),
        avgConfidence: sql<number>`coalesce(avg(${creativePreference.confidence}), 0)::int`,
      })
      .from(creativePreference)
      .where(eq(creativePreference.userId, userId))
      .groupBy(creativePreference.category);

    const recentEvents = await db
      .select()
      .from(creativeLearningEvent)
      .where(eq(creativeLearningEvent.userId, userId))
      .orderBy(desc(creativeLearningEvent.createdAt))
      .limit(10);

    const topPreferences = await db
      .select()
      .from(creativePreference)
      .where(eq(creativePreference.userId, userId))
      .orderBy(desc(creativePreference.confidence))
      .limit(10);

    return {
      totalEvents: Number(totalEvents?.count ?? 0),
      totalPreferences: Number(totalPreferences?.count ?? 0),
      totalMemories: Number(totalMemories?.count ?? 0),
      eventTypeBreakdown,
      categoryBreakdown,
      recentEvents,
      topPreferences,
    };
  }

  async checkSettings(userId: string) {
    const [existing] = await db
      .select()
      .from(creativeMemorySettings)
      .where(eq(creativeMemorySettings.userId, userId))
      .limit(1);

    if (existing) {
      return {
        learningEnabled: existing.learningEnabled,
        learningPaused: existing.learningPaused,
        maxMemories: existing.maxMemories,
        maxLearningEvents: existing.maxLearningEvents,
        autoCleanup: existing.autoCleanup,
        retentionDays: existing.retentionDays,
        categoryLimits: existing.categoryLimits,
        excludedCategories: existing.excludedCategories,
      };
    }

    return {
      learningEnabled: true,
      learningPaused: false,
      maxMemories: 10000,
      maxLearningEvents: 5000,
      autoCleanup: true,
      retentionDays: 365,
      categoryLimits: {},
      excludedCategories: [],
    };
  }

  async clearLearningData(
    userId: string,
    options?: { category?: string; olderThan?: Date }
  ) {
    const conditions = [eq(creativeLearningEvent.userId, userId)];

    if (options?.category) {
      conditions.push(eq(creativeLearningEvent.category, options.category));
    }
    if (options?.olderThan) {
      conditions.push(sql`${creativeLearningEvent.createdAt} < ${options.olderThan}`);
    }

    const eventsDeleted = await db
      .delete(creativeLearningEvent)
      .where(and(...conditions))
      .returning();

    if (options?.category) {
      await db
        .delete(creativePreference)
        .where(and(eq(creativePreference.userId, userId), eq(creativePreference.category, options.category)));
    }

    if (!options?.category && !options?.olderThan) {
      await db.delete(creativePreference).where(eq(creativePreference.userId, userId));
      await db.delete(creativeMemory).where(eq(creativeMemory.userId, userId));
    }

    return { eventsDeleted: eventsDeleted.length };
  }
}

export const learningEngineService = new LearningEngineService();
