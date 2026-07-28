export type MediaKind = "image" | "video" | "audio" | "document" | "archive" | "custom";
export type MediaStatus = "active" | "deleted";

export interface UserMedia {
  id: string;
  userId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  kind: MediaKind;
  storageKey: string;
  status: MediaStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaInput {
  userId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  kind: MediaKind;
  storageKey: string;
}

export interface UpdateMediaInput {
  filename?: string;
  status?: MediaStatus;
}

export function mimeToMediaKind(mimeType: string): MediaKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  )
    return "document";
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar") || mimeType.includes("gzip"))
    return "archive";
  return "custom";
}
