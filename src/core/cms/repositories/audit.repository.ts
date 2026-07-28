import type { CMSAuditEntry, CMSContentType } from "../cms.types";

export interface CMSAuditRepository {
  createEntry(entry: Omit<CMSAuditEntry, "id" | "timestamp">): Promise<CMSAuditEntry>;
  getEntry(id: string): Promise<CMSAuditEntry | undefined>;
  getAuditLog(contentId?: string, contentType?: CMSContentType): Promise<CMSAuditEntry[]>;
}
