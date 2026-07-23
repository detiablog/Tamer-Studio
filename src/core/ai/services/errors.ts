export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly capability?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export class AIImageValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "image_validation_error", "image.validation", cause);
    this.name = "AIImageValidationError";
  }
}

export class AIVideoValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "video_validation_error", "video.validation", cause);
    this.name = "AIVideoValidationError";
  }
}

export class AIChatValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "chat_validation_error", "chat.validation", cause);
    this.name = "AIChatValidationError";
  }
}

export class AIEmbeddingValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "embedding_validation_error", "embedding.validation", cause);
    this.name = "AIEmbeddingValidationError";
  }
}

export class AIModerationValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "moderation_validation_error", "moderation.validation", cause);
    this.name = "AIModerationValidationError";
  }
}

export class AIAudioValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "audio_validation_error", "audio.validation", cause);
    this.name = "AIAudioValidationError";
  }
}

export class AIPromptValidationError extends AIServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "prompt_validation_error", "prompt.validation", cause);
    this.name = "AIPromptValidationError";
  }
}

export class AIGenerationJobError extends AIServiceError {
  constructor(message: string, public readonly jobId?: string, cause?: unknown) {
    super(message, "generation_job_error", undefined, cause);
    this.name = "AIGenerationJobError";
  }
}
