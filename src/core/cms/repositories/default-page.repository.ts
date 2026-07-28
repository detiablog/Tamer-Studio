import { db } from "@/lib/db";
import { cmsPage } from "@/lib/db/schema/cms";
import { eq, and, desc, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { CMSPageRepository } from "./page.repository";
import type { CMSPage, CMSCreatePageInput, CMSUpdatePageInput, CMSPageStatus, CMSContentType, CMSPermission } from "../cms.types";

export class DefaultCMSPageRepository implements CMSPageRepository {
  async createPage(input: CMSCreatePageInput): Promise<CMSPage> {
    const id = randomUUID();
    const now = new Date();
    const [page] = await db.insert(cmsPage).values({
      id,
      title: input.title,
      slug: input.slug,
      status: input.status ?? "draft",
      contentType: input.contentType ?? "page",
      parentId: input.parentId,
      seoTitle: input.seo?.title,
      seoDescription: input.seo?.description,
      seoOgImage: input.seo?.ogImage,
      seoCanonical: input.seo?.canonical,
      seoRobots: input.seo?.robots,
      localizationLocale: input.localization?.locale ?? "en",
      localizationFallbackLocale: input.localization?.fallbackLocale ?? "en",
      localizationTranslations: input.localization?.translations ?? {},
      permissionsRead: input.permissions?.read ?? ["admin", "editor", "author", "viewer"],
      permissionsWrite: input.permissions?.write ?? ["admin", "editor"],
      permissionsPublish: input.permissions?.publish ?? ["admin"],
      authorId: input.authorId,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapRow(page);
  }

  async getPage(id: string): Promise<CMSPage | undefined> {
    const [page] = await db.select().from(cmsPage).where(eq(cmsPage.id, id)).limit(1);
    return page ? this.mapRow(page) : undefined;
  }

  async getPageBySlug(slug: string): Promise<CMSPage | undefined> {
    const [page] = await db.select().from(cmsPage).where(eq(cmsPage.slug, slug)).limit(1);
    return page ? this.mapRow(page) : undefined;
  }

  async updatePage(id: string, input: CMSUpdatePageInput): Promise<CMSPage | undefined> {
    const existing = await this.getPage(id);
    if (!existing) return undefined;

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updates.title = input.title;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.status !== undefined) updates.status = input.status;
    if (input.seo !== undefined) {
      if (input.seo.title !== undefined) updates.seoTitle = input.seo.title;
      if (input.seo.description !== undefined) updates.seoDescription = input.seo.description;
      if (input.seo.ogImage !== undefined) updates.seoOgImage = input.seo.ogImage;
      if (input.seo.canonical !== undefined) updates.seoCanonical = input.seo.canonical;
      if (input.seo.robots !== undefined) updates.seoRobots = input.seo.robots;
    }
    if (input.localization !== undefined) {
      if (input.localization.locale !== undefined) updates.localizationLocale = input.localization.locale;
      if (input.localization.fallbackLocale !== undefined) updates.localizationFallbackLocale = input.localization.fallbackLocale;
      if (input.localization.translations !== undefined) updates.localizationTranslations = input.localization.translations;
    }
    if (input.permissions !== undefined) {
      if (input.permissions.read !== undefined) updates.permissionsRead = input.permissions.read;
      if (input.permissions.write !== undefined) updates.permissionsWrite = input.permissions.write;
      if (input.permissions.publish !== undefined) updates.permissionsPublish = input.permissions.publish;
    }
    if (input.publishedVersion !== undefined) updates.publishedVersion = input.publishedVersion;
    if (input.scheduledAt !== undefined) updates.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

    const [updated] = await db.update(cmsPage).set(updates).where(eq(cmsPage.id, id)).returning();
    return updated ? this.mapRow(updated) : undefined;
  }

  async deletePage(id: string): Promise<void> {
    await db.update(cmsPage).set({ deletedAt: new Date() }).where(eq(cmsPage.id, id));
  }

  async restorePage(id: string): Promise<CMSPage | undefined> {
    const [restored] = await db.update(cmsPage).set({ deletedAt: null, updatedAt: new Date() }).where(eq(cmsPage.id, id)).returning();
    return restored ? this.mapRow(restored) : undefined;
  }

  async listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): Promise<CMSPage[]> {
    const conditions: (ReturnType<typeof eq> | ReturnType<typeof isNull>)[] = [isNull(cmsPage.deletedAt)];

    if (filters?.status) {
      conditions.push(eq(cmsPage.status, filters.status));
    }
    if (filters?.contentType) {
      conditions.push(eq(cmsPage.contentType, filters.contentType));
    }

    const pages = await db.select().from(cmsPage).where(and(...conditions)).orderBy(desc(cmsPage.updatedAt));
    return pages.map(this.mapRow);
  }

  private mapRow(row: typeof cmsPage.$inferSelect): CMSPage {
    const toISOString = (val: string | Date | null): string => {
      if (val === null) return new Date().toISOString();
      return typeof val === 'string' ? val : val.toISOString();
    };
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status as CMSPageStatus,
      contentType: row.contentType as CMSContentType,
      parentId: row.parentId ?? undefined,
      seo: {
        title: row.seoTitle ?? undefined,
        description: row.seoDescription ?? undefined,
        ogImage: row.seoOgImage ?? undefined,
        canonical: row.seoCanonical ?? undefined,
        robots: row.seoRobots ?? undefined,
      },
      localization: {
        locale: row.localizationLocale,
        fallbackLocale: row.localizationFallbackLocale,
        translations: row.localizationTranslations ?? {},
      },
      permissions: {
        read: (row.permissionsRead ?? []) as CMSPermission[],
        write: (row.permissionsWrite ?? []) as CMSPermission[],
        publish: (row.permissionsPublish ?? []) as CMSPermission[],
      },
      version: row.version,
      publishedVersion: row.publishedVersion ?? undefined,
      scheduledAt: row.scheduledAt ? toISOString(row.scheduledAt) : undefined,
      createdAt: toISOString(row.createdAt),
      updatedAt: toISOString(row.updatedAt),
      publishedAt: row.publishedAt ? toISOString(row.publishedAt) : undefined,
      authorId: row.authorId,
    };
  }
}
