import type { PromptTemplate, PromptCategory, PromptPreview } from "./types";
import type { PromptTemplateRegistry } from "./template-registry";
import type { PromptCompiler } from "./prompt-compiler";

export interface PromptLibrary {
  getTemplate(templateId: string): PromptTemplate | undefined;
  listTemplates(category?: PromptCategory): PromptTemplate[];
  preview(templateId: string, variables: Record<string, string>, context?: Record<string, unknown>): Promise<PromptPreview | undefined>;
}

export class DefaultPromptLibrary implements PromptLibrary {
  constructor(
    private templateRegistry: PromptTemplateRegistry,
    private compiler: PromptCompiler,
  ) {}

  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templateRegistry.resolve(templateId);
  }

  listTemplates(category?: PromptCategory): PromptTemplate[] {
    if (category) {
      return this.templateRegistry.listByCategory(category);
    }
    return this.templateRegistry.list();
  }

  async preview(templateId: string, variables: Record<string, string>, _context?: Record<string, unknown>): Promise<PromptPreview | undefined> {
    const template = this.templateRegistry.resolve(templateId);
    if (!template) return undefined;

    const promptVariables = template.variables.map((key) => ({
      key,
      value: variables[key] ?? "",
      type: "string" as const,
    }));

    const result = await this.compiler.compile(templateId, promptVariables, {
      language: typeof _context?.language === "string" ? _context.language : undefined,
      platform: typeof _context?.platform === "string" ? _context.platform : undefined,
      targetAudience: typeof _context?.targetAudience === "string" ? _context.targetAudience : undefined,
    });

    return {
      templateId,
      version: template.version,
      compiledPrompt: result.compiledPrompt,
      variables: promptVariables,
      context: result.context,
      estimatedTokens: this.estimateTokens(result.compiledPrompt),
    };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
