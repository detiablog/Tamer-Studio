import { db } from "@/lib/db";
import { cmsVersion } from "@/lib/db/schema/cms";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSVersionRepository } from "./version.repository";
import type { CMSVersion, CMSContentType } from "../cms.types";

export class DefaultCMSVersionRepository implements CMSVersionRepository {
  async createVersion(version: CMSVersion): Promise<CMSVersion> {
    const now = new Date();
    const id = version.id ?? randomUUID();
    const [created] = await db.insert(cmsVersion).values({
      id,
      contentId: version.contentId,
      contentType: version.contentType,
      version: version.version,
      data: version.data ?? {},
      authorId: version.authorId,
      message: version.message,
      createdAt: now,
    }).returning();

    return this.mapRow(created);
  }

  async getVersion(id: string): Promise<CMSVersion | undefined> {
    const [version] = await db.select().from(cmsVersion).where(eq(cmsVersion.id, id)).limit(1);
    return version ? this.mapRow(version) : undefined;
  }

  async getVersionsByContentId(contentId: string): Promise<CMSVersion[]> {
    const versions = await db
      .select()
      .from(cmsVersion)
      .where(eq(cmsVersion.contentId, contentId))
      .orderBy(desc(cmsVersion.version));
    return versions.map(this.mapRow);
  }

  async getVersionByNumber(contentId: string, versionNumber: number): Promise<CMSVersion | undefined> {
    const [v] = await db
      .select()
      .from(cmsVersion)
      .where(and(eq(cmsVersion.contentId, contentId), eq(cmsVersion.version, versionNumber)))
      .limit(1);
    return v ? this.mapRow(v) : undefined;
  }

  private mapRow(row: typeof cmsVersion.$inferSelect): CMSVersion {
    return {
      id: row.id,
      contentId: row.contentId,
      contentType: row.contentType as CMSContentType,
      version: row.version,
      data: row.data ?? {},
      authorId: row.authorId,
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : row.createdAt.toISOString(),
      message: row.message ?? undefined,
    };
  }
}