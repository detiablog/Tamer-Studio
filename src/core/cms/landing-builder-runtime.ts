import { CMSService } from "./cms.service";
import { DefaultCMSBlockRepository } from "./repositories/default-block.repository";
import { DefaultCMSComponentRepository } from "./repositories/default-component.repository";
import { DefaultCMSPublishRepository } from "./repositories/default-publish.repository";
import type {
  CMSPage,
  CMSSection,
  CMSBlock,
  CMSComponent,
  CMSMedia,
  CMSVersion,
  CMSPublishPipeline,
  CMSUpdatePageInput,
  CMSPageStatus,
  CMSContentType,
  CMSAuditEntry,
} from "./cms.types";

export type EditorSelection = {
  type: "page" | "section" | "block" | "component";
  id: string;
};

export type EditorHistoryEntry = {
  action: string;
  timestamp: number;
  data: unknown;
  selection?: EditorSelection;
};

export type ClipboardEntry = {
  type: "section" | "block" | "component";
  data: unknown;
};

export class LandingBuilderRuntime {
  private cmsService: CMSService;
  private blockRepo: DefaultCMSBlockRepository;
  private componentRepo: DefaultCMSComponentRepository;
  private publishRepo: DefaultCMSPublishRepository;
  private currentPageId: string | null = null;
  private selection: EditorSelection | null = null;
  private clipboard: ClipboardEntry | null = null;
  private history: EditorHistoryEntry[] = [];
  private historyIndex: number = -1;
  private maxHistory: number = 50;

  constructor(cmsService?: CMSService) {
    this.cmsService = cmsService ?? new CMSService();
    this.blockRepo = new DefaultCMSBlockRepository();
    this.componentRepo = new DefaultCMSComponentRepository();
    this.publishRepo = new DefaultCMSPublishRepository();
  }

  // ─── Page Operations ───────────────────────────────────────────────

  async createLandingPage(input: {
    title: string;
    slug: string;
    authorId: string;
  }): Promise<CMSPage> {
    const page = await this.cmsService.createPage({
      title: input.title,
      slug: input.slug,
      contentType: "page",
      status: "draft",
      authorId: input.authorId,
      localization: { locale: "en", fallbackLocale: "en", translations: {} },
      permissions: {
        read: ["admin", "editor", "author", "viewer"],
        write: ["admin", "editor"],
        publish: ["admin"],
      },
    });

    this.currentPageId = page.id;
    this.pushHistory("page.created", page);
    return page;
  }

  async getCurrentPage(): Promise<CMSPage | undefined> {
    if (!this.currentPageId) return undefined;
    return this.cmsService.getPage(this.currentPageId);
  }

  async getPageBySlug(slug: string): Promise<CMSPage | undefined> {
    return this.cmsService.getPageBySlug(slug);
  }

  async updateCurrentPage(input: CMSUpdatePageInput): Promise<CMSPage> {
    if (!this.currentPageId) throw new Error("No page selected");
    const page = await this.cmsService.updatePage(this.currentPageId, input);
    this.pushHistory("page.updated", page);
    return page;
  }

