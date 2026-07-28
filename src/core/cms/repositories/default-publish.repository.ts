import { db } from "@/lib/db";
import { cmsPublishPipeline, cmsPublishStep } from "@/lib/db/schema/cms";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSPublishRepository } from "./publish.repository";
import type { CMSPublishPipeline, CMSPublishStep, CMSContentType } from "../cms.types";

export class DefaultCMSPublishRepository implements CMSPublishRepository {
  async createPipeline(pipeline: CMSPublishPipeline): Promise<CMSPublishPipeline> {
    const now = new Date();
    const id = pipeline.id ?? randomUUID();
    const [created] = await db.insert(cmsPublishPipeline).values({
      id,
      contentId: pipeline.contentId,
      contentType: pipeline.contentType,
      status: pipeline.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapPipelineRow(created);
  }

  async getPipeline(id: string): Promise<CMSPublishPipeline | undefined> {
    const [pipeline] = await db.select().from(cmsPublishPipeline).where(eq(cmsPublishPipeline.id, id)).limit(1);
    return pipeline ? this.mapPipelineRow(pipeline) : undefined;
  }

  async getPipelinesByContentId(contentId: string): Promise<CMSPublishPipeline[]> {
    const pipelines = await db
      .select()
      .from(cmsPublishPipeline)
      .where(eq(cmsPublishPipeline.contentId, contentId))
      .orderBy(desc(cmsPublishPipeline.createdAt));
    return pipelines.map(this.mapPipelineRow);
  }

  async updatePipeline(id: string, updates: Partial<CMSPublishPipeline>): Promise<CMSPublishPipeline | undefined> {
    const existing = await this.getPipeline(id);
    if (!existing) return undefined;

    const set: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.status !== undefined) set.status = updates.status;

    const [updated] = await db.update(cmsPublishPipeline).set(set).where(eq(cmsPublishPipeline.id, id)).returning();
    return updated ? this.mapPipelineRow(updated) : undefined;
  }

  async createStep(step: CMSPublishStep): Promise<CMSPublishStep> {
    const stepId = randomUUID();
    const pipelineId = (step as { pipelineId?: string }).pipelineId as string | undefined;
    const [created] = await db.insert(cmsPublishStep).values({
      id: stepId,
      pipelineId: pipelineId ?? randomUUID(),
      name: step.name,
      status: step.status ?? "pending",
      startedAt: step.startedAt ? new Date(step.startedAt) : null,
      completedAt: step.completedAt ? new Date(step.completedAt) : null,
      error: step.error ?? null,
    }).returning();

    return this.mapStepRow(created);
  }

  async updateStep(id: string, updates: Partial<CMSPublishStep>): Promise<CMSPublishStep | undefined> {
    const existing = await this.getStep(id);
    if (!existing) return undefined;

    const set: Record<string, unknown> = {};

    if (updates.name !== undefined) set.name = updates.name;
    if (updates.status !== undefined) set.status = updates.status;
    if (updates.startedAt !== undefined) set.startedAt = updates.startedAt ? new Date(updates.startedAt) : null;
    if (updates.completedAt !== undefined) set.completedAt = updates.completedAt ? new Date(updates.completedAt) : null;
    if (updates.error !== undefined) set.error = updates.error ?? null;

    const [updated] = await db.update(cmsPublishStep).set(set).where(eq(cmsPublishStep.id, id)).returning();
    return updated ? this.mapStepRow(updated) : undefined;
  }

  async getStepsByPipelineId(pipelineId: string): Promise<CMSPublishStep[]> {
    const steps = await db
      .select()
      .from(cmsPublishStep)
      .where(eq(cmsPublishStep.pipelineId, pipelineId));
    return steps.map((s) => ({
      name: s.name,
      status: s.status as CMSPublishStep["status"],
      startedAt: s.startedAt ? (typeof s.startedAt === 'string' ? s.startedAt : s.startedAt.toISOString()) : undefined,
      completedAt: s.completedAt ? (typeof s.completedAt === 'string' ? s.completedAt : s.completedAt.toISOString()) : undefined,
      error: s.error ?? undefined,
    }));
  }

  private mapPipelineRow(row: typeof cmsPublishPipeline.$inferSelect): CMSPublishPipeline {
    return {
      id: row.id,
      contentId: row.contentId,
      contentType: row.contentType as CMSContentType,
      status: row.status as CMSPublishPipeline["status"],
      steps: [],
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : row.createdAt.toISOString(),
      updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : row.updatedAt.toISOString(),
    };
  }

  private mapStepRow(row: typeof cmsPublishStep.$inferSelect): CMSPublishStep {
    return {
      name: row.name,
      status: row.status as CMSPublishStep["status"],
      startedAt: row.startedAt ? (typeof row.startedAt === 'string' ? row.startedAt : row.startedAt.toISOString()) : undefined,
      completedAt: row.completedAt ? (typeof row.completedAt === 'string' ? row.completedAt : row.completedAt.toISOString()) : undefined,
      error: row.error ?? undefined,
    };
  }

  private async getStep(id: string): Promise<typeof cmsPublishStep.$inferSelect | undefined> {
    const [step] = await db.select().from(cmsPublishStep).where(eq(cmsPublishStep.id, id)).limit(1);
    return step;
  }
}