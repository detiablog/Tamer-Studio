import { db } from "@/lib/db";
import { promptAnalytics } from "@/lib/db/schema/prompt-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface PromptAnalysis {
  qualityScore: number;
  length: number;
  wordCount: number;
  clarity: number;
  structure: number;
  contextScore: number;
  ambiguityScore: number;
  estimatedTokens: number;
  issues: string[];
  suggestions: string[];
  strengths: string[];
  hasVariables: boolean;
  hasInjectionsNeeded: boolean;
  riskLevel: "low" | "medium" | "high";
}

export class PromptAnalyzerService {
  async analyze(prompt: string, type: string = "custom"): Promise<PromptAnalysis> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const strengths: string[] = [];

    const length = prompt.length;
    const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
    const estimatedTokens = Math.ceil(length / 4);

    if (length < 20) {
      issues.push("Prompt is too short to provide sufficient context.");
      suggestions.push("Add more detail about the subject, style, and desired outcome.");
    }
    if (length > 4000) {
      issues.push("Prompt exceeds 4000 characters and may exceed context limits.");
      suggestions.push("Consider condensing the prompt or splitting it into sections.");
    }
    if (wordCount < 10) {
      issues.push("Very few words provided; the model may lack direction.");
    }

    if (!prompt.includes(",") && wordCount > 15) {
      suggestions.push("Consider using commas to separate distinct concepts and instructions.");
    }

    const hasPositiveDriver = /(cinematic|professional|high.?quality|detailed|vibrant|premium|elegant)/i.test(prompt);
    const hasStyle = /(style|mood|atmosphere|aesthetic|look|feel)/i.test(prompt);
    const hasSubject = /(of|about|showing|featuring|with)/i.test(prompt);
    const hasContext = /(for|targeting|audience|platform|use.?case|purpose)/i.test(prompt);
    const hasFormat = /(aspect.?ratio|resolution|16:9|9:16|4:3|size|dimension)/i.test(prompt);
    const hasLighting = /(lighting|light|golden.?hour|soft.?light|dramatic)/i.test(prompt);
    const hasCamera = /(camera|angle|shot|macro|wide.?shot|close.?up|len)/i.test(prompt);
    const hasAction = /(showing|doing|wearing|holding|surrounded|in the)/i.test(prompt);

    if (!hasSubject) {
      issues.push("The main subject is unclear.");
      suggestions.push("Clearly specify the main subject at the start of the prompt.");
    }
    if (!hasStyle) {
      issues.push("No visual or writing style is specified.");
      suggestions.push("Add a stylistic guide, e.g. 'cinematic style' or 'clean minimal style'.");
    }
    if (!hasPositiveDriver) {
      suggestions.push("Add descriptive quality modifiers like 'premium', 'detailed', or 'professional'.");
    }
    if (hasSubject && hasPositiveDriver && hasStyle) {
      strengths.push("Good subject, style, and quality framing.");
    }
    if (hasFormat) strengths.push("Format and dimensions are specified.");
    if (hasLighting) strengths.push("Lighting conditions are described.");
    if (hasCamera) strengths.push("Camera and angle details are provided.");
    if (hasContext) strengths.push("Context and target audience are considered.");
    if (hasAction) strengths.push("Subject action or position is described.");

    const ambiguityPatterns = /(thing|stuff|nice|good|beautiful|great something|etc|whatever)/i;
    if (ambiguityPatterns.test(prompt)) {
      issues.push("Some words are ambiguous and could be interpreted differently.");
      suggestions.push("Replace vague terms like 'nice' or 'thing' with concrete descriptions.");
    }

    const safetyPatterns = /(nsfw|nude|gore|explicit|illegal|harm|intimate|unsafe)/i;
    let riskLevel: "low" | "medium" | "high" = "low";
    if (safetyPatterns.test(prompt)) {
      issues.push("Prompt contains potentially unsafe content.");
      riskLevel = "high";
    } else if (!hasSubject || !hasStyle) {
      riskLevel = "medium";
    }

    const totalChecks = 8;
    const passedChecks = [hasSubject, hasStyle, hasContext, hasFormat, hasLighting, hasCamera, hasAction, hasPositiveDriver].filter(Boolean).length;
    const clarity = Math.min(100, 40 + (passedChecks / totalChecks) * 50);
    const structure = Math.min(100, 30 + (prompt.length > 50 ? 40 : 20) + (prompt.includes(",") ? 20 : 0) + (prompt.split("\n").length > 1 ? 10 : 0));
    const contextScore = hasContext ? 80 : hasSubject ? 60 : 30;
    const ambiguityScore = Math.max(0, 100 - (issues.length * 12));
    const qualityScore = Math.round(Math.min(100, clarity * 0.4 + structure * 0.25 + contextScore * 0.15 + ambiguityScore * 0.2));

    const hasVariables = /\{\{\s*[\w.]+\s*\}\}/.test(prompt);
    const needsInjection = hasContext === false;

    return {
      qualityScore,
      length,
      wordCount,
      clarity: Math.round(clarity),
      structure: Math.round(structure),
      contextScore: Math.round(contextScore),
      ambiguityScore: Math.round(ambiguityScore),
      estimatedTokens,
      issues,
      suggestions,
      strengths,
      hasVariables,
      hasInjectionsNeeded: needsInjection,
      riskLevel,
    };
  }

  async recordAnalytics(userId: string, data: { promptId?: string; metricName: string; value: number; provider?: string; model?: string; dimensions?: Record<string, unknown> }) {
    const id = generateId("panl");
    return db.insert(promptAnalytics).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getPromptStats(userId: string) {
    const [totalAnalytics] = await db.select({ count: sql<number>`count(*)` }).from(promptAnalytics).where(eq(promptAnalytics.userId, userId));
    const byMetric = await db.select({ metricName: promptAnalytics.metricName, avgValue: sql<number>`avg(${promptAnalytics.value})`, count: sql<number>`count(*)` }).from(promptAnalytics).where(eq(promptAnalytics.userId, userId)).groupBy(promptAnalytics.metricName);
    return { totalAnalytics: Number(totalAnalytics?.count ?? 0), byMetric };
  }
}

export const promptAnalyzerService = new PromptAnalyzerService();
