export type AttachmentType = "image" | "document" | "video" | "other";

export interface SupportAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileType: AttachmentType;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface CreateAttachmentInput {
  ticketId: string;
  fileName: string;
  fileType: AttachmentType;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
}

export interface AttachmentFilter {
  ticketId?: string;
  uploadedBy?: string;
  limit?: number;
  offset?: number;
}
