import type { CMSVersion } from "../cms.types";

export interface CMSVersionRepository {
  createVersion(version: CMSVersion): Promise<CMSVersion>;
  getVersion(id: string): Promise<CMSVersion | undefined>;
  getVersionsByContentId(contentId: string): Promise<CMSVersion[]>;
  getVersionByNumber(contentId: string, version: number): Promise<CMSVersion | undefined>;
}
