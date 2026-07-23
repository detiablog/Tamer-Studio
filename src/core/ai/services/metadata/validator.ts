import type { GenerationMetadata as GenerationMetadataType } from "./types";

export const REQUIRED_FIELDS = [
  "provider",
  "model",
  "prompt",
  "credits",
  "cost",
  "currency",
  "workspaceId",
  "generationId",
  "createdAt",
] as const;

export function validateGenerationMetadata(metadata: unknown): metadata is GenerationMetadataType {
  if (!metadata || typeof metadata !== "object") return false;

  const m = metadata as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in m) || m[field] === undefined || m[field] === null) {
      return false;
    }
  }

  return true;
}
