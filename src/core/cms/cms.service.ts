import { randomUUID } from "crypto";
import { pageRegistry } from "./page.registry";
import { componentLibrary } from "./components/component.library";
import type {
  CMSPage,
  CMSSection,
  CMSBlock,
  CMSComponent,
  CMSMedia,
  CMSVersion,
  CMSPublishPipeline,
  CMSCreatePageInput,
  CMSUpdatePageInput,
  CMSContentType,
  CMSPageStatus,
  CMSAuditEntry,
  ComponentDefinition,
  ComponentSchema,
} from "./cms.types";
import { logger } from "@/core/logger/logger";
import { logAction } from "@/core/audit";

export class CMSService {
  async createPage(input: CMSCreatePageInput): Promise<CMSPage> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const page: CMSPage = {
      id,
      title: input.title,
      slug: input.slug,
      status: input.status ?? "draft",
      contentType: input.contentType ?? "page",
      parentId: input.parentId,
      seo: {
        title: input.seo?.title,
        description: input.seo?.description,
        ogImage: input.seo?.ogImage,
        canonical: input.seo?.canonical,
        robots: input.seo?.robots,
      },
      localization: {
        locale: input.localization?.locale ?? "en",
        fallbackLocale: input.localization?.fallbackLocale ?? "en",
        translations: input.localization?.translations ?? {},
      },
      permissions: {
        read: input.permissions?.read ?? ["admin", "editor", "author", "viewer"],
        write: input.permissions?.write ?? ["admin", "editor"],
        publish: input.permissions?.publish ?? ["admin"],
      },
      version: 1,
      createdAt: now,
      updatedAt: now,
      authorId: input.authorId,
    };

