import { promptAnalyzerService, type PromptAnalysis } from "./prompt-analyzer.service";

export interface OptimizationResult {
  original: string;
  optimized: string;
  changes: string[];
  scoreBefore: number;
  scoreAfter: number;
  improvement: number;
}

export class PromptOptimizerService {
  async optimize(prompt: string, type: string = "custom"): Promise<OptimizationResult> {
    let optimized = prompt.trim();
    const changes: string[] = [];

    optimized = this.fixPunctuation(optimized);
    if (optimized !== prompt.trim()) {
      changes.push("Fixed punctuation and spacing.");
    }

    const capitalized = this.capitalizeFirst(optimized);
    if (capitalized !== optimized) {
      optimized = capitalized;
      changes.push("Capitalized the first letter.");
    }

    if (!/\.$/.test(optimized) && !optimized.endsWith("\n")) {
      optimized = optimized + ".";
      changes.push("Added sentence termination.");
    }

    const withStyleAdjective = this.addStyleAdjective(optimized, type);
    if (withStyleAdjective !== optimized) {
      optimized = withStyleAdjective;
      changes.push("Added a stylistic quality modifier.");
    }

    const withSubject = this.ensureSubjectClarity(optimized);
    if (withSubject !== optimized) {
      optimized = withSubject;
      changes.push("Added subject clarity guidance.");
    }

    const analyzed = await promptAnalyzerService.analyze(optimized, type);

    return {
      original: prompt.trim(),
      optimized,
      changes,
      scoreBefore: (await promptAnalyzerService.analyze(prompt.trim(), type)).qualityScore,
      scoreAfter: analyzed.qualityScore,
      improvement: analyzed.qualityScore - (await promptAnalyzerService.analyze(prompt.trim(), type)).qualityScore,
    };
  }

  private fixPunctuation(text: string): string {
    return text
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/,{2,}/g, ",")
      .replace(/\.{4,}/g, "...");
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private addStyleAdjective(text: string, type: string): string {
    const styleWords = /(cinematic|professional|high.?quality|detailed|vibrant|premium|elegant|clean|minimal)/i;
    if (styleWords.test(text)) return text;

    const typeAdjectives: Record<string, string> = {
      image: "Detailed, high-quality",
      video: "Cinematic, professionally produced",
      affiliate: "Persuasive, conversion-focused",
      drama: "Emotionally engaging, dramatic",
      story: "Vivid, narrative-driven",
      marketing: "Compelling, brand-aligned",
      seo: "Search-optimized, keyword-rich",
    };

    const adjective = typeAdjectives[type] || "High-quality";
    return `${adjective} ${text.charAt(0).toLowerCase()}${text.slice(1)}`.trim();
  }

  private ensureSubjectClarity(text: string): string {
    const subjectIndicators = /(of|about|showing|featuring|with|depicting|portraying)/i;
    if (subjectIndicators.test(text)) return text;
    if (text.split(/\s+/).length < 5) return text;
    return text;
  }
}

export const promptOptimizerService = new PromptOptimizerService();
