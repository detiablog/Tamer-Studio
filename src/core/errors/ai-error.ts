export class AIError extends Error {
  constructor(message: string, public code = "AI_ERROR", public provider?: string) {
    super(message);
    this.name = "AIError";
  }
}

export class AIProviderError extends AIError {
  constructor(provider: string, message: string) {
    super(message, "AI_PROVIDER_ERROR", provider);
  }
}

export class AIQuotaExceededError extends AIError {
  constructor(provider: string) {
    super(`AI quota exceeded for ${provider}`, "AI_QUOTA_EXCEEDED", provider);
  }
}
