import type { PromptVariable, PromptContext, OrchestrationResult } from "./types";
import type { PromptTemplateRegistry } from "./template-registry";
import type { ContextBuilder } from "./context-builder";
import type { VariableResolver } from "./variable-resolver";
import type { PromptOptimizer } from "./prompt-optimizer";

export interface PromptCompiler {
  compile(templateId: string, variables: PromptVariable[], context: PromptContext): Promise<OrchestrationResult>;
}

export class DefaultPromptCompiler implements PromptCompiler {
  constructor(
    private templateRegistry: PromptTemplateRegistry,
    private contextBuilder: ContextBuilder,
    private variableResolver: VariableResolver,
    private promptOptimizer: PromptOptimizer,
  ) {}

  async compile(templateId: string, variables: PromptVariable[], context: PromptContext): Promise<OrchestrationResult> {
    const template = this.templateRegistry.resolve(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const validation = this.variableResolver.validate(template.content, variables);
    if (!validation.valid) {
      throw new Error(`Missing variables: ${validation.missing.join(", ")}`);
    }

    let compiledPrompt = this.variableResolver.resolve(template.content, variables);
    compiledPrompt = await this.promptOptimizer.optimize(compiledPrompt, undefined, context);

    const executionContext = {
      requestId: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      metadata: { templateId, templateVersion: template.version },
    };

    await this.contextBuilder.build(executionContext, context);

    const result: OrchestrationResult = {
      executionId: `prompt_${crypto.randomUUID().replace(/-/g, "")}`,
      compiledPrompt,
      templateId,
      templateVersion: template.version,
      variables,
      context,
      warnings: validation.missing,
    };

    return result;
  }
}
