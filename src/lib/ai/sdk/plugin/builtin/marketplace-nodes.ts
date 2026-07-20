import type { WorkflowNodeDefinition, NodeCategory, NodeMetadata, UIMetadata, NodeInputContract, NodeOutputContract, NodeValueType } from "../../types";
import { BaseWorkflowNodeDefinition } from "../../node/node-definition";

export function createMarketplaceNodes(): WorkflowNodeDefinition[] {
  return [
    new BaseWorkflowNodeDefinition({
      id: "marketplace.affiliate.script",
      type: "marketplace.affiliate.script",
      category: "ai",
      name: "Affiliate Script Generator",
      description: "Generates affiliate marketing scripts",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["affiliate", "script", "marketing"],
        icon: "FileText",
        experimental: false,
      },
      inputContract: [
        { name: "product", type: "text", required: true, description: "Product or service name" },
        { name: "platform", type: "text", required: true, description: "Target platform (YouTube, TikTok, etc.)" },
        { name: "tone", type: "text", required: false, defaultValue: "professional", description: "Script tone" },
        { name: "length", type: "number", required: false, defaultValue: 500, description: "Approximate word count" },
      ],
      outputContract: [
        { name: "script", type: "text", description: "Generated affiliate script" },
        { name: "hooks", type: "array", description: "Suggested hooks" },
      ],
    }),
    new BaseWorkflowNodeDefinition({
      id: "marketplace.drama.script",
      type: "marketplace.drama.script",
      category: "ai",
      name: "Drama Script Generator",
      description: "Generates drama short-form scripts",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["drama", "script", "storytelling"],
        icon: "Drama",
        experimental: false,
      },
      inputContract: [
        { name: "theme", type: "text", required: true, description: "Drama theme or genre" },
        { name: "platform", type: "text", required: true, description: "Target platform" },
        { name: "duration", type: "number", required: false, defaultValue: 60, description: "Target duration in seconds" },
      ],
      outputContract: [
        { name: "script", type: "text", description: "Generated drama script" },
        { name: "scenes", type: "array", description: "Scene breakdown" },
      ],
    }),
    new BaseWorkflowNodeDefinition({
      id: "marketplace.thumbnail",
      type: "marketplace.thumbnail",
      category: "media",
      name: "Thumbnail Generator",
      description: "Generates video thumbnails",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["thumbnail", "media", "youtube"],
        icon: "Image",
        experimental: true,
      },
      inputContract: [
        { name: "title", type: "text", required: true, description: "Video title" },
        { name: "style", type: "text", required: false, defaultValue: "bold", description: "Thumbnail style" },
      ],
      outputContract: [
        { name: "url", type: "text", description: "Thumbnail URL" },
        { name: "width", type: "number", description: "Width in pixels" },
        { name: "height", type: "number", description: "Height in pixels" },
      ],
    }),
  ];
}
