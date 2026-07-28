import { randomUUID } from "crypto";
import { pageRegistry } from "./page.registry";
import { componentLibrary } from "./components/component.library";
import {
  DefaultCMSPageRepository,
  DefaultCMSSectionRepository,
  DefaultCMSBlockRepository,
  DefaultCMSComponentRepository,
  DefaultCMSMediaRepository,
  DefaultCMSVersionRepository,
  DefaultCMSPublishRepository,
  DefaultCMSAuditRepository,
} from "./repositories";
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
import { EventPublisher } from "@/core/events/event-publisher";

export class CMSService {
  private pageRepo: DefaultCMSPageRepository;
  private sectionRepo: DefaultCMSSectionRepository;
  private blockRepo: DefaultCMSBlockRepository;
  private componentRepo: DefaultCMSComponentRepository;
  private mediaRepo: DefaultCMSMediaRepository;
  private versionRepo: DefaultCMSVersionRepository;
  private publishRepo: DefaultCMSPublishRepository;
  private auditRepo: DefaultCMSAuditRepository;
  private eventPublisher: EventPublisher;

  constructor(
    pageRepo?: DefaultCMSPageRepository,
    sectionRepo?: DefaultCMSSectionRepository,
    blockRepo?: DefaultCMSBlockRepository,
    componentRepo?: DefaultCMSComponentRepository,
    mediaRepo?: DefaultCMSMediaRepository,
    versionRepo?: DefaultCMSVersionRepository,
    publishRepo?: DefaultCMSPublishRepository,
    auditRepo?: DefaultCMSAuditRepository,
    eventPublisher?: EventPublisher,
  ) {
    this.pageRepo = pageRepo ?? new DefaultCMSPageRepository();
    this.sectionRepo = sectionRepo ?? new DefaultCMSSectionRepository();
    this.blockRepo = blockRepo ?? new DefaultCMSBlockRepository();
    this.componentRepo = componentRepo ?? new DefaultCMSComponentRepository();
    this.mediaRepo = mediaRepo ?? new DefaultCMSMediaRepository();
    this.versionRepo = versionRepo ?? new DefaultCMSVersionRepository();
    this.publishRepo = publishRepo ?? new DefaultCMSPublishRepository();
    this.auditRepo = auditRepo ?? new DefaultCMSAuditRepository();
    this.eventPublisher = eventPublisher ?? new EventPublisher();
  }

  async createPage(input: CMSCreatePageInput): Promise<CMSPage> {
    const page = await this.pageRepo.createPage(input);
    pageRegistry.registerPage(page);
    logAction("cms.page.created", input.authorId, "admin", { pageId: page.id, slug: input.slug });
    logger.info("CMS page created", { pageId: page.id, slug: input.slug });

    await this.eventPublisher.publishDomainEvent(
      "cms.page.created",
      { pageId: page.id, slug: input.slug, title: page.title, authorId: input.authorId },
      "cms",
      { actorId: input.authorId, resourceId: page.id, resourceType: "page" }
    );

    return page;
  }

  async getPage(id: string): Promise<CMSPage | undefined> {
    return this.pageRepo.getPage(id);
  }

  async getPageBySlug(slug: string): Promise<CMSPage | undefined> {
    return this.pageRepo.getPageBySlug(slug);
  }

  async updatePage(id: string, input: CMSUpdatePageInput): Promise<CMSPage> {
    const existing = await this.pageRepo.getPage(id);
    if (!existing) throw new Error("Page not found");

    const updated = await this.pageRepo.updatePage(id, input);
    if (!updated) throw new Error("Failed to update page");

    pageRegistry.updatePage(id, updated);
    logAction("cms.page.updated", existing.authorId, "admin", { pageId: id, changes: input });
    logger.info("CMS page updated", { pageId: id });

    await this.eventPublisher.publishDomainEvent(
      "cms.page.updated",
      { pageId: id, slug: updated.slug, title: updated.title, changes: input, authorId: existing.authorId },
      "cms",
      { actorId: existing.authorId, resourceId: id, resourceType: "page" }
    );

    return updated;
  }

