import type { SEOAISearchInput, SEOAISearchResult } from "./seo.types";
import { getSEOCache } from "./seo-cache";

export class AISearchRuntime {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "https://tamer.studio";
  }

  resolve(input: SEOAISearchInput): SEOAISearchResult {
    const cache = getSEOCache();
    const cacheKey = cache.buildKey(["ai-search", input.route ?? "root"]);

    const cached = cache.get<SEOAISearchResult>(cacheKey);
    if (cached) return cached;

    const result: SEOAISearchResult = {
      llmMetadata: {
        title: input.title,
        summary: input.description,
        entities: this.extractEntities(input.title, input.description, input.content),
        topics: this.extractTopics(input.title, input.description, input.content),
      },
      crawlMetadata: {
        allowAI: true,
        indexable: true,
        freshness: input.modifiedTime || input.publishedTime || new Date().toISOString(),
      },
      semanticMetadata: {
        description: input.description,
        keywords: this.extractKeywords(input.title, input.description, input.content),
        author: input.author || "Tamer Studio",
        type: input.type || "website",
      },
      knowledgeGraph: {
        name: input.title,
        description: input.description,
        url: input.route ? `${this.baseUrl}${input.route}` : this.baseUrl,
        sameAs: this.getSameAsLinks(),
      },
    };

    cache.set(cacheKey, result, ["ai-search"]);
    return result;
  }

  resolveForPage(input: SEOAISearchInput): SEOAISearchResult {
    return this.resolve(input);
  }

  generateLLMMetadata(input: SEOAISearchInput): string {
    const result = this.resolve(input);
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: input.title,
      description: input.description,
      author: result.semanticMetadata.author,
      dateModified: result.crawlMetadata.freshness,
      about: {
        "@type": "Thing",
        name: "Tamer Studio",
      },
      mainEntity: {
        "@type": "SoftwareApplication",
        name: "Tamer Studio",
        description: "AI-first production operating system",
        url: this.baseUrl,
      },
    });
  }

  generateAISummary(input: SEOAISearchInput): string {
    const entities = this.extractEntities(input.title, input.description, input.content);
    const topics = this.extractTopics(input.title, input.description, input.content);

    const parts = [
      input.title,
      input.description,
      entities.length > 0 ? `Related to: ${entities.join(", ")}` : "",
      topics.length > 0 ? `Topics: ${topics.join(", ")}` : "",
    ].filter(Boolean);

    return parts.join(". ");
  }

  resolveForChatGPT(input: SEOAISearchInput): SEOAISearchResult {
    return this.resolve({ ...input });
  }

  resolveForGemini(input: SEOAISearchInput): SEOAISearchResult {
    return this.resolve({ ...input });
  }

  resolveForClaude(input: SEOAISearchInput): SEOAISearchResult {
    return this.resolve({ ...input });
  }

  resolveForPerplexity(input: SEOAISearchInput): SEOAISearchResult {
    return this.resolve({ ...input });
  }

  resolveForCopilot(input: SEOAISearchInput): SEOAISearchResult {
    return this.resolve({ ...input });
  }

  private extractEntities(title: string, description: string, content?: string): string[] {
    const text = `${title} ${description} ${content || ""}`.toLowerCase();
    const entities: string[] = [];

    const knownEntities = [
      "Tamer Studio", "OpenAI", "Gemini", "Claude", "OpenRouter", "Kilo",
      "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Drizzle ORM",
      "Tailwind CSS", "Better Auth", "Vercel", "Docker",
    ];

    for (const entity of knownEntities) {
      if (text.includes(entity.toLowerCase())) {
        entities.push(entity);
      }
    }

    return entities;
  }

  private extractTopics(title: string, description: string, content?: string): string[] {
    const text = `${title} ${description} ${content || ""}`.toLowerCase();
    const topics: string[] = [];

    const topicKeywords: Record<string, string[]> = {
      "AI Production": ["ai", "production", "generate", "content"],
      "Content Management": ["cms", "content", "page", "section"],
      "Workflow Automation": ["workflow", "automation", "pipeline", "pipeline"],
      "Multi-Provider AI": ["openai", "gemini", "claude", "provider"],
      "Cost Optimization": ["cost", "budget", "optimization", "pricing"],
      "Version Control": ["version", "rollback", "audit", "history"],
      "Enterprise": ["enterprise", "security", "permission", "admin"],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matchCount = keywords.filter((k) => text.includes(k)).length;
      if (matchCount >= 2) {
        topics.push(topic);
      }
    }

    if (topics.length === 0) {
      topics.push("Tamer Studio", "AI Platform");
    }

    return topics;
  }

  private extractKeywords(title: string, description: string, content?: string): string[] {
    const text = `${title} ${description} ${content || ""}`.toLowerCase();
    const keywords: string[] = [];

    const keywordMap: Record<string, string> = {
      "ai": "artificial intelligence",
      "production": "content production",
      "platform": "software platform",
      "automation": "workflow automation",
      "generate": "content generation",
      "publish": "content publishing",
      "workflow": "production workflow",
      "multi-provider": "multi-provider AI",
    };

    for (const [key, keyword] of Object.entries(keywordMap)) {
      if (text.includes(key)) {
        keywords.push(keyword);
      }
    }

    return keywords.length > 0 ? keywords : ["AI production platform", "content management"];
  }

  private getSameAsLinks(): string[] {
    return [
      "https://github.com/tamer-studio",
      "https://twitter.com/tamerstudio",
    ];
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

let aiSearchRuntimeInstance: AISearchRuntime | null = null;

export function getAISearchRuntime(): AISearchRuntime {
  if (!aiSearchRuntimeInstance) {
    aiSearchRuntimeInstance = new AISearchRuntime();
  }
  return aiSearchRuntimeInstance;
}

export function resetAISearchRuntime(): void {
  aiSearchRuntimeInstance = null;
}
