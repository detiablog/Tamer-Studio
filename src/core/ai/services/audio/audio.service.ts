import { BaseAIService } from "../base";
import type { AudioGenerationOptions, AudioTranscriptionOptions, AudioTranscriptionResponse } from "./types";
import { GeneratedAudio } from "../assets";
import type { AssetMetadata } from "../assets";

export class AIServiceAudio extends BaseAIService {
  async generate(
    prompt: string,
    options: AudioGenerationOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<GeneratedAudio> {
    const payload: Record<string, unknown> = {
      prompt,
      voice: options.voice,
      speed: options.speed,
      format: options.format ?? "mp3",
    };

    const result = await this.execute<{
      url: string;
      durationSeconds: number;
      mimeType: string;
      provider: string;
      model: string;
      credits: number;
      cost: number;
      currency: string;
    }>("audio.generate", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Audio generation failed");
    }

    const metadata: AssetMetadata = {
      provider: result.data.provider,
      model: result.data.model,
      prompt,
      duration: result.data.durationSeconds,
      credits: result.data.credits,
      cost: result.data.cost,
      currency: result.data.currency,
      workspaceId: (context.workspaceId as string) ?? "",
      projectId: context.projectId as string | undefined,
      generationId: result.data.url,
      createdAt: new Date().toISOString(),
    };

    return new GeneratedAudio({
      id: result.data.url,
      url: result.data.url,
      durationSeconds: result.data.durationSeconds,
      mimeType: result.data.mimeType,
      metadata,
    });
  }

  async transcribe(
    audioUrl: string,
    options: AudioTranscriptionOptions = {},
    context: Record<string, unknown> = {},
  ): Promise<AudioTranscriptionResponse> {
    const payload: Record<string, unknown> = {
      audioUrl,
      language: options.language,
      format: options.format,
    };

    const result = await this.execute<AudioTranscriptionResponse>("audio.transcribe", payload, context);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Audio transcription failed");
    }

    return result.data;
  }
}
