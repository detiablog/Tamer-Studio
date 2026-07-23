export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
}

export interface TextModerationRequest {
  text: string;
}

export interface ImageModerationRequest {
  imageUrl: string;
}

export interface PromptValidationResult {
  valid: boolean;
  violations: Array<{ category: string; description: string }>;
  riskScore: number;
}
