import type { WorkflowNode, NodeResult } from "../types";

export interface WorkflowNodeHandler {
  type: string;
  execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult>;
}

export class PromptNodeHandler implements WorkflowNodeHandler {
  type = "prompt";

  async execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { prompt: context.prompt ?? node.config.prompt ?? "" },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class ImageGenerationNodeHandler implements WorkflowNodeHandler {
  type = "image_generation";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { url: "", width: 0, height: 0 },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class VideoGenerationNodeHandler implements WorkflowNodeHandler {
  type = "video_generation";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { url: "", duration: 0, fps: 0 },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class CaptionNodeHandler implements WorkflowNodeHandler {
  type = "caption";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { captions: [], hashtags: [] },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class TranslationNodeHandler implements WorkflowNodeHandler {
  type = "translation";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { translatedText: "", detectedLanguage: "" },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class ApprovalNodeHandler implements WorkflowNodeHandler {
  type = "approval";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "waiting_approval",
      output: { approved: false },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class PublishNodeHandler implements WorkflowNodeHandler {
  type = "publish";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { published: true, url: "" },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
  }
}

export class ExportNodeHandler implements WorkflowNodeHandler {
  type = "export";

  async execute(node: WorkflowNode, _context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    return {
      nodeId: node.id,
      status: "completed",
      output: { url: "", format: "zip" },
      assets: [],
      durationMs: Date.now() - startTime,
      startedAt,
      completedAt: new Date().toISOString(),
    };
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