  async deletePage(id: string): Promise<void> {
    const existing = await this.pageRepo.getPage(id);
    if (!existing) throw new Error("Page not found");
    await this.pageRepo.deletePage(id);
    pageRegistry.deletePage(id);
    logAction("cms.page.deleted", existing.authorId, "admin", { pageId: id });
    logger.info("CMS page deleted", { pageId: id });

    await this.eventPublisher.publishDomainEvent(
      "cms.page.deleted",
      { pageId: id, slug: existing.slug, title: existing.title, authorId: existing.authorId },
      "cms",
      { actorId: existing.authorId, resourceId: id, resourceType: "page" }
    );
  }

  async listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): Promise<CMSPage[]> {
    const pages = await this.pageRepo.listPages(filters);
    pages.forEach((page) => pageRegistry.registerPage(page));
    return pages;
  }

  async registerComponent(component: CMSComponent): Promise<CMSComponent> {
    const definition: ComponentDefinition = {
      ...component,
      type: component.type as ComponentDefinition["type"],
      schema: component.schema as unknown as ComponentSchema,
      permissions: component.permissions as string[],
    };
    componentLibrary.register(definition);
    await this.componentRepo.createComponent({
      ...component,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
    return pageRegistry.hasPermission(page, action, permission as CMSPermission);
  }

  async createSection(input: Partial<CMSSection> & { pageId: string }): Promise<CMSSection> {
    const id = randomUUID();
    const now = new Date();
    const maxOrder = await this.sectionRepo.getSectionsByPageId(input.pageId).then((sections) => Math.max(-1, ...sections.map((s) => s.order)));
    const sectionOrder = typeof input.order === "number" ? input.order : maxOrder + 1;

    const section: CMSSection = {
      id,
      pageId: input.pageId,
      sectionKey: input.sectionKey ?? `section-${Date.now()}`,
      type: input.type ?? "hero",
      title: input.title ?? "",
      description: input.description,
      component: input.component,
      order: sectionOrder,
      visible: input.visible ?? true,
      locked: input.locked ?? false,
      config: input.config ?? {},
      styles: input.styles ?? {},
      media: input.media ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.sectionRepo.createSection(section);
    logAction("cms.section.created", input.pageId, "admin", { sectionId: id });
    logger.info("CMS section created", { sectionId: id, pageId: input.pageId });

    await this.eventPublisher.publishDomainEvent(
      "cms.section.created",
      { sectionId: id, pageId: input.pageId, type: section.type, title: section.title },
      "cms",
      { resourceId: id, resourceType: "section" }
    );

    return created;
  }

  async listSections(pageId: string): Promise<CMSSection[]> {
    return this.sectionRepo.getSectionsByPageId(pageId);
  }

  async updateSection(id: string, updates: Partial<CMSSection>): Promise<CMSSection> {
    const existing = await this.sectionRepo.getSection(id);
    if (!existing) throw new Error("Section not found");

    const updated = await this.sectionRepo.updateSection(id, updates);
    if (!updated) throw new Error("Failed to update section");

    logAction("cms.section.updated", existing.pageId, "admin", { sectionId: id, changes: updates });
    logger.info("CMS section updated", { sectionId: id });

    await this.eventPublisher.publishDomainEvent(
      "cms.section.updated",
      { sectionId: id, pageId: existing.pageId, changes: updates },
      "cms",
      { resourceId: id, resourceType: "section" }
    );

    return updated;
  }

  async deleteSection(id: string): Promise<void> {
    const existing = await this.sectionRepo.getSection(id);
    if (!existing) throw new Error("Section not found");
    await this.sectionRepo.deleteSection(id);
    logAction("cms.section.deleted", existing.pageId, "admin", { sectionId: id });
    logger.info("CMS section deleted", { sectionId: id });

    await this.eventPublisher.publishDomainEvent(
      "cms.section.deleted",
      { sectionId: id, pageId: existing.pageId, type: existing.type, title: existing.title },
      "cms",
      { resourceId: id, resourceType: "section" }
    );
  }

  async reorderSections(sectionOrders: { id: string; order: number }[]): Promise<void> {
    for (const item of sectionOrders) {
      await this.sectionRepo.updateSection(item.id, { order: item.order } as Partial<CMSSection>);
    }
  }

  async duplicateSection(id: string): Promise<CMSSection> {
    const existing = await this.sectionRepo.getSection(id);
    if (!existing) throw new Error("Section not found");

    const sections = await this.sectionRepo.getSectionsByPageId(existing.pageId);
    const maxOrder = Math.max(-1, ...sections.map((s) => s.order));

    const newSection = await this.sectionRepo.createSection({
      ...existing,
      id: randomUUID(),
      sectionKey: `${existing.sectionKey}-copy-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newSection;
  }

  async createBlock(input: Partial<CMSBlock> & { sectionId: string }): Promise<CMSBlock> {
    const id = randomUUID();
    const now = new Date();
    const block: CMSBlock = {
      id,
      sectionId: input.sectionId,
      type: input.type ?? "text",
      properties: input.properties ?? {},
      order: input.order ?? 0,
      visible: input.visible ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.blockRepo.createBlock(block);
    logAction("cms.block.created", input.sectionId, "admin", { blockId: id });
    logger.info("CMS block created", { blockId: id, sectionId: input.sectionId });

    await this.eventPublisher.publishDomainEvent(
      "cms.block.created",
      { blockId: id, sectionId: input.sectionId, type: block.type },
      "cms",
      { resourceId: id, resourceType: "block" }
    );

    return created;
  }

  async listBlocks(sectionId: string): Promise<CMSBlock[]> {
    return this.blockRepo.getBlocksBySectionId(sectionId);
  }

  async createVersion(contentId: string, contentType: CMSContentType, data: Record<string, unknown>, authorId: string, message?: string): Promise<CMSVersion> {
    const existingVersions = await this.versionRepo.getVersionsByContentId(contentId);
    const nextVersion = existingVersions.length + 1;

    const version: CMSVersion = {
      id: randomUUID(),
      contentId,
      contentType,
      version: nextVersion,
      data,
      authorId,
      createdAt: new Date().toISOString(),
      message,
    };

    const created = await this.versionRepo.createVersion(version);
    logAction("cms.version.created", authorId, "admin", { contentId, version: nextVersion });
    logger.info("CMS version created", { contentId, version: nextVersion });
    return created;
  }

  async getVersions(contentId: string): Promise<CMSVersion[]> {
    return this.versionRepo.getVersionsByContentId(contentId);
  }

  async createPublishPipeline(contentId: string, contentType: CMSContentType): Promise<CMSPublishPipeline> {
    const pipeline = await this.publishRepo.createPipeline({
      id: randomUUID(),
      contentId,
      contentType,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const steps = [
      { name: "validation", status: "pending" as const },
      { name: "localization", status: "pending" as const },
      { name: "seo", status: "pending" as const },
      { name: "assets", status: "pending" as const },
      { name: "links", status: "pending" as const },
      { name: "publish", status: "pending" as const },
      { name: "cache", status: "pending" as const },
      { name: "search", status: "pending" as const },
    ];

    for (const step of steps) {
      await this.publishRepo.createStep({ ...step, pipelineId: pipeline.id });
    }

    logAction("cms.publish.created", contentId, "admin", { pipelineId: pipeline.id });
    logger.info("CMS publish pipeline created", { contentId, pipelineId: pipeline.id });
    return pipeline;
  }

  async listMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]> {
    return this.mediaRepo.listMedia(filters);
  }

  async registerMedia(input: Partial<CMSMedia>): Promise<CMSMedia> {
    const media = await this.mediaRepo.createMedia({
      id: randomUUID(),
      filename: input.filename ?? "unknown",
      url: input.url ?? "",
      alt: input.alt,
      type: input.type ?? "image",
      size: input.size ?? 0,
      folder: input.folder,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    logAction("cms.media.uploaded", input.filename ?? "unknown", "admin", { mediaId: media.id });
    logger.info("CMS media registered", { mediaId: media.id });
    return media;
  }

  async getAuditLog(contentId?: string, contentType?: CMSContentType): Promise<CMSAuditEntry[]> {
    return this.auditRepo.getAuditLog(contentId, contentType);
  }
}
