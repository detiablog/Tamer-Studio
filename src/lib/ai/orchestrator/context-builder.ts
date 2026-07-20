import type { ExecutionContext } from "../execution/types";
import type { PromptContext } from "./types";

export interface ContextBuilder {
  build(executionContext: ExecutionContext, promptContext: PromptContext): Promise<Record<string, unknown>>;
}

export class DefaultContextBuilder implements ContextBuilder {
  async build(executionContext: ExecutionContext, promptContext: PromptContext): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {
      userId: executionContext.userId,
      workspaceId: executionContext.workspaceId,
      projectId: executionContext.projectId,
      requestId: executionContext.requestId,
      traceId: executionContext.traceId,
      metadata: executionContext.metadata,
      brandTone: promptContext.brandTone,
      workflow: promptContext.workflow,
      selectedAssets: promptContext.selectedAssets,
      userPreferences: promptContext.userPreferences,
      language: promptContext.language,
      platform: promptContext.platform,
      targetAudience: promptContext.targetAudience,
    };

    return context;
  }
}