    pageRegistry.registerPage(page);
    logAction("cms.page.created", input.authorId, "admin", { pageId: id, slug: input.slug });
    logger.info("CMS page created", { pageId: id, slug: input.slug });
    return page;
  }

  async getPage(id: string): Promise<CMSPage | undefined> {
    return pageRegistry.getPage(id);
  }

  async getPageBySlug(slug: string): Promise<CMSPage | undefined> {
    return pageRegistry.getPageBySlug(slug);
  }

  async updatePage(id: string, input: CMSUpdatePageInput): Promise<CMSPage> {
    const existing = pageRegistry.getPage(id);
    if (!existing) throw new Error("Page not found");

    const updates: Partial<CMSPage> = {
      updatedAt: new Date().toISOString(),
    };
    if (input.title !== undefined) updates.title = input.title;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.status !== undefined) updates.status = input.status;
    if (input.seo !== undefined) updates.seo = { ...existing.seo, ...input.seo };
    if (input.localization !== undefined) updates.localization = { ...existing.localization, ...input.localization };
    if (input.permissions !== undefined) updates.permissions = { ...existing.permissions, ...input.permissions };
    if (input.publishedVersion !== undefined) updates.publishedVersion = input.publishedVersion;
    if (input.scheduledAt !== undefined) updates.scheduledAt = input.scheduledAt;

    const updated = pageRegistry.updatePage(id, updates);
    if (!updated) throw new Error("Failed to update page");
    logAction("cms.page.updated", existing.authorId, "admin", { pageId: id, changes: input });
    logger.info("CMS page updated", { pageId: id });
    return updated;
  }

  async deletePage(id: string): Promise<void> {
    const existing = pageRegistry.getPage(id);
    if (!existing) throw new Error("Page not found");
    pageRegistry.deletePage(id);
    logAction("cms.page.deleted", existing.authorId, "admin", { pageId: id });
    logger.info("CMS page deleted", { pageId: id });
  }

  async listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): Promise<CMSPage[]> {
    return pageRegistry.listPages(filters);
  }

  async registerComponent(component: CMSComponent): Promise<CMSComponent> {
    const definition: ComponentDefinition = {
      ...component,
      type: component.type as ComponentDefinition["type"],
      schema: component.schema as unknown as ComponentSchema,
      permissions: component.permissions as string[],
    };
    componentLibrary.register(definition);
    logger.info("CMS component registered", { componentId: component.id, type: component.type });
    return component;
  }

  async getComponent(id: string): Promise<CMSComponent | undefined> {
    const definition = componentLibrary.get(id);
    if (!definition) return undefined;
    return {
      ...definition,
      type: definition.type as CMSComponent["type"],
      schema: definition.schema as unknown as Record<string, unknown>,
      permissions: definition.permissions as CMSComponent["permissions"],
    };
  }

  async listComponents(): Promise<CMSComponent[]> {
    const definitions = componentLibrary.list();
    return definitions.map((d) => ({
      ...d,
      type: d.type as CMSComponent["type"],
      schema: d.schema as unknown as Record<string, unknown>,
      permissions: d.permissions as CMSComponent["permissions"],
    }));
  }

  async hasPermission(pageId: string, action: "read" | "write" | "publish", permission: string): Promise<boolean> {
    const page = pageRegistry.getPage(pageId);
    if (!page) return false;
    return pageRegistry.hasPermission(page, action, permission as any);
  }

  async createSection(input: Partial<CMSSection> & { pageId: string }): Promise<CMSSection> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const section: CMSSection = {
      id,
      pageId: input.pageId,
      type: input.type ?? "hero",
      title: input.title ?? "",
      order: input.order ?? 0,
      visible: input.visible ?? true,
      locked: input.locked ?? false,
      config: input.config ?? {},
      styles: input.styles ?? {},
      media: input.media ?? [],
      createdAt: now,
      updatedAt: now,
    };
    logAction("cms.section.created", input.pageId, "admin", { sectionId: id });
    logger.info("CMS section created", { sectionId: id, pageId: input.pageId });
    return section;
  }

  async listSections(pageId: string): Promise<CMSSection[]> {
    return [];
  }

  async createVersion(contentId: string, contentType: CMSContentType, data: Record<string, unknown>, authorId: string, message?: string): Promise<CMSVersion> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const version: CMSVersion = {
      id,
      contentId,
      contentType,
      version: 1,
      data,
      authorId,
      createdAt: now,
      message,
    };
    logAction("cms.version.created", authorId, "admin", { contentId, version: 1 });
    logger.info("CMS version created", { contentId, version: 1 });
    return version;
  }

  async getVersions(contentId: string): Promise<CMSVersion[]> {
    return [];
  }

  async createPublishPipeline(contentId: string, contentType: CMSContentType): Promise<CMSPublishPipeline> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const pipeline: CMSPublishPipeline = {
      id,
      contentId,
      contentType,
      status: "pending",
      steps: [
        { name: "validation", status: "pending" },
        { name: "localization", status: "pending" },
        { name: "seo", status: "pending" },
        { name: "assets", status: "pending" },
        { name: "links", status: "pending" },
        { name: "publish", status: "pending" },
        { name: "cache", status: "pending" },
        { name: "search", status: "pending" },
      ],
      createdAt: now,
      updatedAt: now,
    };
    logAction("cms.publish.created", contentId, "admin", { pipelineId: id });
    logger.info("CMS publish pipeline created", { contentId, pipelineId: id });
    return pipeline;
  }

  async listMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]> {
    return [];
  }

  async registerMedia(input: Partial<CMSMedia>): Promise<CMSMedia> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const media: CMSMedia = {
      id,
      filename: input.filename ?? "unknown",
      url: input.url ?? "",
      alt: input.alt,
      type: input.type ?? "image",
      size: input.size ?? 0,
      folder: input.folder,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    logAction("cms.media.uploaded", input.filename ?? "unknown", "admin", { mediaId: id });
    logger.info("CMS media registered", { mediaId: id });
    return media;
  }

  async getAuditLog(contentId?: string, contentType?: CMSContentType): Promise<CMSAuditEntry[]> {
    return [];
  }
}