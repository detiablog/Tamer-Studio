import type { WorkflowNode, NodeResult } from "../types";
import type { WorkflowNodeDefinition, NodeExecutionContext, ValidationResult, NodeCategory } from "../../sdk";
import { BaseWorkflowNodeDefinition } from "../../sdk/node/node-definition";

function createNodeDefinition(type: string, category: NodeCategory, name: string, description: string, inputs: { name: string; type: string; required: boolean; defaultValue?: unknown; description?: string }[] = [], outputs: { name: string; type: string; description?: string }[] = []): WorkflowNodeDefinition {
  return new BaseWorkflowNodeDefinition({
    id: `node.${type}`,
    type,
    category,
    name,
    description,
    version: "1.0.0",
    metadata: {
      author: "tamer-studio",
      tags: [type, category],
      icon: name,
    },
    inputContract: inputs.map((i) => ({
      name: i.name,
      type: i.type as WorkflowNodeDefinition["inputContract"][number]["type"],
      required: i.required,
      defaultValue: i.defaultValue,
      description: i.description,
    })),
    outputContract: outputs.map((o) => ({
      name: o.name,
      type: o.type as WorkflowNodeDefinition["outputContract"][number]["type"],
      description: o.description,
    })),
  });
}

function createNodeResult(node: WorkflowNode, status: NodeResult["status"], output: Record<string, unknown> = {}, assets: string[] = [], error?: string): NodeResult {
  const startedAt = new Date().toISOString();
  return {
    nodeId: node.id,
    status,
    output,
    assets,
    durationMs: 0,
    startedAt,
    completedAt: new Date().toISOString(),
    error,
  };
}

export interface WorkflowNodeHandler {
  type: string;
  execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult>;
}

export class PromptNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("prompt", "ai", "Prompt", "Processes a prompt", [
    { name: "prompt", type: "text", required: true },
  ], [
    { name: "text", type: "text", description: "Processed prompt output" },
  ]);
  type = "prompt";

  async execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { prompt: context.prompt ?? node.config.prompt ?? "" });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class ImageGenerationNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("image_generation", "ai", "Image Generation", "Generates an image");
  type = "image_generation";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { url: "", width: 0, height: 0 });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class VideoGenerationNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("video_generation", "media", "Video Generation", "Generates a video");
  type = "video_generation";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { url: "", duration: 0, fps: 0 });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class CaptionNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("caption", "ai", "Caption", "Generates captions");
  type = "caption";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { captions: [], hashtags: [] });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class TranslationNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("translation", "ai", "Translation", "Translates text");
  type = "translation";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { translatedText: "", detectedLanguage: "" });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class ApprovalNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("approval", "flow", "Approval", "Requires human approval");
  type = "approval";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "waiting_approval", { approved: false });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class PublishNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("publish", "publishing", "Publish", "Publishes content");
  type = "publish";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { published: true, url: "" });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export class ExportNodeHandler implements WorkflowNodeHandler {
  readonly definition = createNodeDefinition("export", "output", "Export", "Exports content");
  type = "export";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    return createNodeResult(node, "completed", { url: "", format: "zip" });
  }

  async validate(_input: NodeExecutionContext): Promise<ValidationResult> {
    return { valid: true, errors: [], warnings: [] };
  }
}

export const defaultNodeHandlers: WorkflowNodeHandler[] = [
  new PromptNodeHandler(),
  new ImageGenerationNodeHandler(),
  new VideoGenerationNodeHandler(),
  new CaptionNodeHandler(),
  new TranslationNodeHandler(),
  new ApprovalNodeHandler(),
  new PublishNodeHandler(),
  new ExportNodeHandler(),
];
