import type { WorkflowNodeDefinition, NodeCategory, NodeMetadata, UIMetadata, NodeInputContract, NodeOutputContract, NodeValueType } from "../../types";
import { BaseWorkflowNodeDefinition } from "../../node/node-definition";

export function createOfficialNodes(): WorkflowNodeDefinition[] {
  return [
    new BaseWorkflowNodeDefinition({
      id: "official.ai.prompt",
      type: "official.ai.prompt",
      category: "ai",
      name: "AI Prompt",
      description: "Generates text using an AI model",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["ai", "text", "generation"],
        icon: "Sparkles",
      },
      inputContract: [
        { name: "prompt", type: "text", required: true, description: "The prompt to send to the AI model" },
        { name: "systemPrompt", type: "text", required: false, description: "Optional system prompt" },
        { name: "model", type: "string", required: false, defaultValue: "", description: "Model identifier" },
        { name: "temperature", type: "number", required: false, defaultValue: 0.7, description: "Sampling temperature" },
        { name: "maxTokens", type: "number", required: false, defaultValue: 1024, description: "Maximum tokens to generate" },
      ],
      outputContract: [
        { name: "text", type: "text", description: "Generated text response" },
        { name: "usage", type: "object", description: "Token usage metadata" },
      ],
    }),
    new BaseWorkflowNodeDefinition({
      id: "official.ai.image",
      type: "official.ai.image",
      category: "ai",
      name: "AI Image",
      description: "Generates an image using an AI model",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["ai", "image", "generation"],
        icon: "Image",
      },
      inputContract: [
        { name: "prompt", type: "text", required: true, description: "Image generation prompt" },
        { name: "model", type: "string", required: false, defaultValue: "", description: "Model identifier" },
        { name: "width", type: "number", required: false, defaultValue: 1024, description: "Image width" },
        { name: "height", type: "number", required: false, defaultValue: 1024, description: "Image height" },
      ],
      outputContract: [
        { name: "url", type: "text", description: "Generated image URL" },
        { name: "width", type: "number", description: "Image width" },
        { name: "height", type: "number", description: "Image height" },
      ],
    }),
    new BaseWorkflowNodeDefinition({
      id: "official.ai.video",
      type: "official.ai.video",
      category: "media",
      name: "AI Video",
      description: "Generates a video using an AI model",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["ai", "video", "generation"],
        icon: "Video",
      },
      inputContract: [
        { name: "prompt", type: "text", required: true, description: "Video generation prompt" },
        { name: "model", type: "string", required: false, defaultValue: "", description: "Model identifier" },
        { name: "duration", type: "number", required: false, defaultValue: 5, description: "Duration in seconds" },
        { name: "fps", type: "number", required: false, defaultValue: 24, description: "Frames per second" },
      ],
      outputContract: [
        { name: "url", type: "text", description: "Generated video URL" },
        { name: "duration", type: "number", description: "Video duration in seconds" },
        { name: "fps", type: "number", description: "Frames per second" },
      ],
    }),
  ];
}
