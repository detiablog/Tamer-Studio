import { db } from "@/lib/db";
import { contextBuilderService } from "@/core/creative-memory/context-builder.service";
import { promptVariableService } from "./prompt-variable.service";

export interface EnrichedPrompt {
  prompt: string;
  injectedContext: string[];
  resolvedVariables: Record<string, string>;
  metadata: Record<string, unknown>;
}

export class PromptContextBuilderService {
  async enrichPrompt(userId: string, prompt: string, options?: { moduleType?: string; projectId?: string; storyId?: string; variables?: Record<string, string> }): Promise<EnrichedPrompt> {
    const injectedContext: string[] = [];
    const resolvedVariables: Record<string, string> = {};

    let resolved = prompt;

    if (options?.variables) {
      const renderResult = await promptVariableService.renderVariables(resolved, options.variables);
      resolved = renderResult.rendered;
      Object.assign(resolvedVariables, options.variables);
    }

    const extractedKeys = promptVariableService.extractVariables(resolved);
    if (extractedKeys.length > 0) {
      const storedValues = await promptVariableService.resolveVariableValues(userId, extractedKeys);
      const mergedVars = { ...resolvedVariables, ...storedValues };
      const renderResult = await promptVariableService.renderVariables(resolved, mergedVars);
      resolved = renderResult.rendered;
      Object.assign(resolvedVariables, storedValues);
    }

    if (options?.projectId) {
      injectedContext.push(`Project: ${options.projectId}`);
    }
    if (options?.storyId) {
      injectedContext.push(`Story: ${options.storyId}`);
    }

    let creativeSummary = "";
    try {
      const moduleType = options?.moduleType || "general";
      const context = await contextBuilderService.buildPromptContext(userId, moduleType);
      creativeSummary = contextBuilderService.getContextSummary(context);
      if (creativeSummary) {
        injectedContext.push("Creative memory brand/style context injected");
      }
    } catch {
      creativeSummary = "";
    }

    let finalPrompt = resolved;
    if (creativeSummary) {
      finalPrompt = `${creativeSummary}\n\n${finalPrompt}`;
    }

    return {
      prompt: finalPrompt,
      injectedContext,
      resolvedVariables,
      metadata: { extractedKeys, hadCreativeContext: !!creativeSummary },
    };
  }
}

export const promptContextBuilderService = new PromptContextBuilderService();
