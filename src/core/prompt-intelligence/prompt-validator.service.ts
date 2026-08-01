import { promptAnalyzerService } from "./prompt-analyzer.service";

export interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  warnings: number;
  errors: number;
}

export class PromptValidatorService {
  async validate(prompt: string, type?: string, availableVariables?: string[]): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    if (!prompt || prompt.trim().length === 0) {
      issues.push({ code: "EMPTY", message: "Prompt cannot be empty.", severity: "error" });
    }

    if (prompt.length > 4000) {
      issues.push({ code: "TOO_LONG", message: "Prompt exceeds 4000 characters.", severity: "warning" });
    }

    const variablePattern = /\{\{\s*([\w.]+)\s*\}\}/g;
    let match;
    while ((match = variablePattern.exec(prompt)) !== null) {
      const key = match[1];
      if (availableVariables && !availableVariables.includes(key)) {
        issues.push({ code: "BROKEN_VARIABLE", message: `Variable '{{${key}}}' is not defined.`, severity: "error" });
      }
    }

    const unsafePatterns = /(nsfw|illegal|harm|exploit|bypass|vulgar)/i;
    if (unsafePatterns.test(prompt)) {
      issues.push({ code: "UNSAFE", message: "Prompt contains potentially unsafe content.", severity: "error" });
    }

    const analysis = await promptAnalyzerService.analyze(prompt, type);
    if (analysis.qualityScore < 40) {
      issues.push({ code: "LOW_QUALITY", message: "Prompt quality score is below 40.", severity: "warning" });
    }

    const errors = issues.filter(i => i.severity === "error").length;
    const warnings = issues.filter(i => i.severity === "warning").length;

    return {
      valid: errors === 0,
      issues,
      warnings,
      errors,
    };
  }
}

export const promptValidatorService = new PromptValidatorService();
