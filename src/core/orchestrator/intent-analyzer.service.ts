import { db } from "@/lib/db";
import { orchestratorTemplate } from "@/lib/db/schema/orchestrator";
import { eq, and, desc, like, sql } from "drizzle-orm";

export type IntentType = 
  | "affiliate_campaign"
  | "drama_series"
  | "product_images"
  | "marketing_assets"
  | "video_creation"
  | "content_repurpose"
  | "optimize_content"
  | "publish_campaign"
  | "story_creation"
  | "thumbnail_generation"
  | "unknown";

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  suggestedTemplateId?: string;
  extractedParameters: Record<string, unknown>;
  recommendedModules: string[];
}

export class IntentAnalyzerService {
  private intentKeywords: Record<IntentType, string[]> = {
    affiliate_campaign: ["affiliate", "product", "promotion", "campaign", "sell", "marketing", "conversion"],
    drama_series: ["drama", "series", "episode", "story arc", "character development", "soap opera"],
    product_images: ["product image", "photo", "picture", "visual", "mockup", "product shot"],
    marketing_assets: ["marketing", "ad", "banner", "poster", "flyer", "social media"],
    video_creation: ["video", "reel", "short", "tiktok", "youtube", "clip", "animation"],
    content_repurpose: ["repurpose", "reuse", "adapt", "convert", "transform", "remake"],
    optimize_content: ["optimize", "improve", "enhance", "boost", "better", "a/b test"],
    publish_campaign: ["publish", "post", "schedule", "upload", "share", "distribute"],
    story_creation: ["story", "narrative", "write", "fiction", "book", "novel", "script"],
    thumbnail_generation: ["thumbnail", "cover", "preview", "headline image"],
    unknown: [],
  };

  async analyzeIntent(input: string, userId: string): Promise<IntentResult> {
    const lowerInput = input.toLowerCase();
    
    let bestIntent: IntentType = "unknown";
    let bestConfidence = 0;
    
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      if (intent === "unknown") continue;
      let matches = 0;
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          matches++;
        }
      }
      const confidence = matches / keywords.length;
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestIntent = intent as IntentType;
      }
    }

    const templates = await db
      .select()
      .from(orchestratorTemplate)
      .where(and(
        eq(orchestratorTemplate.isActive, true),
        eq(orchestratorTemplate.type, bestIntent)
      ))
      .orderBy(desc(orchestratorTemplate.usageCount))
      .limit(1);

    const recommendedModules = this.getRecommendedModules(bestIntent);
    const extractedParameters = this.extractParameters(lowerInput);

    return {
      intent: bestIntent,
      confidence: Math.min(bestConfidence * 100, 95),
      suggestedTemplateId: templates[0]?.id,
      extractedParameters,
      recommendedModules,
    };
  }

  private getRecommendedModules(intent: IntentType): string[] {
    const moduleMap: Record<IntentType, string[]> = {
      affiliate_campaign: ["project_studio", "trend_analyzer", "image_studio", "video_studio", "affiliate_studio", "publishing_hub", "analytics"],
      drama_series: ["story_engine", "drama_studio", "image_studio", "video_studio", "publishing_hub", "analytics"],
      product_images: ["project_studio", "image_studio", "thumbnail_studio"],
      marketing_assets: ["project_studio", "image_studio", "video_studio", "publishing_hub"],
      video_creation: ["project_studio", "video_studio", "image_studio", "publishing_hub"],
      content_repurpose: ["project_studio", "image_studio", "video_studio", "publishing_hub"],
      optimize_content: ["conversion_optimizer", "analytics", "creative_memory"],
      publish_campaign: ["publishing_hub", "analytics", "conversion_optimizer"],
      story_creation: ["story_engine", "creative_memory"],
      thumbnail_generation: ["image_studio", "creative_memory"],
      unknown: [],
    };
    return moduleMap[intent] || [];
  }

  private extractParameters(input: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    const platformMatch = input.match(/(tiktok|instagram|youtube|facebook|twitter|x|linkedin)/i);
    if (platformMatch) params.platform = platformMatch[1].toLowerCase();
    
    const countMatch = input.match(/(\d+)\s*(image|video|post|episode|scene)/i);
    if (countMatch) params.count = parseInt(countMatch[1]);
    if (countMatch) params.contentType = countMatch[2].toLowerCase();
    
    return params;
  }

  getIntentLabel(intent: IntentType): string {
    const labels: Record<IntentType, string> = {
      affiliate_campaign: "Affiliate Campaign",
      drama_series: "Drama Series",
      product_images: "Product Images",
      marketing_assets: "Marketing Assets",
      video_creation: "Video Creation",
      content_repurpose: "Content Repurposing",
      optimize_content: "Content Optimization",
      publish_campaign: "Publish Campaign",
      story_creation: "Story Creation",
      thumbnail_generation: "Thumbnail Generation",
      unknown: "Unknown Intent",
    };
    return labels[intent] || "Unknown";
  }
}

export const intentAnalyzerService = new IntentAnalyzerService();
