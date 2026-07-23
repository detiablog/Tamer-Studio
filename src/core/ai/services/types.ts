export interface AIServiceContext {
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
}
