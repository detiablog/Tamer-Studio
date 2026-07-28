import type { CMSMedia } from "../cms.types";

export interface CMSMediaRepository {
  createMedia(media: CMSMedia): Promise<CMSMedia>;
  getMedia(id: string): Promise<CMSMedia | undefined>;
  listMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]>;
  updateMedia(id: string, updates: Partial<CMSMedia>): Promise<CMSMedia | undefined>;
  deleteMedia(id: string): Promise<void>;
}
