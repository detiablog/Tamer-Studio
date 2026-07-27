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
} from "./cms.types";

export interface ContentRegistry {
  registerPage(page: CMSPage): Promise<CMSPage>;
  getPage(id: string): Promise<CMSPage | undefined>;
  getPageBySlug(slug: string): Promise<CMSPage | undefined>;
  updatePage(id: string, input: CMSUpdatePageInput): Promise<CMSPage>;
  deletePage(id: string): Promise<void>;
  listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): Promise<CMSPage[]>;

  registerSection(section: CMSSection): Promise<CMSSection>;
  getSection(id: string): Promise<CMSSection | undefined>;
  updateSection(id: string, input: Partial<CMSSection>): Promise<CMSSection>;
  deleteSection(id: string): Promise<void>;
  listSections(pageId: string): Promise<CMSSection[]>;

  registerBlock(block: CMSBlock): Promise<CMSBlock>;
  getBlock(id: string): Promise<CMSBlock | undefined>;
  updateBlock(id: string, input: Partial<CMSBlock>): Promise<CMSBlock>;
  deleteBlock(id: string): Promise<void>;
  listBlocks(sectionId: string): Promise<CMSBlock[]>;

  registerComponent(component: CMSComponent): Promise<CMSComponent>;
  getComponent(id: string): Promise<CMSComponent | undefined>;
  listComponents(): Promise<CMSComponent[]>;

  registerMedia(media: CMSMedia): Promise<CMSMedia>;
  getMedia(id: string): Promise<CMSMedia | undefined>;
  listMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]>;
  deleteMedia(id: string): Promise<void>;

  createVersion(contentId: string, contentType: CMSContentType, data: Record<string, unknown>, authorId: string, message?: string): Promise<CMSVersion>;
  getVersions(contentId: string): Promise<CMSVersion[]>;
  getVersion(contentId: string, version: number): Promise<CMSVersion | undefined>;

  createPublishPipeline(contentId: string, contentType: CMSContentType): Promise<CMSPublishPipeline>;
  updatePublishPipeline(id: string, step: string, status: CMSPublishPipeline["steps"][number]["status"], error?: string): Promise<CMSPublishPipeline>;

  recordAudit(entry: Omit<CMSAuditEntry, "id" | "timestamp">): Promise<CMSAuditEntry>;
  getAuditLog(contentId?: string, contentType?: CMSContentType): Promise<CMSAuditEntry[]>;
}