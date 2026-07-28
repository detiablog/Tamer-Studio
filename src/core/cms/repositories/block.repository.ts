import type { CMSBlock } from "../cms.types";

export interface CMSBlockRepository {
  createBlock(block: CMSBlock): Promise<CMSBlock>;
  getBlock(id: string): Promise<CMSBlock | undefined>;
  getBlocksBySectionId(sectionId: string): Promise<CMSBlock[]>;
  updateBlock(id: string, updates: Partial<CMSBlock>): Promise<CMSBlock | undefined>;
  deleteBlock(id: string): Promise<void>;
}
