import type { CapabilityDefinition, CapabilityId } from "../types/capability";

export class CapabilityRegistry {
  private capabilities: Map<CapabilityId, CapabilityDefinition> = new Map();

  register(definition: CapabilityDefinition): void {
    if (this.capabilities.has(definition.id)) {
      throw new Error(`Capability ${definition.id} is already registered`);
    }
    this.capabilities.set(definition.id, definition);
  }

  registerMany(definitions: CapabilityDefinition[]): void {
    for (const definition of definitions) {
      this.register(definition);
    }
  }

  resolve(capabilityId: CapabilityId): CapabilityDefinition | undefined {
    return this.capabilities.get(capabilityId);
  }

  has(capabilityId: CapabilityId): boolean {
    return this.capabilities.has(capabilityId);
  }

  list(): CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  listByCategory(category: string): CapabilityDefinition[] {
    return this.list().filter((capability) => capability.category === category);
  }
}

export const defaultCapabilities: CapabilityDefinition[] = [
  {
    id: "text-generation",
    name: "Text Generation",
    category: "text",
    description: "Generate text content from prompts",
    inputSchema: { prompt: "string", maxTokens: "number?" },
    outputSchema: { text: "string", tokens: "number" },
    tags: ["llm", "text"],
  },
  {
    id: "image-generation",
    name: "Image Generation",
    category: "image",
    description: "Generate images from text prompts",
    inputSchema: { prompt: "string", size: "string?", style: "string?" },
    outputSchema: { url: "string", width: "number", height: "number" },
    tags: ["image", "generation"],
  },
  {
    id: "video-generation",
    name: "Video Generation",
    category: "video",
    description: "Generate video content from prompts or images",
    inputSchema: { prompt: "string", duration: "number?", fps: "number?" },
    outputSchema: { url: "string", duration: "number", fps: "number" },
    tags: ["video", "generation"],
  },
  {
    id: "storyboard",
    name: "Storyboard",
    category: "video",
    description: "Generate storyboard sequences for video production",
    inputSchema: { script: "string", scenes: "number?" },
    outputSchema: { scenes: "array", assets: "array" },
    tags: ["storyboard", "video", "production"],
  },
  {
    id: "affiliate-script",
    name: "Affiliate Script",
    category: "text",
    description: "Generate affiliate marketing scripts",
    inputSchema: { product: "string", audience: "string", tone: "string?" },
    outputSchema: { script: "string", variations: "number" },
    tags: ["script", "affiliate", "marketing"],
  },
  {
    id: "drama-script",
    name: "Drama Script",
    category: "text",
    description: "Generate drama script content",
    inputSchema: { premise: "string", characters: "array", length: "string?" },
    outputSchema: { script: "string", scenes: "number" },
    tags: ["script", "drama", "production"],
  },
  {
    id: "caption",
    name: "Caption",
    category: "text",
    description: "Generate captions for social media",
    inputSchema: { content: "string", platform: "string", tone: "string?" },
    outputSchema: { captions: "array", hashtags: "array" },
    tags: ["caption", "social", "marketing"],
  },
  {
    id: "translation",
    name: "Translation",
    category: "text",
    description: "Translate content between languages",
    inputSchema: { text: "string", sourceLanguage: "string", targetLanguage: "string" },
    outputSchema: { translatedText: "string", detectedLanguage: "string" },
    tags: ["translation", "localization"],
  },
  {
    id: "speech",
    name: "Speech",
    category: "speech",
    description: "Generate speech audio from text",
    inputSchema: { text: "string", voice: "string?", speed: "number?" },
    outputSchema: { url: "string", duration: "number", format: "string" },
    tags: ["speech", "audio", "tts"],
  },
  {
    id: "vision",
    name: "Vision",
    category: "vision",
    description: "Analyze and understand images",
    inputSchema: { imageUrl: "string", prompt: "string" },
    outputSchema: { description: "string", objects: "array", text: "string?" },
    tags: ["vision", "image", "analysis"],
  },
  {
    id: "embeddings",
    name: "Embeddings",
    category: "embedding",
    description: "Generate vector embeddings for text",
    inputSchema: { text: "string", model: "string?" },
    outputSchema: { embedding: "array", dimensions: "number" },
    tags: ["embedding", "vector", "search"],
  },
];

export interface Registry {
  getCapability(id: CapabilityId): CapabilityDefinition | undefined;
  hasCapability(id: CapabilityId): boolean;
  listCapabilities(): CapabilityDefinition[];
  getWorkflow(id: string): { id: string; name: string } | undefined;
  hasWorkflow(id: string): boolean;
  listWorkflows(): { id: string; name: string }[];
  getGateway(id: string): { id: string; name: string } | undefined;
  hasGateway(id: string): boolean;
  listGateways(): { id: string; name: string }[];
}