  async listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): Promise<CMSPage[]> {
    return this.cmsService.listPages(filters);
  }

  // ─── Section Operations ────────────────────────────────────────────

  async getSections(pageId?: string): Promise<CMSSection[]> {
    const targetPageId = pageId ?? this.currentPageId;
    if (!targetPageId) return [];
    return this.cmsService.listSections(targetPageId);
  }

  async createSection(input: {
    pageId?: string;
    type: string;
    title: string;
    config?: Record<string, unknown>;
    styles?: Record<string, unknown>;
    order?: number;
  }): Promise<CMSSection> {
    const targetPageId = input.pageId ?? this.currentPageId;
    if (!targetPageId) throw new Error("No page selected");

    const section = await this.cmsService.createSection({
      pageId: targetPageId,
      type: input.type,
      title: input.title,
      config: input.config ?? {},
      styles: input.styles ?? {},
      order: input.order,
    });

    this.pushHistory("section.created", section);
    return section;
  }

  async updateSection(id: string, updates: Partial<CMSSection>): Promise<CMSSection> {
    const section = await this.cmsService.updateSection(id, updates);
    this.pushHistory("section.updated", { id, updates });
    return section;
  }

  async deleteSection(id: string): Promise<void> {
    const existing = await this.cmsService.listSections(this.currentPageId ?? "").then((sections) => sections.find((s) => s.id === id));
    await this.cmsService.deleteSection(id);
    this.pushHistory("section.deleted", existing ?? { id });
  }

  async duplicateSection(id: string): Promise<CMSSection> {
    const sections = await this.cmsService.listSections(this.currentPageId ?? "");
    const existing = sections.find((s) => s.id === id);
    if (!existing) throw new Error("Section not found");

    const maxOrder = Math.max(-1, ...sections.map((s) => s.order));
    const newSection = await this.cmsService.createSection({
      pageId: existing.pageId,
      type: existing.type,
      title: `${existing.title} (Copy)`,
      config: existing.config,
      styles: existing.styles,
      order: maxOrder + 1,
    });

    this.pushHistory("section.duplicated", { sourceId: id, newSection });
    return newSection;
  }

  async reorderSections(sectionOrders: { id: string; order: number }[]): Promise<void> {
    for (const item of sectionOrders) {
      await this.cmsService.updateSection(item.id, { order: item.order } as Partial<CMSSection>);
    }
    this.pushHistory("sections.reordered", sectionOrders);
  }

  // ─── Block Operations ──────────────────────────────────────────────

  async getBlocks(sectionId: string): Promise<CMSBlock[]> {
    return this.cmsService.listBlocks(sectionId);
  }

  async createBlock(input: {
    sectionId: string;
    type: string;
    properties?: Record<string, unknown>;
    order?: number;
  }): Promise<CMSBlock> {
    const block = await this.cmsService.createBlock({
      sectionId: input.sectionId,
      type: input.type,
      properties: input.properties ?? {},
      order: input.order,
    });
    this.pushHistory("block.created", block);
    return block;
  }

  async updateBlock(id: string, updates: Partial<CMSBlock>): Promise<CMSBlock> {
    const updated = await this.blockRepo.updateBlock(id, updates);
    if (!updated) throw new Error("Block not found");
    this.pushHistory("block.updated", { id, updates });
    return updated;
  }

  async deleteBlock(id: string): Promise<void> {
    await this.blockRepo.deleteBlock(id);
    this.pushHistory("block.deleted", { id });
  }

  // ─── Component Operations ──────────────────────────────────────────

  async getComponents(): Promise<CMSComponent[]> {
    return this.cmsService.listComponents();
  }

  async getComponentByType(type: string): Promise<CMSComponent | undefined> {
    return this.componentRepo.getComponentByType(type);
  }

  async registerComponent(component: CMSComponent): Promise<CMSComponent> {
    return this.cmsService.registerComponent(component);
  }

  // ─── Media Operations ──────────────────────────────────────────────

  async getMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]> {
    return this.cmsService.listMedia(filters);
  }

  async uploadMedia(input: Partial<CMSMedia>): Promise<CMSMedia> {
    const media = await this.cmsService.registerMedia(input);
    this.pushHistory("media.uploaded", media);
    return media;
  }

  // ─── Version Operations ────────────────────────────────────────────

  async createVersion(contentId: string, contentType: CMSContentType, data: Record<string, unknown>, authorId: string, message?: string): Promise<CMSVersion> {
    return this.cmsService.createVersion(contentId, contentType, data, authorId, message);
  }

  async getVersions(contentId: string): Promise<CMSVersion[]> {
    return this.cmsService.getVersions(contentId);
  }

  async rollbackToVersion(contentId: string, version: number, authorId: string): Promise<CMSVersion> {
    const versions = await this.cmsService.getVersions(contentId);
    const target = versions.find((v) => v.version === version);
    if (!target) throw new Error("Version not found");

    return this.cmsService.createVersion(contentId, target.contentType, target.data, authorId, `Rollback to version ${version}`);
  }

  // ─── Publishing Operations ─────────────────────────────────────────

  async publish(contentId: string, contentType: CMSContentType): Promise<CMSPublishPipeline> {
    const pipeline = await this.cmsService.createPublishPipeline(contentId, contentType);
    this.pushHistory("content.published", { contentId, pipelineId: pipeline.id });
    return pipeline;
  }

  async getPublishPipeline(contentId: string): Promise<CMSPublishPipeline | undefined> {
    const pipelines = await this.publishRepo.getPipelinesByContentId(contentId);
    return pipelines[0];
  }

  // ─── Audit Operations ──────────────────────────────────────────────

  async getAuditLog(contentId?: string, contentType?: CMSContentType): Promise<CMSAuditEntry[]> {
    return this.cmsService.getAuditLog(contentId, contentType);
  }

  // ─── Selection ─────────────────────────────────────────────────────

  setSelection(selection: EditorSelection | null): void {
    this.selection = selection;
  }

  getSelection(): EditorSelection | null {
    return this.selection;
  }

  // ─── Clipboard ─────────────────────────────────────────────────────

  setClipboard(entry: ClipboardEntry | null): void {
    this.clipboard = entry;
  }

  getClipboard(): ClipboardEntry | null {
    return this.clipboard;
  }

  async pasteClipboard(_targetPageId?: string): Promise<unknown> {
    if (!this.clipboard) return null;
    this.pushHistory("clipboard.pasted", this.clipboard);
    return this.clipboard.data;
  }

  // ─── Undo / Redo ───────────────────────────────────────────────────

  pushHistory(action: string, data: unknown): void {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ action, timestamp: Date.now(), data });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  undo(): EditorHistoryEntry | null {
    if (this.historyIndex < 0) return null;
    const entry = this.history[this.historyIndex];
    this.historyIndex--;
    return entry;
  }

  redo(): EditorHistoryEntry | null {
    if (this.historyIndex >= this.history.length - 1) return null;
    this.historyIndex++;
    return this.history[this.historyIndex];
  }

  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  getHistory(): EditorHistoryEntry[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  // ─── Navigation Integration ────────────────────────────────────────

  async syncToNavigation(pageId: string): Promise<void> {
    const page = await this.cmsService.getPage(pageId);
    if (!page) return;
    // Navigation integration is handled by CMSNavigationIntegration
    // This method provides a hook for the Landing Builder to trigger sync
    this.pushHistory("navigation.synced", { pageId });
  }

  // ─── Localization Integration ──────────────────────────────────────

  async getLocalizedContent(contentId: string, locale: string): Promise<Record<string, string>> {
    const page = await this.cmsService.getPage(contentId);
    if (!page) return {};
    const translations = page.localization.translations[locale];
    return translations ?? {};
  }

  async updateLocalizedContent(contentId: string, locale: string, translations: Record<string, string>): Promise<void> {
    const page = await this.cmsService.getPage(contentId);
    if (!page) return;
    await this.cmsService.updatePage(contentId, {
      localization: {
        locale: page.localization.locale,
        fallbackLocale: page.localization.fallbackLocale,
        translations: {
          ...page.localization.translations,
          [locale]: translations,
        },
      },
    });
    this.pushHistory("localization.updated", { contentId, locale });
  }

  // ─── SEO Integration ───────────────────────────────────────────────

  async updatePageSEO(pageId: string, seo: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonical?: string;
    robots?: string;
  }): Promise<void> {
    await this.cmsService.updatePage(pageId, { seo });
    this.pushHistory("seo.updated", { pageId, seo });
  }

  // ─── State Access ──────────────────────────────────────────────────

  getCurrentPageId(): string | null {
    return this.currentPageId;
  }

  setCurrentPageId(pageId: string | null): void {
    this.currentPageId = pageId;
  }

  getCMSService(): CMSService {
    return this.cmsService;
  }
}
