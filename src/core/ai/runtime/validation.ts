import type { AIRequest } from "./types";
import { randomUUID } from "crypto";

export function validateAIRequest(request: AIRequest): void {
  if (!request.capability || typeof request.capability !== "string" || request.capability.trim() === "") {
    throw new Error("Invalid AIRequest: capability is required and must be a non-empty string.");
  }
  if (!request.payload || typeof request.payload !== "object" || Array.isArray(request.payload)) {
    throw new Error("Invalid AIRequest: payload is required and must be a non-null object.");
  }
}

export function normalizeAIRequest(request: AIRequest): AIRequest {
  return {
    ...request,
    id: request.id ?? `req_${randomUUID()}`,
    timeoutMs: request.timeoutMs ?? 30000,
    metadata: request.metadata && typeof request.metadata === "object" ? request.metadata : {},
  };
}
