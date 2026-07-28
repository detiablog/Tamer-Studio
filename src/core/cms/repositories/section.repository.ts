import type { CMSSection } from "../cms.types";

export interface CMSSectionRepository {
  createSection(section: CMSSection): Promise<CMSSection>;
  getSection(id: string): Promise<CMSSection | undefined>;
  getSectionsByPageId(pageId: string): Promise<CMSSection[]>;
  updateSection(id: string, updates: Partial<CMSSection>): Promise<CMSSection | undefined>;
  deleteSection(id: string): Promise<void>;
  reorderSections(pageId: string, sectionOrders: { id: string; order: number }[]): Promise<void>;
}
