import type { CMSPage, CMSCreatePageInput, CMSUpdatePageInput, CMSPageStatus, CMSContentType } from "../cms.types";

export interface CMSPageRepository {
  createPage(input: CMSCreatePageInput): Promise<CMSPage>;
  getPage(id: string): Promise<CMSPage | undefined>;
  getPageBySlug(slug: string): Promise<CMSPage | undefined>;
  updatePage(id: string, input: CMSUpdatePageInput): Promise<CMSPage | undefined>;
  deletePage(id: string): Promise<void>;
  listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): Promise<CMSPage[]>;
  restorePage(id: string): Promise<CMSPage | undefined>;
}
